import {savedFrameStyle} from './image-frame.js';
import { filterProducts,mercadoLivreURL,productURL,availabilityInfo,productMessage,displayPrice } from './product-data.js';
import { whatsappURL } from './catalog.js';
import { escapeHTML as esc, imageURL, publicCatalog } from './catalog-data.js';
let products = [];
let categories = [];

const icons = {
  chat: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/><path d="M9 8c0 4 3 7 7 7l1-2-3-1-1 1-2-2 1-1-1-3Z"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',
  box: '<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 5v10l9 5 9-5V8M12 13v10M7 5.8l9 5V15"/>',
  spark: '<path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6L12 3Z"/>',
  flag: '<path d="M5 22V3m0 1c5-4 9 4 14 0v10c-5 4-9-4-14 0"/><path d="M10 3v10m5-9v10M5 9c5-4 9 4 14 0"/>'
};
function icon(name) { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || ''}</svg>`; }
document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
document.querySelectorAll('.contact-link').forEach(el => { el.href = whatsappURL('Olá! Vim pelo site da Siqueira Miniaturas e gostaria de conhecer os produtos disponíveis.'); });
document.querySelectorAll('.custom-contact').forEach(el => { el.href = whatsappURL('Olá! Vim pelo site da Siqueira Miniaturas e gostaria de conversar sobre uma peça personalizada.'); });
document.querySelector('#year').textContent = new Date().getFullYear();

let category = 'all';
let expanded = false;
const search = document.querySelector('#search');
const grid = document.querySelector('#products');
const more = document.querySelector('#show-more');
function art(product, extraClass = '') {
  const label = esc(`${product.illustrative ? 'Imagem ilustrativa: ' : ''}${product.name}`);
  const src = imageURL(product.image);
  return /^(0|100)% (0|100)%$/.test(product.imagePosition || '')
    ? `<div class="product-image sheet ${extraClass}" role="img" aria-label="${label}" style="background-image:url('${src}');background-position:${product.imagePosition}"></div>`
    : `<img class="product-image ${extraClass}" style="${savedFrameStyle(product,product.image,'catalog')}" src="${src}" alt="${label}" loading="lazy">`;
}
function render() {
  document.querySelectorAll('[data-availability]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.availability===document.querySelector('#filter-availability').value)));
  const matches=filterProducts(products,{query:search.value,category,availability:document.querySelector('#filter-availability').value,driver:document.querySelector('#filter-driver').value,team:document.querySelector('#filter-team').value,scale:document.querySelector('#filter-scale').value});
  const shown = expanded ? matches : matches.slice(0, 4);
  grid.innerHTML = shown.map(p => `<article class="product-card"><a class="product-art" href="${productURL(p)}" aria-label="Ver detalhes de ${esc(p.name)}">${art(p)}${p.tag ? `<span class="product-tag">${esc(p.tag)}</span>` : ''}<span class="product-open" aria-hidden="true">Ver detalhes</span><span class="product-swatch" style="--swatch:#ec3b30" aria-hidden="true"></span></a><div class="product-label"><span>${esc(p.label)}</span><span>Nº ${String(products.indexOf(p) + 1).padStart(2, '0')}</span></div><a class="product-name" href="${productURL(p)}">${esc(p.name)}</a><p>${esc(p.subtitle)}</p>${p.price ? `<p class="product-price">${esc(displayPrice(p.price))}</p>` : ''}<p class="product-availability">${esc(availabilityInfo(p).title)}</p><div class="product-foot"><a href="${whatsappURL(productMessage(p))}" target="_blank" rel="noopener noreferrer" aria-label="Consultar ${esc(p.name)} pelo WhatsApp">${esc(availabilityInfo(p).action)}</a>${mercadoLivreURL(p.mercadoLivreUrl)?`<a class="catalog-marketplace" href="${esc(mercadoLivreURL(p.mercadoLivreUrl))}" target="_blank" rel="noopener noreferrer">Comprar no Mercado Livre</a>`:''}</div></article>`).join('');
  document.querySelector('#results-count').textContent = `${String(shown.length).padStart(2, '0')} de ${String(matches.length).padStart(2, '0')} peças`;
  document.querySelector('#empty').hidden = matches.length > 0;
  document.querySelector('#empty h3').textContent = products.length ? 'Nenhuma peça por aqui.' : 'A próxima peça da sua coleção está chegando.';
  document.querySelector('#empty p').textContent = products.length ? 'Tente outro termo ou explore todas as categorias.' : 'Estamos preparando o catálogo. Enquanto isso, consulte as peças pelo WhatsApp.';
  document.querySelector('#reset-search').hidden = !products.length;
  document.querySelector('.catalog-toolbar').hidden = !products.length;
  document.querySelector('.catalog-meta').hidden = !products.length;
  document.querySelector('.catalog-refine').hidden=!products.length;document.querySelector('.availability-tabs').hidden=!products.length;
  more.hidden = matches.length <= 4;
  more.textContent = expanded ? 'Mostrar menos' : 'Ver mais peças';
}
document.querySelector('.filters').addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  category = button.dataset.category; expanded = false;
  document.querySelectorAll('.filter').forEach(el => { const selected = el === button; el.classList.toggle('active', selected); el.setAttribute('aria-pressed', String(selected)); });
  render();
});
document.querySelector('.availability-tabs').addEventListener('click',event=>{const button=event.target.closest('[data-availability]');if(!button)return;document.querySelector('#filter-availability').value=button.dataset.availability;expanded=false;render();});
document.querySelectorAll('.refine-fields select').forEach(select=>select.addEventListener('change',()=>{expanded=false;render();}));
search.addEventListener('input', () => { expanded = false; render(); });
more.addEventListener('click', () => { expanded = !expanded; render(); });
document.querySelector('#reset-search').addEventListener('click', () => { search.value = ''; document.querySelectorAll('.refine-fields select').forEach(s=>s.selectedIndex=0); document.querySelector('[data-category="all"]').click(); search.focus(); });
async function loadCatalog() {
  grid.setAttribute('aria-busy', 'true');
  more.hidden = true;
  try {
    const response = await fetch('/content/catalog.json', {cache:'no-cache'});
    if (!response.ok) throw new Error('Catalog unavailable');
    ({products, categories} = publicCatalog(await response.json()));
    document.querySelector('.filters').innerHTML = [{id:'all',name:'Todas as peças'}, ...categories].map(c => `<button class="filter ${c.id === 'all' ? 'active' : ''}" data-category="${esc(c.id)}" aria-pressed="${c.id === 'all'}">${esc(c.name)}</button>`).join('');
    document.querySelector('.catalog-meta p').textContent = products.some(p => p.illustrative) ? 'Inclui imagens ilustrativas. Valores e disponibilidade pelo WhatsApp.' : 'Valores e disponibilidade pelo WhatsApp.';
    for(const key of ['driver','team','scale']){
      const labels={driver:'Todos os pilotos',team:'Todas as equipes',scale:'Todas as escalas'};
      const values=[...new Set(products.map(p=>p[key]?.trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR',{numeric:true}));
      document.querySelector('#filter-'+key).innerHTML=`<option value="">${labels[key]}</option>`+values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
    }
    const prints=products.filter(p=>p.isPrint===true);
    document.querySelector('#print-gallery').innerHTML=prints.map(p=>`<article class="print-card"><a href="${productURL(p)}"><span class="print-image"><img style="${savedFrameStyle(p,p.image,'gallery')}" src="${imageURL(p.image)}" alt="${esc(p.name)}" loading="lazy"></span><h3>${esc(p.name)}</h3></a>${p.subtitle?`<p>${esc(p.subtitle)}</p>`:''}<a class="print-inquiry" href="${whatsappURL(`Olá! Gostei da estampa ${p.name} no site da Siqueira. Quero conversar sobre uma personalização com essa ideia. https://siqueiraminiaturas.vercel.app${productURL(p)}`)}" target="_blank" rel="noopener noreferrer">Quero personalizar com esta estampa</a></article>`).join('');
    document.querySelector('#prints-empty').hidden=prints.length>0;
    category = 'all';
    render();
  } catch {
    grid.innerHTML = '<p>O catálogo não carregou. <button id="retry-catalog" class="button button-outline">Tentar novamente</button></p>';
    document.querySelector('#retry-catalog').addEventListener('click', loadCatalog);
    document.querySelector('#results-count').textContent = '';
  } finally { grid.removeAttribute('aria-busy'); }
}
loadCatalog();
