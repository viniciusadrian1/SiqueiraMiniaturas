const clamp=(value,min,max,fallback)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Number(value))):fallback;
export function normalizeFrame(frame={}){return {fit:frame.fit==='cover'?'cover':'contain',zoom:clamp(frame.zoom,1,3,1),x:clamp(frame.x,0,100,50),y:clamp(frame.y,0,100,50)};}
export const frameKey=path=>'/'+String(path||'').replace(/^\//,'');
export function frameStyle(frame){const f=normalizeFrame(frame);return `object-fit:${f.fit};object-position:${f.x}% ${f.y}%;transform:scale(${f.zoom});transform-origin:${f.x}% ${f.y}%;`;}
export function savedFrameStyle(product,path,context){return frameStyle(product.imageFrames?.[frameKey(path)]?.[context]);}
export function panFrame(frame,{width,height,naturalWidth,naturalHeight,dx,dy}){
 const f=normalizeFrame(frame);if(!naturalWidth||!naturalHeight||!width||!height)return f;
 const scale=(f.fit==='cover'?Math.max:Math.min)(width/naturalWidth,height/naturalHeight)*f.zoom;
 const gapX=width-naturalWidth*scale,gapY=height-naturalHeight*scale;
 return normalizeFrame({...f,x:Math.abs(gapX)>1?f.x+dx/gapX*100:f.x,y:Math.abs(gapY)>1?f.y+dy/gapY*100:f.y});
}
