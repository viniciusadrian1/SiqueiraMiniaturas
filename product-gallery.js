const track=document.querySelector('.gallery-track');
if(track){
 const slides=[...track.children],buttons=[...document.querySelectorAll('[data-gallery-index]')];let index=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function go(next){index=Math.max(0,Math.min(slides.length-1,next));track.scrollTo({left:slides[index].offsetLeft-track.offsetLeft,behavior:reduced.matches?'instant':'smooth'});}
 document.querySelector('[data-gallery-prev]')?.addEventListener('click',()=>go(index-1));
 document.querySelector('[data-gallery-next]')?.addEventListener('click',()=>go(index+1));
 buttons.forEach((b,i)=>b.addEventListener('click',()=>go(i)));
 track.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();go(index+(e.key==='ArrowRight'?1:-1));}});
 let frame;track.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{index=Math.round(track.scrollLeft/track.clientWidth);buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));const count=document.querySelector('.gallery-count');if(count)count.textContent=`${index+1} / ${slides.length}`;const prev=document.querySelector('[data-gallery-prev]'),next=document.querySelector('[data-gallery-next]');if(prev)prev.disabled=index===0;if(next)next.disabled=index===slides.length-1;});},{passive:true});
 const prev=document.querySelector('[data-gallery-prev]');if(prev)prev.disabled=true;
}
// Enlarged viewer uses the same ordered images as the product gallery.
if(track){
 const sources=[...track.querySelectorAll('img')];
 const viewer=document.createElement('dialog');viewer.className='photo-viewer';viewer.setAttribute('aria-label','Fotos ampliadas do produto');
 viewer.innerHTML='<header class="viewer-toolbar"><span class="viewer-counter" aria-live="polite"></span><div><button type="button" data-zoom-out aria-label="Diminuir zoom">−</button><button type="button" data-zoom-reset aria-label="Restaurar zoom">100%</button><button type="button" data-zoom-in aria-label="Aumentar zoom">+</button><button type="button" data-close-viewer aria-label="Fechar fotos ampliadas">×</button></div></header><div class="viewer-stage"><img draggable="false" alt=""></div><footer class="viewer-footer"><button type="button" data-viewer-prev aria-label="Foto anterior ampliada">←</button><span>Deslize para trocar · Amplie para ver detalhes</span><button type="button" data-viewer-next aria-label="Próxima foto ampliada">→</button></footer>';
 document.body.append(viewer);
 const stage=viewer.querySelector('.viewer-stage'),photo=stage.querySelector('img'),counter=viewer.querySelector('.viewer-counter'),reset=viewer.querySelector('[data-zoom-reset]');
 let current=0,zoom=1,returnFocus=null,previousOverflow='',start=null,pinch=null;
 const pointers=new Map();
 function scale(value){zoom=Math.max(1,Math.min(4,value));photo.style.width=`${zoom*100}%`;photo.style.height=`${zoom*100}%`;reset.textContent=`${Math.round(zoom*100)}%`;stage.classList.toggle('zoomed',zoom>1);viewer.querySelector('[data-zoom-out]').disabled=zoom===1;viewer.querySelector('[data-zoom-in]').disabled=zoom===4;}
 function show(next){current=Math.max(0,Math.min(sources.length-1,next));photo.src=sources[current].src;photo.alt=sources[current].alt;scale(1);stage.scrollTo(0,0);counter.textContent=`${current+1} / ${sources.length}`;viewer.querySelector('[data-viewer-prev]').disabled=current===0;viewer.querySelector('[data-viewer-next]').disabled=current===sources.length-1;}
 function open(i,element){returnFocus=element;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';viewer.showModal();show(i);}
 [...track.children].forEach((slide,i)=>slide.addEventListener('click',()=>open(i,slide)));
 viewer.querySelector('[data-close-viewer]').onclick=()=>viewer.close();
 viewer.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;pointers.clear();start=null;returnFocus?.focus({preventScroll:true});});
 viewer.querySelector('[data-viewer-prev]').onclick=()=>show(current-1);
 viewer.querySelector('[data-viewer-next]').onclick=()=>show(current+1);
 viewer.querySelector('[data-zoom-in]').onclick=()=>scale(zoom+.5);
 viewer.querySelector('[data-zoom-out]').onclick=()=>scale(zoom-.5);
 reset.onclick=()=>{scale(1);stage.scrollTo(0,0);};
 viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(current+(e.key==='ArrowRight'?1:-1));}if(e.key==='+'||e.key==='='){e.preventDefault();scale(zoom+.5);}if(e.key==='-'){e.preventDefault();scale(zoom-.5);}});
 stage.addEventListener('dblclick',()=>{scale(zoom===1?2:1);});
 stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});stage.setPointerCapture(e.pointerId);if(pointers.size===1)start={x:e.clientX,y:e.clientY,left:stage.scrollLeft,top:stage.scrollTop};if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom};start=null;}});
 stage.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2&&pinch){const [a,b]=[...pointers.values()];scale(pinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.distance));}else if(start&&zoom>1){stage.scrollLeft=start.left-(e.clientX-start.x);stage.scrollTop=start.top-(e.clientY-start.y);}});
 function end(e){if(start&&zoom===1&&pointers.size===1&&e.type!=='pointercancel'){const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.3)show(current+(dx<0?1:-1));}pointers.delete(e.pointerId);start=null;pinch=null;}
 stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
}
