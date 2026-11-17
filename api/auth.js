import {config,random,challenge,cookie,headers} from '../lib/oauth.js';
export default function handler(req,res){
 headers(res);
 if(req.method!=='GET'){res.statusCode=405;return res.end();}
 try {
  const c=config(),state=random(),verifier=random();
  const url=new URL('https://github.com/login/oauth/authorize');
  // GitHub App permissions are limited by its installation, not OAuth repo scopes.
  url.search=new URLSearchParams({client_id:c.id,redirect_uri:c.origin+'/api/callback',state,code_challenge:challenge(verifier),code_challenge_method:'S256',allow_signup:'false',login:c.login}).toString();
  res.setHeader('Set-Cookie',[cookie('cms_state',state),cookie('cms_verifier',verifier)]);
  res.setHeader('Location',url.href);res.statusCode=302;res.end();
 }catch{res.statusCode=503;res.end('Login ainda não configurado.');}
}
