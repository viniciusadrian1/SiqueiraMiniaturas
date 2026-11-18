import {catalogSections,sectionCatalog} from './catalog-sections.js';
import {escapeHTML as esc,imageURL} from './catalog-data.js';
import {savedFrameStyle} from './image-frame.js';
import {whatsappURL} from './catalog.js';
const chat='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z"/><path d="M9 8c0 4 3 7 7 7l1-2-3-1-1 1-2-2 1-1-1-3Z"/></svg>';
document.querySelectorAll('[data-icon="chat"]').forEach(el=>el.innerHTML=chat);
document.querySelectorAll('.contact-link').forEach(el=>el.href=whatsappURL('Olá! Vim pelo site da Siqueira Miniaturas e gostaria de conhecer os produtos disponíveis.'));
document.querySelector('#year').textContent=new Date().getFullYear();
async function loadPortals(){
 try{
  const response=await fetch('/content/catalog.json',{cache:'no-cache'});if(!response.ok)throw Error();const data=await response.json();
  document.querySelector('#catalog-portals').innerHTML=catalogSections.map((s,i)=>{
   const products=sectionCatalog(data,s.id).products,p=products[0];
   const src=p?'/'+imageURL(p.image).replace(/^\//,''):s.id==='miniaturas'?'/assets/brand/favicon.svg':s.image;
   return `<a class="catalog-portal" href="${s.url}"><span class="portal-image"><img src="${esc(src)}" style="${p?savedFrameStyle(p,p.image,'catalog'):''}" alt="${esc(p?.name||s.name)}" loading="lazy"></span><span class="portal-meta"><span>0${i+1} / ${s.name}</span><span>${products.length?`${products.length} ${products.length===1?'peça':'peças'}`:'Novas ideias em breve'}</span></span><h3>${s.name}</h3><p>${({miniaturas:'Grandes histórias em outra escala.',vestuario:'Seu piloto. Sua coleção. Seu estilo.',personalizados:'Presentes, brindes e ideias com a sua cara.'})[s.id]}</p><span class="portal-action">Explorar ${s.name.toLocaleLowerCase('pt-BR')}</span></a>`;
  }).join('');
 }catch{/* Keep the three working navigation links when the catalog is unavailable. */}
}
loadPortals();
