import test from 'node:test';
import assert from 'node:assert/strict';
import {publicCatalog,escapeHTML,imageURL} from '../catalog-data.js';
test('hidden categories and unpublished products never enter public catalog',()=>{
 const result=publicCatalog({categories:[{id:'a'},{id:'b',visible:false}],products:[{id:1,category:'a'},{id:2,category:'a',published:false},{id:3,category:'b'},{id:4,category:'missing'}]});
 assert.deepEqual(result.products.map(p=>p.id),[1]);
 assert.equal(result.categories.length,1);
});
test('CMS text is escaped and photo paths cannot inject HTML or CSS',()=>{
 assert.equal(escapeHTML('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');
 assert.equal(imageURL("assets/a');color:red"),'assets/brand/favicon.svg');
 assert.equal(imageURL('javascript:alert(1)'),'assets/brand/favicon.svg');
 assert.equal(imageURL('/assets/uploads/photo.webp'),'/assets/uploads/photo.webp');
});
