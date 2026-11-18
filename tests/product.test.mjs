import test from 'node:test';
import assert from 'node:assert/strict';
import {filterProducts,relatedProducts,mercadoLivreURL,validateMercadoLivre,productImages,availabilityInfo,validateAvailability,productURL,productMessage} from '../product-data.js';
import {renderProductPage} from '../lib/product-page.js';
const product={id:'rb22-mc',name:'Miniatura especial',image:'/assets/uploads/real.jpg',category:'miniaturas',tag:'Edição Limitada',detail:'Detalhes da peça.\nSegunda linha.'};
test('existing products never gain an invented ready-to-ship promise',()=>assert.equal(availabilityInfo(product).status,'consult'));
test('incoming products expose estimates and reservation messages without confirming a reservation',()=>{
 const p={...product,availability:{status:'incoming',mode:'days',days:30}};
 assert.equal(availabilityInfo(p).estimate,'Previsão: em até 30 dias.');assert.equal(availabilityInfo(p).action,'Quero reservar');
 assert.match(productMessage(p),/confirmar a previsão/);assert.match(productMessage(p),/\/produto\/rb22-mc\//);
});
test('dates are exact and past estimates invite confirmation, not a delivery promise',()=>{
 const p={...product,availability:{status:'incoming',mode:'date',date:'2026-12-02'}};
 assert.match(availabilityInfo(p,'2026-11-17').estimate,/02\/12\/2026/);
 assert.match(availabilityInfo(p,'2026-12-03').estimate,/atualização/);
 assert.throws(()=>validateAvailability({...p.availability,date:'2026-02-30'}));
 assert.throws(()=>validateAvailability({status:'incoming',mode:'days',days:0}));
});
test('product page has a durable URL, visible tag, description, and escaped user content',()=>{
 const html=renderProductPage({...product,name:'<img onerror=alert(1)>',tag:'<script>bad</script>'},[{id:'miniaturas',name:'Miniaturas'}]);
 assert.equal(productURL(product),'/produto/rb22-mc/');assert.match(html,/class="product-tag"/);assert.match(html,/Detalhes da peça/);
 assert.ok(!html.includes('<script>bad'));assert.match(html,/&lt;img/);assert.ok(!html.includes('<dialog'));
});

test('gallery preserves legacy cover and renders all additional photos with navigation',()=>{
 assert.deepEqual(productImages(product),[product.image]);
 const p={...product,images:[product.image,'/assets/uploads/back.webp','/assets/uploads/side.jpg']};
 const html=renderProductPage(p,[]);
 assert.equal((html.match(/class="gallery-slide"/g)||[]).length,3);
 assert.match(html,/data-gallery-next/);assert.match(html,/foto 3 de 3/);
 assert.deepEqual(productImages({...p,images:[product.image,product.image]}),[product.image]);
});

test('Mercado Livre links are optional and restricted to real HTTPS marketplace hosts',()=>{
 const url='https://produto.mercadolivre.com.br/MLB-123-peca?variation=1&quantity=1';
 assert.equal(mercadoLivreURL(url),url);assert.doesNotThrow(()=>validateMercadoLivre(''));
 for(const unsafe of ['javascript:alert(1)','https://mercadolivre.com.br.evil.example/item','https://mercadolivre.com.br@evil.example/item','http://produto.mercadolivre.com.br/item','https://user:pass@mercadolivre.com.br/item','https://mercadolivre.com.br:8443/item']){
  assert.equal(mercadoLivreURL(unsafe),'');assert.throws(()=>validateMercadoLivre(unsafe),/link HTTPS/);
 }
 const html=renderProductPage({...product,mercadoLivreUrl:url},[]);
 assert.match(html,/Comprar no Mercado Livre/);assert.match(html,/variation=1&amp;quantity=1/);
 assert.ok(!renderProductPage(product,[]).includes('Comprar no Mercado Livre'));
 assert.ok(!renderProductPage({...product,mercadoLivreUrl:'javascript:alert(1)'},[]).includes('Comprar no Mercado Livre'));
});

test('catalog search combines pilot, team, scale and availability without changing order',()=>{
 const products=[{...product,id:'a',driver:'Ayrton Senna',team:'McLaren',scale:'1:43',availability:{status:'ready'}},{...product,id:'b',detail:'Max Verstappen · Red Bull · Escala 1:43',availability:{status:'incoming'}}];
 assert.deepEqual(filterProducts(products,{query:'senna 1/43',team:'McLaren',availability:'ready'}).map(p=>p.id),['a']);
 assert.deepEqual(filterProducts(products,{query:'verstappen 1/43',availability:'incoming'}).map(p=>p.id),['b']);
 assert.equal(filterProducts(products,{query:'senna',availability:'incoming'}).length,0);
});
test('related products exclude self and unpublished pieces, prioritizing shared pilot',()=>{
 const p={...product,driver:'Senna'};
 const others=[p,{...product,id:'same-category'},{...product,id:'same-pilot',driver:'Senna'},{...product,id:'hidden',published:false,driver:'Senna'}];
 assert.deepEqual(relatedProducts(p,others).map(p=>p.id),['same-pilot','same-category']);
 assert.match(renderProductPage(p,[],others),/Também podem te conquistar/);
});
