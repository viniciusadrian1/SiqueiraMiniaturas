import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogSections,categorySection,sectionCatalog,sectionURL,filterOptions} from '../catalog-sections.js';
import {filterProducts} from '../product-data.js';
import {renderCatalogPage} from '../lib/catalog-page.js';
import {validateCatalog} from '../admin/store.js';
const data={categories:[{id:'miniaturas',name:'Miniaturas'},{id:'roupas',name:'Roupas'},{id:'personalizados',name:'Personalizados'},{id:'bones',name:'Bonés',section:'vestuario'},{id:'ocultos',name:'Ocultos',section:'vestuario',visible:false}],products:[{id:'mini',name:'Miniatura',category:'miniaturas',image:'/assets/a.png',driver:'Senna',team:'McLaren',scale:'1:43'},{id:'tee',name:'Camiseta',category:'roupas',image:'/assets/b.png',driver:'Senna',collection:'The Eras Tour'},{id:'cap',name:'Boné',category:'bones',image:'/assets/c.png',collection:'The Eras Tour'},{id:'gift',name:'Caneca',category:'personalizados',image:'/assets/d.png'},{id:'hidden',name:'Oculto',category:'ocultos',image:'/assets/e.png'},{id:'draft',name:'Rascunho',category:'roupas',image:'/assets/f.png',published:false}]};
test('sections isolate legacy and custom categories, excluding hidden products',()=>{
 assert.deepEqual(catalogSections.map(s=>s.id),['miniaturas','vestuario','personalizados']);
 assert.equal(categorySection(data.categories[1]),'vestuario');
 assert.equal(sectionURL('roupas',data.categories),'/vestuario/');
 assert.deepEqual(sectionCatalog(data,'vestuario').products.map(p=>p.id),['tee','cap']);
 assert.deepEqual(sectionCatalog(data,'personalizados').products.map(p=>p.id),['gift']);
 assert.equal(sectionCatalog(data,'missing').products.length,0);
});
test('collection, pilot and search combine without changing product order',()=>{
 const products=sectionCatalog(data,'vestuario').products;
 assert.deepEqual(filterProducts(products,{collection:'the eras tour',driver:'Senna'}).map(p=>p.id),['tee']);
 assert.deepEqual(filterProducts(products,{query:'eras tour'}).map(p=>p.id),['tee','cap']);
 assert.deepEqual(filterOptions([...products,{collection:'the eras tour'},{collection:'  Outra coleção  '}],'collection'),['Outra coleção','The Eras Tour']);
 assert.equal(filterProducts(products,{category:'miniaturas'}).length,0);
});
test('dedicated HTML contains only its section and safe collection filters',()=>{
 for(const id of ['miniaturas','vestuario','personalizados']){
  const html=renderCatalogPage(id,data);
  assert.match(html,new RegExp(`data-catalog-section="${id}"`));
  assert.match(html,/href="\/miniaturas\/"/);assert.match(html,/href="\/vestuario\/"/);assert.match(html,/href="\/personalizados\/"/);
  assert.match(html,/id="filter-collection"/);
  assert.ok(!html.includes('/produto/hidden/'));assert.ok(!html.includes('/produto/draft/'));
  if(id==='vestuario'){assert.match(html,/\/produto\/tee\//);assert.ok(!html.includes('/produto/mini/'));assert.ok(!html.includes('id="filter-scale"'));}
 }
 assert.throws(()=>renderCatalogPage('unknown',data));
 const html=renderCatalogPage('vestuario',{...data,products:[{...data.products[1],collection:'<script>bad</script>'}]});
 assert.ok(!html.includes('<script>bad</script>'));assert.match(html,/&lt;script&gt;/);
});
test('admin validates section and collection without breaking old catalogs',()=>{
 assert.doesNotThrow(()=>validateCatalog(data));
 assert.throws(()=>validateCatalog({...data,categories:[{id:'a',name:'A',section:'invalid'}]}),/área/i);
 assert.throws(()=>validateCatalog({...data,products:[{...data.products[0],collection:{bad:true}}]}),/coleção/i);
});
