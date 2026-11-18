import {escapeHTML as esc,imageURL} from './catalog-data.js';
import {savedFrameStyle} from './image-frame.js';
import {productURL,availabilityInfo,productMessage,displayPrice,mercadoLivreURL} from './product-data.js';
import {whatsappURL} from './catalog.js';
import {catalogSections} from './catalog-sections.js';
export function catalogNavigation(active=''){
 return catalogSections.map((s,i)=>`<a href="${s.url}"${active===s.id?' aria-current="page"':''}><sup>0${i+1}</sup> ${s.name}</a>`).join('');
}
export function productCards(products){
 return products.map(p=>`<article class="product-card"><a class="product-art" href="${productURL(p)}" aria-label="Ver detalhes de ${esc(p.name)}"><img class="product-image" style="${savedFrameStyle(p,p.image,'catalog')}" src="/${esc(imageURL(p.image).replace(/^\//,''))}" alt="${esc(p.name)}" loading="lazy">${p.tag?`<span class="product-tag">${esc(p.tag)}</span>`:''}<span class="product-open" aria-hidden="true">Ver detalhes</span></a><div class="product-label"><span>${esc(p.collection||p.label||'SIQUEIRA')}</span></div><a class="product-name" href="${productURL(p)}">${esc(p.name)}</a>${p.subtitle?`<p>${esc(p.subtitle)}</p>`:''}${p.price?`<p class="product-price">${esc(displayPrice(p.price))}</p>`:''}<p class="product-availability">${esc(availabilityInfo(p).title)}</p><div class="product-foot"><a href="${esc(whatsappURL(productMessage(p)))}" target="_blank" rel="noopener noreferrer">${esc(availabilityInfo(p).action)}</a>${mercadoLivreURL(p.mercadoLivreUrl)?`<a class="catalog-marketplace" href="${esc(mercadoLivreURL(p.mercadoLivreUrl))}" target="_blank" rel="noopener noreferrer">Comprar no Mercado Livre</a>`:''}</div></article>`).join('');
}
