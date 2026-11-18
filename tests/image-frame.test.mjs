import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeFrame,frameStyle,savedFrameStyle,panFrame} from '../image-frame.js';
import {renderProductPage} from '../lib/product-page.js';

test('framing settings stay bounded and cannot inject CSS',()=>{
 const f=normalizeFrame({fit:'cover; color:red',zoom:100,x:-20,y:'bad'});
 assert.deepEqual(f,{fit:'contain',zoom:3,x:0,y:50});assert.ok(!frameStyle(f).includes('color'));
});
test('pan matches the rendered cover geometry and clamps image edges',()=>{
 const f={fit:'cover',zoom:1,x:50,y:50};
 const next=panFrame(f,{width:400,height:300,naturalWidth:800,naturalHeight:300,dx:100,dy:50});
 assert.equal(next.x,25);assert.equal(next.y,50);
 assert.equal(panFrame(f,{width:400,height:300,naturalWidth:800,naturalHeight:300,dx:999,dy:0}).x,0);
});
test('frames follow the image path after reordering and differ by context',()=>{
 const p={image:'/assets/a.jpg',imageFrames:{'/assets/a.jpg':{catalog:{fit:'cover',zoom:2,x:30,y:40},gallery:{fit:'contain',zoom:1,x:50,y:50}}}};
 assert.match(savedFrameStyle(p,'assets/a.jpg','catalog'),/scale\(2\)/);
 assert.match(savedFrameStyle(p,p.image,'gallery'),/scale\(1\)/);
 assert.equal(savedFrameStyle(p,'/assets/b.jpg','catalog'),'');
 const html=renderProductPage({...p,id:'a',name:'A',category:'c'},[]);
 assert.match(html,/class="framed-image"/);assert.match(html,/object-fit:contain/);
});
