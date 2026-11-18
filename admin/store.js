import {validateAvailability,validateMercadoLivre} from '../product-data.js';
import {validateCatalogFields} from '../catalog-sections.js';
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
  for(const photoItem of (Array.isArray(photo)?photo:photo?[photo]:[])){
   const photo=photoItem;
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
 validateCatalogFields(data);
 for(const list of [data.categories,data.products]){
  if(!Array.isArray(list))throw new Error('Catálogo inválido.');
  const ids=new Set();for(const item of list){if(!/^[a-z0-9-]+$/.test(item.id)||ids.has(item.id)||!item.name?.trim())throw new Error('Preencha o nome e confira os itens duplicados.');ids.add(item.id);}
 }
 for(const p of data.products){validateAvailability(p.availability);validateMercadoLivre(p.mercadoLivreUrl);}
 const ids=new Set(data.categories.map(c=>c.id));
 for(const p of data.products)if(!ids.has(p.category)||!p.image)throw new Error('Escolha uma categoria e uma foto para cada produto.');
}
export function newId(name){return (name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,45)||'peca')+'-'+crypto.randomUUID().slice(0,8);}

export function removeCatalogItem(data,kind,id){
 if(!['products','categories'].includes(kind))throw new Error('Tipo de item inválido.');
 if(!data[kind].some(item=>item.id===id))throw new Error('Esse item não está mais no catálogo. Atualize a lista.');
 if(kind==='categories'&&data.products.some(p=>p.category===id))throw new Error('Esta categoria tem produtos vinculados. Mova os produtos para outra categoria ou exclua essas peças antes de apagar a categoria.');
 const next=structuredClone(data),index=next[kind].findIndex(item=>item.id===id),[item]=next[kind].splice(index,1);
 next.trash??=[];next.trash.unshift({id:crypto.randomUUID(),kind,item,index,deletedAt:new Date().toISOString()});return next;
}

export function restoreCatalogItem(data,trashId){
 const next=structuredClone(data),entry=next.trash?.find(item=>item.id===trashId);
 if(!entry||!['products','categories'].includes(entry.kind))throw new Error('Esse item não está mais na lixeira. Atualize a lista.');
 function restore(entry){
  if(next[entry.kind].some(item=>item.id===entry.item.id))throw new Error('Já existe um cadastro com este código. Atualize a lista antes de restaurar.');
  next[entry.kind].splice(Math.min(entry.index??0,next[entry.kind].length),0,entry.item);
  next.trash=next.trash.filter(item=>item.id!==entry.id);
 }
 if(entry.kind==='products'&&!next.categories.some(c=>c.id===entry.item.category)){
  const category=next.trash.find(e=>e.kind==='categories'&&e.item.id===entry.item.category);
  if(!category)throw new Error('A categoria original não foi encontrada. Restaure a categoria antes de recuperar esta peça.');
  restore(category);
 }
 restore(entry);validateCatalog(next);return next;
}

export function purgeTrash(data,id){
 const next=structuredClone(data),trash=next.trash||[];
 if(id===null){next.trash=[];return next;}
 const entry=trash.find(e=>e.id===id);
 if(!entry)throw new Error('Esse item não está mais na lixeira. Atualize a lista.');
 if(entry.kind==='categories'&&!next.categories.some(c=>c.id===entry.item.id)&&trash.some(e=>e.kind==='products'&&e.item.category===entry.item.id))throw new Error('Há produtos na lixeira que precisam desta categoria para serem restaurados. Restaure a categoria ou exclua definitivamente esses produtos primeiro.');
 next.trash=trash.filter(e=>e.id!==id);return next;
}
