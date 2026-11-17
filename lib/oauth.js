import {randomBytes,timingSafeEqual,createHash} from 'node:crypto';
export function config(env=process.env) {
 const origin=new URL(env.SITE_ORIGIN || 'https://unconfigured.invalid');
 if(origin.protocol!=='https:' || origin.origin!==env.SITE_ORIGIN || !env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !/^[\w.-]+\/[\w.-]+$/.test(env.CMS_REPO || '') || !env.CMS_ADMIN_LOGIN) throw new Error('Login não configurado.');
 return {origin:origin.origin,id:env.GITHUB_CLIENT_ID,secret:env.GITHUB_CLIENT_SECRET,repo:env.CMS_REPO,login:env.CMS_ADMIN_LOGIN.toLowerCase()};
}
export const random=()=>randomBytes(32).toString('base64url');
export const challenge=value=>createHash('sha256').update(value).digest('base64url');
export const cookie=(name,value,age=600)=>`${name}=${value}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;
export function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(s=>s.trim().split('=')));}
export function validState(a,b){return typeof a==='string' && typeof b==='string' && a.length===43 && b.length===43 && timingSafeEqual(Buffer.from(a),Buffer.from(b));}
export function headers(res){res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');}
export function callbackHTML(origin,token,nonce) {
 const payload=JSON.stringify(`authorization:github:success:${JSON.stringify({token,provider:'github'})}`).replace(/</g,'\\u003c');
 return `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Conectando painel</title><p>Conectando ao painel da Siqueira…</p><script nonce="${nonce}">const origin=${JSON.stringify(origin)};const openerWindow=window.opener;if(openerWindow){window.addEventListener('message',function receive(e){if(e.origin!==origin||e.source!==openerWindow||e.data!=='authorizing:github')return;openerWindow.postMessage(${payload},origin);window.removeEventListener('message',receive);window.close();});openerWindow.postMessage('authorizing:github',origin);}else{document.querySelector('p').textContent='Abra o login pelo painel do site.';}</script></html>`;
}
