import {sectionCatalog,filterOptions} from './catalog-sections.js';
import {filterProducts} from './product-data.js';
import {productCards} from './catalog-ui.js';
import {escapeHTML as esc} from './catalog-data.js';
const $=s=>document.querySelector(s),section=document.body.dataset.catalogSection;
const fields={query:'catalog-query',driver:'filter-driver',team:'filter-team',collection:'filter-collection',scale:'filter-scale',category:'filter-category',availability:'filter-availability'};
const params={query:'q',driver:'piloto',team:'equipe',collection:'colecao',scale:'escala',category:'categoria',availability:'disponibilidade'};
const names={query:'Busca',driver:'Piloto',team:'Equipe',collection:'Coleção',scale:'Escala',category:'Categoria',availability:'Disponibilidade'};
let products=[],loaded=false,limit=12;
const emptyHeading=$('#catalog-empty h2').textContent,emptyCopy=$('#catalog-empty>p:not(.section-kicker)').textContent;
function read(){return Object.fromEntries(Object.entries(fields).map(([key,id])=>[key,$('#'+id)?.value||(key==='category'||key==='availability'?'all':'')]));}
function active(state){return Object.entries(state).filter(([,v])=>v&&v!=='all');}
function restoreURL(){
 const query=new URLSearchParams(location.search);
 for(const [key,id] of Object.entries(fields)){const el=$('#'+id);if(!el)continue;const value=query.get(params[key])||(key==='category'||key==='availability'?'all':'');el.value=value;if(el instanceof HTMLSelectElement&&el.selectedIndex<0)el.selectedIndex=0;}
}
function render(sync=true){
 $('#catalog-filters').hidden=!products.length;$('.catalog-results-line').hidden=!products.length;
 const state=read(),selected=active(state),matches=filterProducts(products,state),shown=matches.slice(0,limit);
 $('#catalog-products').innerHTML=productCards(shown);
 $('#catalog-count').textContent=`${matches.length} ${matches.length===1?'peça encontrada':'peças encontradas'}${shown.length<matches.length?` · mostrando ${shown.length}`:''}`;
 $('#clear-filters').hidden=!selected.length;$('#active-filters').hidden=!selected.length;
 $('#active-filters').innerHTML=selected.map(([key,value])=>{const el=$('#'+fields[key]),label=el instanceof HTMLSelectElement?el.selectedOptions[0]?.textContent:value;return `<button type="button" data-clear="${key}" aria-label="Remover filtro ${esc(names[key])}: ${esc(label)}">${esc(names[key])}: ${esc(label)} <span aria-hidden="true">×</span></button>`;}).join('');
 $('#catalog-empty').hidden=matches.length>0;
 $('#catalog-empty h2').textContent=products.length?'Nenhuma peça com essa combinação.':emptyHeading;
 $('#catalog-empty>p:not(.section-kicker)').textContent=products.length?'Remova um filtro ou tente outra busca para encontrar sua próxima favorita.':emptyCopy;
 $('#empty-clear').hidden=!selected.length;$('#catalog-more').hidden=shown.length>=matches.length;
 if(sync){const url=new URL(location.href);for(const key of Object.keys(params)){const value=state[key];if(value&&value!=='all')url.searchParams.set(params[key],value);else url.searchParams.delete(params[key]);}history.replaceState(null,'',url.pathname+url.search+url.hash);}
}
function clear(){for(const [key,id] of Object.entries(fields)){const el=$('#'+id);if(el)el.value=key==='category'||key==='availability'?'all':'';}limit=12;render();}
$('#catalog-filters').addEventListener('submit',e=>{e.preventDefault();if(loaded)render();});
$('#catalog-filters').addEventListener('input',()=>{if(loaded){limit=12;render();}});
$('#catalog-filters').addEventListener('change',()=>{if(loaded){limit=12;render();}});
$('#clear-filters').onclick=clear;$('#empty-clear').onclick=clear;
$('#active-filters').onclick=e=>{const key=e.target.closest('[data-clear]')?.dataset.clear;if(!fields[key])return;$('#'+fields[key]).value=key==='category'||key==='availability'?'all':'';limit=12;render();};
$('#catalog-more').onclick=()=>{limit+=12;render();};
window.addEventListener('popstate',()=>{if(loaded){restoreURL();limit=12;render(false);}});
async function load(){
 $('#catalog-products').setAttribute('aria-busy','true');$('#catalog-error').hidden=true;
 try{
  const r=await fetch('/content/catalog.json',{cache:'no-cache'});if(!r.ok)throw Error();
  const catalog=sectionCatalog(await r.json(),section);products=catalog.products;
  for(const key of ['driver','team','collection','scale']){const el=$('#'+fields[key]);if(!el)continue;const first=el.options[0].textContent;el.innerHTML=`<option value="">${esc(first)}</option>`+filterOptions(products,key).map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');}
  const category=$('#filter-category');if(category)category.innerHTML='<option value="all">Todas as categorias</option>'+catalog.categories.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  loaded=true;restoreURL();render();
 }catch{$('#catalog-error').hidden=false;}finally{$('#catalog-products').removeAttribute('aria-busy');}
}
$('#catalog-retry').onclick=load;load();
