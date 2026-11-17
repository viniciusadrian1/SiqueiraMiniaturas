import {adminSettings} from './settings.js';
export class CatalogStore {
 constructor(token,request=(...args)=>globalThis.fetch(...args)){this.token=token;this.request=request;this.base=`https://api.github.com/repos/${adminSettings.repo}`;}
 async api(path,method='GET',body){
  const response=await this.request(this.base+path,{method,headers:{Authorization:`Bearer ${this.token}`,Accept:'application/vnd.github+json','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store',signal:AbortSignal.timeout(30000)});
  if(!response.ok){const error=new Error(response.status===401?'Sua sessão expirou. Entre novamente.':response.status===409||response.status===422?'O catálogo mudou em outra janela. Recarregue antes de salvar.':'Não foi possível concluir. Confira sua conexão e tente novamente.');error.status=response.status;throw error;}
  return response.json();
 }
 async snapshot(){
  const ref=await this.api(`/git/ref/heads/${adminSettings.branch}`),head=ref.object.sha;
  const file=await this.api(`/contents/content/catalog.json?ref=${head}`);
  return {head,sha:file.sha,data:JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\s/g,'')),c=>c.charCodeAt(0))))};
 }
 async load(){const snap=await this.snapshot();this.sha=snap.sha;return snap.data;}
 async save(data,photo){
  validateCatalog(data);const current=await this.snapshot();
  if(current.sha!==this.sha)throw new Error('O catálogo mudou em outra janela. Recarregue antes de salvar para preservar as alterações.');
  const parent=await this.api(`/git/commits/${current.head}`);
  const tree=[{path:'content/catalog.json',mode:'100644',type:'blob',content:JSON.stringify(data,null,2)+'\n'}];
  if(photo){
   if(!/^assets\/uploads\/[a-z0-9-]+\.(jpg|png|webp)$/.test(photo.path))throw new Error('Nome de foto inválido.');
   const blob=await this.api('/git/blobs','POST',{content:photo.base64,encoding:'base64'});
   tree.push({path:photo.path,mode:'100644',type:'blob',sha:blob.sha});
  }
  const next=await this.api('/git/trees','POST',{base_tree:parent.tree.sha,tree});
  const commit=await this.api('/git/commits','POST',{message:'Atualiza catálogo pelo painel Siqueira',tree:next.sha,parents:[current.head]});
  await this.api(`/git/refs/heads/${adminSettings.branch}`,'PATCH',{sha:commit.sha,force:false});
  this.sha=next.tree.find(item=>item.path==='content/catalog.json')?.sha;
  return commit.sha;
 }
}
export function validateCatalog(data){
 for(const list of [data.categories,data.products]){
  if(!Array.isArray(list))throw new Error('Catálogo inválido.');
  const ids=new Set();for(const item of list){if(!/^[a-z0-9-]+$/.test(item.id)||ids.has(item.id)||!item.name?.trim())throw new Error('Preencha o nome e confira os itens duplicados.');ids.add(item.id);}
 }
 const ids=new Set(data.categories.map(c=>c.id));
 for(const p of data.products)if(!ids.has(p.category)||!p.image)throw new Error('Escolha uma categoria e uma foto para cada produto.');
}
export function newId(name){return (name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,45)||'peca')+'-'+crypto.randomUUID().slice(0,8);}
