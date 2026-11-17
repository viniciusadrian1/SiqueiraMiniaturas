import {mkdir,cp,readFile,writeFile} from 'node:fs/promises';
import {publicCatalog} from '../catalog-data.js';
const data=JSON.parse(await readFile('content/catalog.json','utf8'));
for(const list of [data.products,data.categories]) {
 if(!Array.isArray(list))throw new Error('Catálogo inválido.');
 const ids=new Set();
 for(const item of list){if(!/^[a-z0-9-]+$/.test(item.id)||ids.has(item.id)||!item.name)throw new Error('Código duplicado ou nome inválido no catálogo.');ids.add(item.id);}
}
const categories=new Set(data.categories.map(c=>c.id));
for(const p of data.products)if(!categories.has(p.category))throw new Error(`Categoria inexistente: ${p.name}. Reassocie as peças antes de remover uma categoria.`);
await mkdir('dist',{recursive:true});
for(const file of ['index.html','motion.css','hero-refinement.css','showcase.css','responsive.css','motion.js','app.js','catalog.js','catalog-data.js','assets'])await cp(file,`dist/${file}`,{recursive:true});
await mkdir('dist/admin',{recursive:true});
for(const file of ['index.html','admin.css','admin.js','store.js','settings.js'])await cp(`admin/${file}`,`dist/admin/${file}`);
await mkdir('dist/content',{recursive:true});
await writeFile('dist/content/catalog.json',JSON.stringify(publicCatalog(data)));
console.log('Site e painel preparados em dist. Produtos ocultos não entram no catálogo público.');
