import {config,headers} from '../lib/oauth.js';
export default function handler(req,res){
 headers(res);
 if(req.method!=='GET'){res.statusCode=405;return res.end();}
 res.setHeader('Content-Type','application/json; charset=utf-8');
 try{config();res.end(JSON.stringify({configured:true}));}
 catch{res.end(JSON.stringify({configured:false}));}
}
