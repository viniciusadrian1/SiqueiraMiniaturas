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
