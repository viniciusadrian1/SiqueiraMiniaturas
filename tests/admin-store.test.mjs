import test from 'node:test';
import assert from 'node:assert/strict';
import {CatalogStore,validateCatalog,removeCatalogItem,restoreCatalogItem,purgeTrash} from '../admin/store.js';
const data={categories:[{id:'miniaturas',name:'Miniaturas'}],products:[{id:'real',name:'Peça real',category:'miniaturas',image:'/assets/uploads/real.jpg'}]};
const encoded=Buffer.from(JSON.stringify(data)).toString('base64');
test('default request preserves the browser fetch receiver',async()=>{
 const original=globalThis.fetch;
 try{
  globalThis.fetch=function(){assert.equal(this,globalThis);return Promise.resolve({ok:true,json:async()=>({ok:true})});};
  assert.deepEqual(await new CatalogStore('test-token').api('/test'),{ok:true});
 }finally{globalThis.fetch=original;}
});
function mock({conflict=false,refFailure=false}={}){
 const calls=[];let reads=0;
 const request=async(url,options)=>{
  const path=new URL(url).pathname,body=options.body?JSON.parse(options.body):null;calls.push({path,method:options.method,body});
  let value;
  if(path.endsWith('/git/ref/heads/main'))value={object:{sha:'head-with-unrelated-change'}};
  else if(path.endsWith('/contents/content/catalog.json'))value={sha:conflict&&reads++?'changed':'catalog-sha',content:encoded};
  else if(path.endsWith('/git/commits/head-with-unrelated-change'))value={tree:{sha:'base-tree'}};
  else if(path.endsWith('/git/blobs'))value={sha:'photo-blob'};
  else if(path.endsWith('/git/trees'))value={sha:'new-tree',tree:[{path:'content/catalog.json',sha:'saved-catalog'}]};
  else if(path.endsWith('/git/commits'))value={sha:'new-commit'};
  else if(path.endsWith('/git/refs/heads/main')){if(refFailure)return {ok:false,status:422};value={};}
  else throw new Error(path);
  return {ok:true,json:async()=>value};
 };return {calls,request};
}
test('uploads image and catalog in one commit preserving other files and never force pushing',async()=>{
 const {calls,request}=mock(),store=new CatalogStore('test-token',request);
 assert.deepEqual(await store.load(),data);
 await store.save(data,{path:'assets/uploads/new-photo.jpg',base64:'YWJj'});
 const tree=calls.find(c=>c.path.endsWith('/git/trees')).body;
 assert.equal(tree.base_tree,'base-tree');assert.equal(tree.tree.length,2);assert.equal(tree.tree[1].sha,'photo-blob');
 assert.deepEqual(calls.find(c=>c.path.endsWith('/git/commits')&&c.method==='POST').body.parents,['head-with-unrelated-change']);
 assert.deepEqual(calls.at(-1).body,{sha:'new-commit',force:false});assert.equal(store.sha,'saved-catalog');
});
test('stale catalog rejects before any write, protecting edits from another device',async()=>{
 const {calls,request}=mock({conflict:true}),store=new CatalogStore('test-token',request);await store.load();
 await assert.rejects(()=>store.save(data),/outra janela/);assert.ok(calls.every(c=>c.method==='GET'));
});
test('concurrent branch update fails without changing the saved baseline',async()=>{
 const {request}=mock({refFailure:true}),store=new CatalogStore('test-token',request);await store.load();
 await assert.rejects(()=>store.save(data),/outra janela/);assert.equal(store.sha,'catalog-sha');
});
test('category changes cannot strand existing products',()=>{
 assert.throws(()=>validateCatalog({...data,categories:[]}),/categoria/);
 assert.throws(()=>validateCatalog({...data,products:[data.products[0],data.products[0]]}),/duplicados/);
});

test('multiple photos are committed with the catalog in one branch update',async()=>{
 const {calls,request}=mock(),store=new CatalogStore('test-token',request);await store.load();
 await store.save(data,[{path:'assets/uploads/front.jpg',base64:'YWJj'},{path:'assets/uploads/back.webp',base64:'YWJj'}]);
 assert.equal(calls.filter(c=>c.path.endsWith('/git/blobs')).length,2);
 assert.equal(calls.find(c=>c.path.endsWith('/git/trees')).body.tree.length,3);
 assert.equal(calls.filter(c=>c.method==='PATCH').length,1);
});

test('deletion removes only the selected item without mutating the current catalog',()=>{
 const next=removeCatalogItem(data,'products','real');
 assert.equal(next.products.length,0);assert.equal(data.products.length,1);assert.deepEqual(next.categories,data.categories);
 const empty={categories:[...data.categories,{id:'empty',name:'Empty'}],products:data.products};
 assert.deepEqual(removeCatalogItem(empty,'categories','empty').categories,data.categories);
});
test('linked categories are protected even when their products are hidden',()=>{
 assert.throws(()=>removeCatalogItem({...data,products:[{...data.products[0],published:false}]},'categories','miniaturas'),/vinculados/);
 assert.throws(()=>removeCatalogItem(data,'products','missing'),/não está mais/);
});

test('trash restores complete product data and its original order',()=>{
 const original={...data,products:[{...data.products[0],images:['/assets/uploads/real.jpg','/assets/uploads/back.jpg'],published:false},{...data.products[0],id:'second'}]};
 const trashed=removeCatalogItem(original,'products','real');
 assert.equal(trashed.trash.length,1);assert.equal(trashed.products[0].id,'second');
 const restored=restoreCatalogItem(trashed,trashed.trash[0].id);
 assert.deepEqual(restored.products,original.products);assert.equal(restored.trash.length,0);
});
test('restoring a product recovers its original category from trash when necessary',()=>{
 let trashed=removeCatalogItem(data,'products','real');const id=trashed.trash[0].id;
 trashed=removeCatalogItem(trashed,'categories','miniaturas');
 const restored=restoreCatalogItem(trashed,id);
 assert.deepEqual(restored.products,data.products);assert.deepEqual(restored.categories,data.categories);assert.equal(restored.trash.length,0);
 assert.throws(()=>restoreCatalogItem({...trashed,categories:data.categories,products:data.products},id),/Já existe/);
});

test('permanent removal only affects the selected trash entry',()=>{
 let trashed=removeCatalogItem(data,'products','real');const productId=trashed.trash[0].id;
 trashed=removeCatalogItem(trashed,'categories','miniaturas');
 const purged=purgeTrash(trashed,productId);
 assert.equal(purged.trash.length,1);assert.equal(trashed.trash.length,2);
 assert.throws(()=>restoreCatalogItem(purged,productId),/não está mais/);
 assert.deepEqual(purged.products,trashed.products);assert.deepEqual(purged.categories,trashed.categories);
});
test('category purge protects recoverable products, while emptying removes all trash only',()=>{
 let trashed=removeCatalogItem(data,'products','real');trashed=removeCatalogItem(trashed,'categories','miniaturas');
 const category=trashed.trash.find(e=>e.kind==='categories');
 assert.throws(()=>purgeTrash(trashed,category.id),/precisam desta categoria/);
 const withActive={...trashed,categories:[{id:'other',name:'Other'}],products:[{...data.products[0],id:'active',category:'other'}]};
 const emptied=purgeTrash(withActive,null);
 assert.deepEqual(emptied.trash,[]);assert.deepEqual(emptied.products,withActive.products);assert.deepEqual(emptied.categories,withActive.categories);
 assert.throws(()=>purgeTrash(withActive,'missing'),/não está mais/);
});
