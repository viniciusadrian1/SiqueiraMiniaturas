import {frameStyle,frameKey,normalizeFrame,panFrame} from '../image-frame.js';
export function createFrameEditor({canEdit,onApply}){
 const dialog=document.querySelector('#frame-dialog'),stage=dialog.querySelector('.frame-stage'),img=stage.querySelector('img');
 const controls=dialog.querySelectorAll('[data-frame-control]');let current=null,context='catalog',draft={},start=null;
 const control=name=>dialog.querySelector(`[data-frame-control="${name}"]`);
 function draw(){
  const frame=normalizeFrame(draft[context]);img.style.cssText=frameStyle(frame);stage.style.aspectRatio=context==='catalog'?'4 / 3':'1 / 1';
  for(const input of controls)input.value=frame[input.dataset.frameControl];
  dialog.querySelector('#frame-zoom-value').textContent=Math.round(frame.zoom*100)+'%';
  dialog.querySelectorAll('[data-frame-context]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.frameContext===context)));
  dialog.querySelector('#frame-context-label').textContent=context==='catalog'?'Prévia da capa no catálogo · 4:3':'Prévia da foto na página da peça · 1:1';
 }
 function show(photo,index){
  if(!canEdit())return;current={photo,index};draft=structuredClone(photo.frames||{});context=index===0?'catalog':'gallery';
  img.src=photo.url||frameKey(photo.path);dialog.querySelector('#frame-title').textContent=`Enquadrar foto ${index+1}`;dialog.showModal();draw();
 }
 for(const input of controls)input.addEventListener('input',()=>{draft[context]={...normalizeFrame(draft[context]),[input.dataset.frameControl]:input.value};draw();});
 dialog.querySelectorAll('[data-frame-context]').forEach(b=>b.onclick=()=>{context=b.dataset.frameContext;draw();});
 dialog.querySelector('#frame-reset').onclick=()=>{draft[context]={fit:'contain',zoom:1,x:50,y:50};draw();};
 dialog.querySelector('#frame-cancel').onclick=()=>dialog.close();
 dialog.querySelector('#frame-apply').onclick=()=>{if(!current||!canEdit())return;draft[context]=normalizeFrame(draft[context]);onApply(current.photo,draft);dialog.close();};
 dialog.addEventListener('close',()=>{current=null;start=null;});
 stage.addEventListener('pointerdown',event=>{if(event.button!==0)return;const r=stage.getBoundingClientRect();start={id:event.pointerId,x:event.clientX,y:event.clientY,frame:normalizeFrame(draft[context]),width:r.width,height:r.height};stage.setPointerCapture(event.pointerId);event.preventDefault();});
 stage.addEventListener('pointermove',event=>{if(!start||event.pointerId!==start.id)return;draft[context]=panFrame(start.frame,{...start,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,dx:event.clientX-start.x,dy:event.clientY-start.y});draw();});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(type,()=>{start=null;});
 return {show};
}
