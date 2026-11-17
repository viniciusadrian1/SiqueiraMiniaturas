import test from 'node:test';
import assert from 'node:assert/strict';
import {random,validState,config,callbackHTML} from '../lib/oauth.js';
import callback from '../api/callback.js';
import auth from '../api/auth.js';
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v;},end(body){this.body=body;}};}
const env={SITE_ORIGIN:'https://siqueira.example',GITHUB_CLIENT_ID:'test-id',GITHUB_CLIENT_SECRET:'test-secret',CMS_REPO:'siqueira/catalog',CMS_ADMIN_LOGIN:'owner'};
test('GitHub App login uses PKCE without requesting broad repository scopes',()=>{
 Object.assign(process.env,env);const res=response();auth({method:'GET'},res);
 const url=new URL(res.headers.Location);
 assert.equal(res.statusCode,302);assert.equal(url.searchParams.has('scope'),false);
 assert.equal(url.searchParams.get('code_challenge_method'),'S256');
 assert.equal(url.searchParams.get('redirect_uri'),env.SITE_ORIGIN+'/api/callback');
 assert.ok(res.headers['Set-Cookie'].every(value=>value.includes('HttpOnly; Secure; SameSite=Lax')));
});
test('state is random, checked and not accepted when missing',()=>{
 const state=random();assert.equal(validState(state,state),true);assert.equal(validState(state,random()),false);assert.equal(validState(null,null),false);
});
test('OAuth configuration is pinned to a secure origin and designated repository',()=>{
 assert.equal(config(env).repo,'siqueira/catalog');
 assert.throws(()=>config({...env,SITE_ORIGIN:'http://siqueira.example'}));
 assert.throws(()=>config({...env,CMS_ADMIN_LOGIN:''}));
});
test('callback rejects invalid state before making an external request',async()=>{
 Object.assign(process.env,env);const res=response();
 await callback({method:'GET',url:'/api/callback?code=bad&state=bad',headers:{}},res);
 assert.equal(res.statusCode,400);assert.equal(res.headers['Cache-Control'],'no-store');
});
test('callback checks account and repository permissions, then uses a restricted postMessage origin',async()=>{
 Object.assign(process.env,env);const state=random(),original=global.fetch;
 try{
  let calls=0;
  global.fetch=async()=>({ok:true,json:async()=>[{access_token:'fake-test-token'},{login:'intruder'}][calls++]});
  const denied=response();await callback({method:'GET',url:`/api/callback?code=test&state=${state}`,headers:{cookie:`cms_state=${state}; cms_verifier=${random()}`}},denied);assert.equal(denied.statusCode,403);assert.equal(calls,2);
  calls=0;global.fetch=async()=>({ok:true,json:async()=>[{access_token:'fake-test-token'},{login:'owner'},{permissions:{push:true}}][calls++]});
  const allowed=response();await callback({method:'GET',url:`/api/callback?code=test&state=${state}`,headers:{cookie:`cms_state=${state}; cms_verifier=${random()}`}},allowed);
  assert.match(allowed.body,/authorization:github:success/);assert.match(allowed.body,/e.source!==openerWindow/);assert.match(allowed.body,/https:\/\/siqueira.example/);assert.match(allowed.headers['Content-Security-Policy'],/nonce-/);
 }finally{global.fetch=original;}
});
test('OAuth response cannot terminate its inline script with token contents',()=>assert.ok(!callbackHTML('https://example.com','</script><script>bad','nonce').includes('</script><script>')));
