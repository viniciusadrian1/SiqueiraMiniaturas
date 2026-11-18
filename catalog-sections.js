import {publicCatalog} from './catalog-data.js';
import {normalizeSearch} from './product-data.js';
export const catalogSections=[
 {id:'miniaturas',name:'Miniaturas',url:'/miniaturas/',kicker:'A emoção em cada detalhe.',title:'Grandes histórias.<br>Na sua <em>coleção.</em>',description:'Encontre a próxima peça da sua garagem. Explore por piloto, equipe ou escala.',empty:'Estamos preparando as próximas miniaturas.',image:'/assets/collection-editorial.png'},
 {id:'vestuario',name:'Vestuário',url:'/vestuario/',kicker:'Seu estilo também entra no grid.',title:'A sua paixão.<br>Pronta para <em>vestir.</em>',description:'Camisetas e outras peças para levar as pistas com você. Encontre seu piloto ou explore uma coleção.',empty:'O próximo lançamento está a caminho.',image:'/assets/personalizados-editorial.png'},
 {id:'personalizados',name:'Personalizados',url:'/personalizados/',kicker:'Uma ideia. A sua identidade.',title:'O grid é o mesmo.<br>O estilo é <em>seu.</em>',description:'Presentes, brindes e peças feitas com a sua cara. Explore as opções ou conte a sua ideia para a gente.',empty:'Sua ideia pode ser a próxima a ganhar forma.',image:'/assets/personalizados-editorial.png'}
];
export function categorySection(category){
 if(!category)return '';
 if(catalogSections.some(s=>s.id===category.section))return category.section;
 return {miniaturas:'miniaturas',roupas:'vestuario',vestuario:'vestuario',personalizados:'personalizados'}[category.id]||'miniaturas';
}
export function sectionURL(categoryId,categories=[]){return catalogSections.find(s=>s.id===categorySection(categories.find(c=>c.id===categoryId)||{id:categoryId}))?.url||'/miniaturas/';}
export function sectionCatalog(data,section){
 const catalog=publicCatalog(data),categories=catalog.categories.filter(c=>categorySection(c)===section),ids=new Set(categories.map(c=>c.id));
 return {categories,products:catalog.products.filter(p=>ids.has(p.category))};
}
export function filterOptions(products,key){
 const values=new Map();
 for(const p of products){const value=typeof p[key]==='string'?p[key].trim():'';if(value&&!values.has(normalizeSearch(value)))values.set(normalizeSearch(value),value);}
 return [...values.values()].sort((a,b)=>a.localeCompare(b,'pt-BR',{numeric:true}));
}
export function validateCatalogFields(data){
 for(const c of data.categories||[])if(c.section!==undefined&&!catalogSections.some(s=>s.id===c.section))throw new Error('Escolha uma área válida para a categoria.');
 for(const p of data.products||[])if(p.collection!==undefined&&(typeof p.collection!=='string'||p.collection.length>100))throw new Error('Informe uma coleção com até 100 caracteres.');
}
