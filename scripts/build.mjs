import path from 'node:path';
import {rm} from 'node:fs/promises';
import {renderProductPage} from '../lib/product-page.js';
import {validateAvailability,validateMercadoLivre} from '../product-data.js';
import {mkdir,cp,readFile,writeFile} from 'node:fs/promises';
import {publicCatalog} from '../catalog-data.js';
const data=JSON.parse(await readFile('content/catalog.json','utf8'));
for(const list of [data.products,data.categories]) {
 if(!Array.isArray(list))throw new Error('Catálogo inválido.');
 const ids=new Set();
 for(const item of list){if(!/^[a-z0-9-]+$/.test(item.id)||ids.has(item.id)||!item.name)throw new Error('Código duplicado ou nome inválido no catálogo.');ids.add(item.id);}
}
for(const p of data.products){validateAvailability(p.availability);validateMercadoLivre(p.mercadoLivreUrl);}
const categories=new Set(data.categories.map(c=>c.id));
for(const p of data.products)if(!categories.has(p.category))throw new Error(`Categoria inexistente: ${p.name}. Reassocie as peças antes de remover uma categoria.`);
await mkdir('dist',{recursive:true});
for(const file of ['index.html','motion.css','hero-refinement.css','showcase.css','responsive.css','motion.js','app.js','catalog.js','catalog-data.js','product-data.js','image-frame.js','product.css','product-gallery.js','assets'])await cp(file,`dist/${file}`,{recursive:true});
await mkdir('dist/admin',{recursive:true});
for(const file of ['index.html','admin.css','admin.js','store.js','settings.js','photo-sort.js','frame-editor.js'])await cp(`admin/${file}`,`dist/admin/${file}`);
await mkdir('dist/content',{recursive:true});
await writeFile('dist/content/catalog.json',JSON.stringify(publicCatalog(data)));
console.log('Site e painel preparados em dist. Produtos ocultos não entram no catálogo público.');

// Only the generated product directory is replaced; source content is untouched.
const outputRoot=path.resolve('dist');
const productRoot=path.resolve(outputRoot,'produto');
if(path.dirname(productRoot)!==outputRoot)throw new Error('Destino inválido.');
await rm(productRoot,{recursive:true,force:true});
for(const product of publicCatalog(data).products){
 const directory=path.join(productRoot,product.id);
 await mkdir(directory,{recursive:true});
 await writeFile(path.join(directory,'index.html'),renderProductPage(product,publicCatalog(data).categories,publicCatalog(data).products));
}
