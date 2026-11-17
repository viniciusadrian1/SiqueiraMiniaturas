import {config,cookies,validState,cookie,headers,random,callbackHTML} from '../lib/oauth.js';
export default async function handler(req,res){
 headers(res);
 if(req.method!=='GET'){res.statusCode=405;return res.end();}
 const saved=cookies(req);
 res.setHeader('Set-Cookie',[cookie('cms_state','',0),cookie('cms_verifier','',0)]);
 try {
  const c=config(),params=new URL(req.url,c.origin).searchParams;
  if(!validState(params.get('state'),saved.cms_state)||!saved.cms_verifier||!params.get('code')){res.statusCode=400;return res.end('Login expirado ou inválido. Volte ao painel e tente novamente.');}
  const response=await fetch('https://github.com/login/oauth/access_token',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({client_id:c.id,client_secret:c.secret,code:params.get('code'),redirect_uri:c.origin+'/api/callback',code_verifier:saved.cms_verifier}),signal:AbortSignal.timeout(15000)});
  const data=await response.json();
  if(!response.ok||!data.access_token)throw new Error('Exchange failed');
  const options={headers:{Authorization:`Bearer ${data.access_token}`,Accept:'application/vnd.github+json','User-Agent':'Siqueira-CMS'},signal:AbortSignal.timeout(15000)};
  const userResponse=await fetch('https://api.github.com/user',options);
  const user=await userResponse.json();
  if(!userResponse.ok||String(user.login).toLowerCase()!==c.login){res.statusCode=403;return res.end('Esta conta não está autorizada a administrar a Siqueira.');}
  const repoResponse=await fetch(`https://api.github.com/repos/${c.repo}`,options);
  const repo=await repoResponse.json();
  if(!repoResponse.ok||!repo.permissions?.push){res.statusCode=403;return res.end('A conta não tem acesso de edição ao repositório da Siqueira.');}
  const nonce=random();
  res.setHeader('Content-Security-Policy',`default-src 'none'; script-src 'nonce-${nonce}'; frame-ancestors 'none'; base-uri 'none'`);
  res.setHeader('Content-Type','text/html; charset=utf-8');res.end(callbackHTML(c.origin,data.access_token,nonce));
 }catch{res.statusCode=502;res.end('Não foi possível conectar o login. Volte ao painel e tente novamente.');}
}
