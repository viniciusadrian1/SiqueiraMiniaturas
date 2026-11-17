// Pointer events support the same handle with mouse, touch and pen.
export function photoSort(list,{canMove,onMove}){
 let drag=null,scrollFrame=0;
 function cleanup(){cancelAnimationFrame(scrollFrame);if(!drag)return;drag.card.classList.remove('sorting');list.querySelectorAll('.drop-target').forEach(el=>el.classList.remove('drop-target'));drag.handle.setAttribute('aria-pressed','false');drag=null;}
 function targetAt(x,y){const card=document.elementFromPoint(x,y)?.closest('[data-photo-index]');return card&&list.contains(card)?card:null;}
 function highlight(card){list.querySelectorAll('.drop-target').forEach(el=>el.classList.remove('drop-target'));if(card&&card!==drag.card)card.classList.add('drop-target');drag.target=card?Number(card.dataset.photoIndex):drag.target;}
 function scroll(){if(!drag)return;const margin=75;const delta=drag.y<margin?-10:drag.y>innerHeight-margin?10:0;if(delta){window.scrollBy(0,delta);highlight(targetAt(drag.x,drag.y));}scrollFrame=requestAnimationFrame(scroll);}
 list.addEventListener('pointerdown',e=>{
  const handle=e.target.closest('[data-sort-photo]');if(!handle||!canMove()||e.button!==0)return;
  const card=handle.closest('[data-photo-index]');drag={handle,card,from:Number(card.dataset.photoIndex),target:Number(card.dataset.photoIndex),id:e.pointerId,x:e.clientX,y:e.clientY};
  handle.setPointerCapture(e.pointerId);handle.setAttribute('aria-pressed','true');card.classList.add('sorting');e.preventDefault();scrollFrame=requestAnimationFrame(scroll);
 });
 list.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;drag.x=e.clientX;drag.y=e.clientY;highlight(targetAt(e.clientX,e.clientY));});
 function finish(e){if(!drag||e.pointerId!==drag.id)return;const {from,target}=drag;cleanup();if(e.type==='pointerup'&&canMove()&&from!==target)onMove(from,target);}
 list.addEventListener('pointerup',finish);list.addEventListener('pointercancel',finish);list.addEventListener('lostpointercapture',()=>cleanup());
 list.addEventListener('keydown',e=>{const handle=e.target.closest('[data-sort-photo]');if(!handle||!canMove())return;if(e.key==='Escape'){cleanup();return;}if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const from=Number(handle.closest('[data-photo-index]').dataset.photoIndex),to=from+(['ArrowLeft','ArrowUp'].includes(e.key)?-1:1);if(to>=0&&to<list.children.length)onMove(from,to);});
}
