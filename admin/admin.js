import {categorySection,catalogSections,filterOptions} from '../catalog-sections.js';
import {createFrameEditor} from './frame-editor.js';
import {frameKey,frameStyle,savedFrameStyle} from '../image-frame.js';
import {photoSort} from './photo-sort.js';
import {productImages} from '../product-data.js';
import {validateMercadoLivre,validateAvailability,availabilityInfo} from '../product-data.js';
import {CatalogStore,newId,removeCatalogItem,restoreCatalogItem,purgeTrash} from './store.js';
import {escapeHTML as esc,imageURL,publicCatalog} from '../catalog-data.js';
const $=selector=>document.querySelector(selector),form=$('#product-form');
const preview=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).has('preview');
let store,data={categories:[],products:[]},view='products',editing=null,editingCategory=null,photo=null,photos=[],dirty=false,busy=false,photoLoading=false,popup=null,poll=0,pendingDelete=null;
const localPhotos=new Map();
const frameEditor=createFrameEditor({canEdit:()=>!busy&&!photoLoading,onApply:(photo,frames)=>{photo.frames=frames;dirty=true;renderPhotos();$('#save-hint').textContent='Enquadramento ajustado. Salve o produto para publicar.';}});
const price=value=>value?(String(value).startsWith('R$')?value:`R$ ${value}`):'Preço sob consulta';
function notice(message,error=false){$('#notice').hidden=false;$('#notice').textContent=message;$('#notice').classList.toggle('error',error);}
function image(path){return localPhotos.get(path)||('/'+imageURL(path).replace(/^\//,''));}
function showWorkspace(){ $('#login').hidden=true;$('#workspace').hidden=false;$('#preview-notice').hidden=!preview;list(); }
function render(){
 $('#empty-trash').hidden=view!=='trash'||!(data.trash||[]).length;
 $('#nav-count').textContent=data.products.length;
 if(view==='trash'){
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('selected',b.dataset.view===view));
  $('#page-title').innerHTML='Sua lixeira<span>.</span>';$('#page-description').textContent='Recupere produtos e categorias enviados para cá.';
  $('#add-item').hidden=true;$('#visibility').hidden=true;$('#search').placeholder='Buscar na lixeira…';
  $('#product-order-hint').hidden=false;$('#product-order-hint').textContent='Restaurar devolve o cadastro, as fotos e a posição original. Se necessário, a categoria da peça também será recuperada.';
  const query=$('#search').value.toLocaleLowerCase('pt-BR');
  $('#items').innerHTML=(data.trash||[]).filter(e=>e.item.name.toLocaleLowerCase('pt-BR').includes(query)).map(e=>`<article class="category-card trash-card"><div class="category-info"><span class="trash-kind">${e.kind==='products'?'Produto':'Categoria'}</span><h2>${esc(e.item.name)}</h2><p>Enviado à lixeira em ${esc(new Date(e.deletedAt).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'}))}</p></div><div class="trash-actions"><button class="secondary" data-restore="${esc(e.id)}">Restaurar</button><button class="danger-quiet" data-purge="${esc(e.id)}" aria-label="Excluir definitivamente ${esc(e.item.name)}">Excluir definitivamente</button></div></article>`).join('')||'<div class="empty-state"><h2>Nenhum item por aqui.</h2><p>Os próximos itens excluídos aparecerão nesta lixeira.</p></div>';
  return;
 }
 $('#add-item').hidden=false;
 const products=view==='products',query=$('#search').value.toLocaleLowerCase('pt-BR'),filter=$('#visibility').value;
 $('#nav-count').textContent=data.products.length;
 document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('selected',b.dataset.view===view));
 $('#page-title').innerHTML=products?'Seus produtos<span>.</span>':'Suas categorias<span>.</span>';
 $('#page-description').textContent=products?'Cuide de cada peça que aparece no seu mostruário.':'Organize suas peças para facilitar a descoberta.';
 $('#add-item').textContent=products?'+ Adicionar produto':'+ Adicionar categoria';
 $('#search').placeholder=products?'Nome do produto…':'Nome da categoria…';$('#visibility').hidden=!products;
 const sortable=products&&!query.trim()&&filter==='all'&&data.products.length>1;
 $('#product-order-hint').hidden=false;
 $('#product-order-hint').textContent=sortable?'Arraste os produtos pela alça para definir a ordem no site. A ordem é salva automaticamente.':query.trim()||filter!=='all'?'Limpe a busca e selecione todos os produtos para organizar a ordem.':'Os produtos aparecem no site na mesma ordem desta lista.';
 if(!products)$('#product-order-hint').textContent=query.trim()?'Limpe a busca para organizar as categorias.':'Arraste as categorias pela alça para definir a ordem das categorias dentro de cada área. A ordem é salva automaticamente.';
 const visible=p=>p.published!==false&&data.categories.find(c=>c.id===p.category)?.visible!==false;
 const list=data[view].filter(p=>p.name.toLocaleLowerCase('pt-BR').includes(query)&&(!products||filter==='all'||visible(p)===(filter==='visible')));
 $('#items').innerHTML=list.map(p=>products?`<article class="product" data-product-index="${data.products.indexOf(p)}"><button type="button" class="product-drag-handle" data-sort-product aria-label="Mover produto ${esc(p.name)}. Arraste ou use as setas do teclado." aria-pressed="false" ${sortable?'':'disabled'}>⠿ <span>Arrastar produto</span></button><div class="admin-product-image"><img class="product-image" style="${savedFrameStyle(p,p.image,'catalog')}" src="${esc(image(p.image))}" alt="${esc(p.name)}"></div><div class="product-body"><div class="product-meta"><span>${esc(data.categories.find(c=>c.id===p.category)?.name)}</span><span class="badge ${visible(p)?'':'off'}">${visible(p)?'No mostruário':'Oculto'}</span></div>${p.tag?`<span class="card-tag">${esc(p.tag)}</span>`:''}<h2>${esc(p.name)}</h2>${p.collection?`<p class="card-collection">Coleção: ${esc(p.collection)}</p>`:''}<p class="card-arrival">${esc(availabilityInfo(p).title)}</p><p class="price">${esc(price(p.price))}</p><div class="card-actions"><button class="secondary" data-edit="${esc(p.id)}">Editar produto</button><button class="quiet" data-toggle="${esc(p.id)}">${p.published===false?'Mostrar':'Ocultar'}</button><button class="danger-quiet" data-delete="${esc(p.id)}" aria-label="Excluir produto ${esc(p.name)}">Excluir</button></div></div></article>`:`<article class="category-card" data-category-index="${data.categories.indexOf(p)}"><button type="button" class="category-drag-handle" data-sort-category aria-label="Mover categoria ${esc(p.name)}. Arraste ou use as setas do teclado." aria-pressed="false" ${!query.trim()&&data.categories.length>1?'':'disabled'}>⠿ <span>Arrastar</span></button><div class="category-info"><h2>${esc(p.name)}</h2><p>${data.products.filter(x=>x.category===p.id).length} produto(s) · ${esc(catalogSections.find(s=>s.id===categorySection(p))?.name)} · ${p.visible===false?'Oculta':'Visível no site'}</p></div><div class="card-actions"><button class="secondary" data-edit="${esc(p.id)}">Editar</button><button class="danger-quiet" data-delete="${esc(p.id)}" aria-label="Excluir categoria ${esc(p.name)}">Excluir</button></div></article>`).join('')||'<div class="empty-state"><h2>Nenhum item por aqui.</h2><p>Adicione um novo item ou ajuste sua busca.</p></div>';
}
photoSort($('#items'),{
 handleSelector:'[data-sort-product]',cardSelector:'[data-product-index]',indexAttribute:'data-product-index',
 canMove:()=>!busy&&!photoLoading&&view==='products'&&!$('#search').value.trim()&&$('#visibility').value==='all',
 onMove:async(from,to)=>{
  const next=structuredClone(data),[item]=next.products.splice(from,1);next.products.splice(to,0,item);
  saving(true);notice('Salvando a ordem dos produtos…');
  try{await persist(next);render();monitorPublication();$('#items').querySelector(`[data-product-index="${to}"] [data-sort-product]`)?.focus({preventScroll:true});}
  catch(error){notice(error.message,true);}
  finally{saving(false);}
 }
});
photoSort($('#items'),{
 handleSelector:'[data-sort-category]',cardSelector:'[data-category-index]',indexAttribute:'data-category-index',
 canMove:()=>!busy&&!photoLoading&&view==='categories'&&!$('#search').value.trim(),
 onMove:async(from,to)=>{
  const next=structuredClone(data),[item]=next.categories.splice(from,1);next.categories.splice(to,0,item);
  saving(true);notice('Salvando a ordem das categorias…');
  try{await persist(next);render();monitorPublication();$('#items').querySelector(`[data-category-index="${to}"] [data-sort-category]`)?.focus({preventScroll:true});}
  catch(error){notice(error.message,true);}
  finally{saving(false);}
 }
});
function leave(){if(busy||photoLoading)return false;return !dirty||confirm('Você tem alterações não salvas. Deseja descartá-las?');}
function list(){dirty=false;photo=null;$('#editor').hidden=true;$('#listing').hidden=false;render();window.scrollTo({top:0,behavior:'instant'});}
function openProduct(id){
 editing=data.products.find(p=>p.id===id)||null;photo=null;photos=editing?productImages(editing).map(path=>({path,frames:structuredClone(editing.imageFrames?.[frameKey(path)]||{})})):[];dirty=false;form.reset();
 $('#notice').hidden=true;$('#editor-title').innerHTML=editing?'Editar produto<span>.</span>':'Novo produto<span>.</span>';
 form.elements.category.innerHTML='<option value="">Escolha uma categoria</option>'+data.categories.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}${c.visible===false?' (oculta)':''}</option>`).join('');
 for(const key of ['name','price','subtitle','detail','tag','category','mercadoLivreUrl','driver','team','scale','collection'])form.elements[key].value=editing?.[key]||'';
 $('#collection-suggestions').innerHTML=filterOptions(data.products,'collection').map(value=>`<option value="${esc(value)}"></option>`).join('');
 form.elements.isPrint.checked=editing?.isPrint===true;
 form.elements.published.checked=editing?editing.published!==false:true;form.elements.illustrative.checked=editing?.illustrative===true;
 renderPhotos();
 form.elements.availabilityStatus.value=editing?.availability?.status||'consult';
 form.elements.availabilityMode.value=editing?.availability?.mode||'unknown';
 form.elements.availabilityDays.value=editing?.availability?.days||'';
 form.elements.availabilityDate.value=editing?.availability?.date||'';
 form.elements.availabilityNote.value=editing?.availability?.note||'';
 updateAvailability();
 $('#save-hint').textContent='As alterações vão para o site depois de salvar.';
 $('#listing').hidden=true;$('#editor').hidden=false;updatePreview();window.scrollTo({top:0,behavior:'instant'});
}
function updateAvailability(){
 const incoming=['incoming','order'].includes(form.elements.availabilityStatus.value),mode=form.elements.availabilityMode.value;
 $('#arrival-fields').hidden=!incoming;$('#arrival-days').hidden=!incoming||mode!=='days';$('#arrival-date').hidden=!incoming||mode!=='date';
 form.elements.availabilityDays.required=incoming&&mode==='days';form.elements.availabilityDays.disabled=!incoming||mode!=='days';
 form.elements.availabilityDate.required=incoming&&mode==='date';form.elements.availabilityDate.disabled=!incoming||mode!=='date';
}
form.elements.availabilityStatus.addEventListener('change',updateAvailability);
form.elements.availabilityMode.addEventListener('change',updateAvailability);
function updatePreview(){$('#preview-name').textContent=form.elements.name.value||'O nome da sua peça';$('#preview-price').textContent=price(form.elements.price.value);}
function openCategory(id){editingCategory=data.categories.find(c=>c.id===id)||null;const f=$('#category-form');f.reset();f.elements.name.value=editingCategory?.name||'';f.elements.section.value=editingCategory?categorySection(editingCategory):'';f.elements.visible.checked=editingCategory?.visible!==false;$('#category-title').textContent=editingCategory?'Editar categoria':'Nova categoria';$('#category-error').textContent='';$('#category-dialog').showModal();}
function saving(value){busy=value;document.querySelectorAll('#delete-dialog button, #workspace button, #category-dialog button, #category-dialog input, #category-dialog select, #product-form input, #product-form select, #product-form textarea').forEach(b=>b.disabled=value);$('#save').textContent=value?'Salvando…':'Salvar produto';if(!value){document.querySelectorAll('[data-sort-category]').forEach(b=>b.disabled=view!=='categories'||data.categories.length<2||!!$('#search').value.trim());document.querySelectorAll('[data-sort-product]').forEach(b=>b.disabled=view!=='products'||data.products.length<2||!!$('#search').value.trim()||$('#visibility').value!=='all');updateAvailability();const cover=$('#photo-list [data-cover="0"]');if(cover)cover.disabled=true;}}
async function persist(next,newPhoto){
 if(preview){data=structuredClone(next);return;}
 await store.save(next,newPhoto);data=next;
}
function monitorPublication(){
 const expected=JSON.stringify(publicCatalog(data)),version=++poll;
 notice(preview?'Salvo nesta prévia local. Nenhuma alteração foi publicada.':'Salvo! Estamos atualizando seu site. Você já pode continuar cadastrando.');
 if(preview)return;
 const start=Date.now();
 async function check(){
  if(version!==poll)return;
  try{const r=await fetch('/content/catalog.json?t='+Date.now(),{cache:'no-store'});if(r.ok&&JSON.stringify(await r.json())===expected){notice('Tudo certo! Suas alterações já estão no site.');return;}}catch{}
  if(Date.now()-start<180000)setTimeout(check,7000);else notice('Seu catálogo foi salvo. A atualização do site está demorando mais que o normal; confira em “Ver meu site”.');
 }setTimeout(check,5000);
}
form.addEventListener('input',()=>{dirty=true;updatePreview();$('#save-hint').textContent='Você tem alterações para salvar.';});
function renderPhotos(){
 $('#photo-preview-frame').hidden=!photos.length;$('#photo-preview').hidden=!photos.length;$('#photo-placeholder').hidden=!!photos.length;
 if(photos.length){$('#photo-preview').src=photos[0].url||image(photos[0].path);$('#photo-preview').style.cssText=frameStyle(photos[0].frames?.catalog);}
 $('#photo-list').innerHTML=photos.map((p,i)=>`<div class="photo-item" data-photo-index="${i}"><button type="button" class="photo-drag-handle" data-sort-photo aria-label="Mover foto ${i+1}. Arraste ou use as setas do teclado." aria-pressed="false">⠿ <span>Arrastar</span></button><img src="${esc(p.url||image(p.path))}" alt="Foto ${i+1}"><span>${i===0?'Capa':'Foto '+(i+1)}</span><button type="button" data-frame="${i}">Enquadrar foto</button><button type="button" data-cover="${i}" ${i===0?'disabled':''}>Usar como capa</button><button type="button" data-remove="${i}" aria-label="Remover foto ${i+1}">Remover</button></div>`).join('');
}
photoSort($('#photo-list'),{canMove:()=>!busy&&!photoLoading,onMove:(from,to)=>{
 const [item]=photos.splice(from,1);photos.splice(to,0,item);dirty=true;renderPhotos();
 $('#save-hint').textContent='Ordem das fotos alterada. Salve o produto para publicar.';
 $('#photo-order-status').textContent=`Foto movida para a posição ${to+1}${to===0?', como capa':''}.`;
 $('#photo-list').querySelector(`[data-photo-index="${to}"] [data-sort-photo]`)?.focus({preventScroll:true});
}});
$('#photo-list').addEventListener('click',e=>{
 if(busy||photoLoading)return;
 const framing=e.target.closest('[data-frame]');if(framing){frameEditor.show(photos[Number(framing.dataset.frame)],Number(framing.dataset.frame));return;}
 const cover=e.target.closest('[data-cover]'),remove=e.target.closest('[data-remove]');
 if(cover){const [item]=photos.splice(Number(cover.dataset.cover),1);photos.unshift(item);}
 else if(remove){const [item]=photos.splice(Number(remove.dataset.remove),1);if(item.url)URL.revokeObjectURL(item.url);}
 else return;
 dirty=true;renderPhotos();
});
$('#photo').addEventListener('change',async event=>{
 const files=[...event.target.files];if(!files.length||photoLoading)return;
 if(photos.length+files.length>10){notice('Você pode adicionar até 10 fotos por produto.',true);event.target.value='';return;}
 if(files.some(file=>!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5000000)){notice('Escolha fotos JPG, PNG ou WebP de até 5 MB cada.',true);event.target.value='';return;}
 photoLoading=true;$('#save').disabled=true;$('#save-hint').textContent='Preparando suas fotos…';
 const added=[];
 try{
  for(const file of files){
   const bitmap=await createImageBitmap(file);bitmap.close();
   const extension={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];
   const content=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});
   added.push({path:`assets/uploads/${newId('produto')}.${extension}`,base64:content.split(',')[1],url:URL.createObjectURL(file)});
  }
  photos.push(...added);dirty=true;renderPhotos();
 }catch{added.forEach(p=>URL.revokeObjectURL(p.url));notice('Não conseguimos abrir uma das imagens. Escolha outras fotos.',true);}
 finally{photoLoading=false;$('#save').disabled=false;event.target.value='';$('#save-hint').textContent='Você tem alterações para salvar.';}
});
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy||photoLoading)return;
 if(!photos.length){notice('Escolha uma foto para o produto.',true);$('#photo').focus();return;}
 const fields=new FormData(form),product={...editing,id:editing?.id||newId(fields.get('name')),image:photos[0].path.startsWith('/')?photos[0].path:'/'+photos[0].path,images:photos.map(p=>p.path.startsWith('/')?p.path:'/'+p.path)};
 for(const key of ['name','price','subtitle','detail','tag','category','mercadoLivreUrl','driver','team','scale','collection'])product[key]=String(fields.get(key)||'').trim();
 product.imageFrames=Object.fromEntries(photos.filter(p=>Object.keys(p.frames||{}).length).map(p=>[frameKey(p.path),p.frames]));
 product.availability={status:form.elements.availabilityStatus.value,mode:form.elements.availabilityMode.value,note:form.elements.availabilityNote.value.trim()};
 if(product.availability.mode==='days')product.availability.days=Number(form.elements.availabilityDays.value);
 if(product.availability.mode==='date')product.availability.date=form.elements.availabilityDate.value;
 try{validateAvailability(product.availability);validateMercadoLivre(product.mercadoLivreUrl);}catch(error){notice(error.message,true);return;}
 product.isPrint=form.elements.isPrint.checked;
 product.published=form.elements.published.checked;product.illustrative=form.elements.illustrative.checked;
 product.label=data.categories.find(c=>c.id===product.category)?.name.toLocaleUpperCase('pt-BR')||'';
 if(photos.some(p=>p.base64))delete product.imagePosition;
 const next=structuredClone(data),index=next.products.findIndex(p=>p.id===product.id);if(index<0)next.products.unshift(product);else next.products[index]=product;
 saving(true);
 try{await persist(next,photos.filter(p=>p.base64));for(const p of photos)if(p.url)localPhotos.set(p.path.startsWith('/')?p.path:'/'+p.path,p.url);dirty=false;saving(false);list();monitorPublication();}
 catch(error){notice(error.message,true);$('#save-hint').textContent=error.message;}
 finally{saving(false);}
});
$('#category-form').addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;const f=event.target,name=f.elements.name.value.trim();
 if(!name){$('#category-error').textContent='Preencha o nome da categoria.';return;}
 if(!catalogSections.some(s=>s.id===f.elements.section.value)){$('#category-error').textContent='Escolha a área do site desta categoria.';return;}
 if(data.categories.some(c=>c.id!==editingCategory?.id&&c.name.toLocaleLowerCase()===name.toLocaleLowerCase())){$('#category-error').textContent='Essa categoria já existe.';return;}
 const next=structuredClone(data),category={...editingCategory,id:editingCategory?.id||newId(name),name,section:f.elements.section.value,visible:f.elements.visible.checked},index=next.categories.findIndex(c=>c.id===category.id);
 if(index<0)next.categories.push(category);else next.categories[index]=category;
 saving(true);try{await persist(next);$('#category-dialog').close();render();monitorPublication();}catch(error){$('#category-error').textContent=error.message;}finally{saving(false);}
});
$('#items').addEventListener('click',async event=>{
 const edit=event.target.closest('[data-edit]'),toggle=event.target.closest('[data-toggle]');
 if(busy)return;const purge=event.target.closest('[data-purge]');if(purge){openPurge(purge.dataset.purge);return;}const restore=event.target.closest('[data-restore]');if(restore){
  saving(true);try{const next=restoreCatalogItem(data,restore.dataset.restore);await persist(next);render();monitorPublication();}catch(error){notice(error.message,true);}finally{saving(false);}return;
 }const deletion=event.target.closest('[data-delete]');if(deletion){openDelete(view,deletion.dataset.delete);return;}if(edit){view==='products'?openProduct(edit.dataset.edit):openCategory(edit.dataset.edit);return;}
 if(toggle){const next=structuredClone(data),p=next.products.find(p=>p.id===toggle.dataset.toggle);p.published=p.published===false;saving(true);try{await persist(next);render();monitorPublication();}catch(error){notice(error.message,true);}finally{saving(false);}}
});
function openDelete(kind,id){
 const item=data[kind].find(item=>item.id===id);if(!item)return;
 pendingDelete={kind,id};$('#confirm-delete').textContent='Enviar para a lixeira';$('#delete-title').textContent=kind==='products'?'Enviar produto para a lixeira?':'Enviar categoria para a lixeira?';
 $('#delete-name').textContent=item.name;$('#delete-error').textContent='';
 const blocked=kind==='categories'&&data.products.some(p=>p.category===id);
 $('#delete-description').textContent=blocked?'Esta categoria possui produtos, inclusive peças ocultas. Mova esses produtos para outra categoria ou exclua as peças primeiro.':kind==='products'?'O produto sairá do site após a atualização. Você poderá recuperá-lo na Lixeira, com suas fotos e detalhes.':'A categoria sairá dos filtros após a atualização. Você poderá recuperá-la na Lixeira.';
 $('#confirm-delete').hidden=blocked;$('#delete-dialog').showModal();
}
function openPurge(id){
 const entry=id===null?null:(data.trash||[]).find(e=>e.id===id);if(id!==null&&!entry)return;
 pendingDelete={action:'purge',id};$('#delete-title').textContent=id===null?'Esvaziar a lixeira?':'Excluir definitivamente?';
 $('#delete-name').textContent=entry?entry.item.name:`${(data.trash||[]).length} ${(data.trash||[]).length===1?'item':'itens'} na lixeira`;
 $('#delete-description').textContent=id===null?'Todos os produtos e categorias da lixeira serão apagados, inclusive os que não aparecem na busca atual. Não será possível restaurá-los pelo painel. Os cadastros ativos serão preservados.':'Este cadastro será apagado da lixeira. Não será possível restaurá-lo pelo painel.';
 $('#delete-error').textContent='';$('#confirm-delete').hidden=false;$('#confirm-delete').textContent=id===null?'Sim, esvaziar lixeira':'Excluir definitivamente';
 try{purgeTrash(data,id);}catch(error){$('#delete-error').textContent=error.message;$('#confirm-delete').hidden=true;}
 $('#delete-dialog').showModal();
}
$('#empty-trash').onclick=()=>{if(!busy&&(data.trash||[]).length)openPurge(null);};
$('#cancel-delete').onclick=()=>$('#delete-dialog').close();
$('#delete-dialog').addEventListener('cancel',event=>{if(busy)event.preventDefault();});
$('#delete-dialog').addEventListener('close',()=>{pendingDelete=null;});
$('#confirm-delete').onclick=async()=>{
 if(busy||!pendingDelete)return;
 const {kind,id,action}=pendingDelete;let next;
 try{next=action==='purge'?purgeTrash(data,id):removeCatalogItem(data,kind,id);}catch(error){$('#delete-error').textContent=error.message;return;}
 saving(true);$('#confirm-delete').textContent=action==='purge'?'Apagando…':'Enviando…';
 try{await persist(next);$('#delete-dialog').close();render();monitorPublication();}
 catch(error){$('#delete-error').textContent=error.message;}
 finally{saving(false);$('#confirm-delete').textContent=action==='purge'?(id===null?'Sim, esvaziar lixeira':'Excluir definitivamente'):'Enviar para a lixeira';}
};
$('#add-item').onclick=()=>view==='products'?openProduct():openCategory();
$('#close-category').onclick=()=>$('#category-dialog').close();
$('#category-dialog').addEventListener('cancel',e=>{if(busy)e.preventDefault();});
for(const id of ['back','cancel'])$('#'+id).onclick=()=>{if(leave())list();};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{if(!leave())return;view=b.dataset.view;$('#search').value='';list();});
$('#search').oninput=render;$('#visibility').onchange=render;
$('#reload').onclick=async()=>{if(busy)return;saving(true);try{data=preview?await (await fetch('/content/catalog.json')).json():await store.load();render();notice('Lista atualizada.');}catch(error){notice(error.message,true);}finally{saving(false);}};
$('#sign-out').onclick=()=>{if(!leave())return;store=null;data={products:[],categories:[]};dirty=false;poll++;$('#workspace').hidden=true;$('#login').hidden=false;$('#login-status').textContent='Você saiu da sua conta.';};
window.addEventListener('beforeunload',event=>{if(dirty||busy){event.preventDefault();event.returnValue='';}});
$('#sign-in').onclick=()=>{
 popup=window.open('/api/auth','siqueira-login','width=640,height=760');
 $('#login-status').textContent=popup?'Conclua a entrada na janela do GitHub.':'Permita a janela de login no seu navegador e tente novamente.';
};
window.addEventListener('message',async event=>{
 if(event.origin!==location.origin||event.source!==popup||typeof event.data!=='string')return;
 if(event.data==='authorizing:github'){popup.postMessage('authorizing:github',location.origin);return;}
 const prefix='authorization:github:success:';if(!event.data.startsWith(prefix))return;
 try{const auth=JSON.parse(event.data.slice(prefix.length));if(typeof auth.token!=='string'||!auth.token)throw new Error('Login inválido.');store=new CatalogStore(auth.token);$('#login-status').textContent='Carregando suas peças…';data=await store.load();popup=null;showWorkspace();}
 catch(error){$('#login-status').textContent=error.message;}
});
if(preview){data=await (await fetch('/content/catalog.json')).json();showWorkspace();}
