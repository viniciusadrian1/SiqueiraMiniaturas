// One-time local registration. Credentials never enter the public build or Git.
import {createServer} from 'node:http';
import {randomBytes, timingSafeEqual} from 'node:crypto';
import {writeFile, access} from 'node:fs/promises';
const destination = new URL('../.env.github-app.json', import.meta.url);
try { await access(destination); throw new Error('A configuração local já existe. Não registrar outro aplicativo.'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const state = randomBytes(32).toString('hex');
const origin = 'http://127.0.0.1:4169';
const site = 'https://siqueiraminiaturas.vercel.app';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const manifest = {
 name:'Siqueira Miniaturas Painel', url:site,
 description:'Cadastro de produtos e fotos da Siqueira Miniaturas.',
 redirect_url:origin+'/callback', callback_urls:[site+'/api/callback'],
 public:false, hook_attributes:{url:site,active:false},
 default_permissions:{contents:'write',metadata:'read'},default_events:[],request_oauth_on_install:false
};
let busy = false;
const server = createServer(async (req,res) => {
 res.setHeader('Cache-Control','no-store');
 res.setHeader('Referrer-Policy','no-referrer');
 res.setHeader('Content-Type','text/html; charset=utf-8');
 res.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; form-action https://github.com; frame-ancestors 'none'; base-uri 'none'");
 const page = text => res.end(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Configurar painel Siqueira</title><style>body{font:18px/1.6 system-ui;max-width:650px;margin:10vh auto;padding:24px;background:#f5f3ef;color:#191919}button,a{font:inherit}button{padding:14px 22px;background:#181818;color:white;border:0;border-radius:8px}h1{line-height:1.15}</style>${text}</html>`);
 if (req.headers.host !== '127.0.0.1:4169' || req.method !== 'GET') {res.statusCode=403;return page('Acesso inválido.');}
 const url = new URL(req.url,origin);
 if (url.pathname === '/' && url.searchParams.get('setup') === state) return page(`<h1>Conectar o painel da Siqueira</h1><p>No GitHub, use a conta <strong>viniciusadrian1</strong> e confirme a criação do aplicativo abaixo.</p><p>Ele permitirá editar produtos e enviar fotos. Depois, instale-o apenas no repositório <strong>SiqueiraMiniaturas</strong>, escolhendo <strong>Only select repositories</strong>.</p><form action="https://github.com/settings/apps/new?state=${state}" method="post"><input type="hidden" name="manifest" value="${escape(JSON.stringify(manifest))}"><button>Criar aplicativo no GitHub</button></form>`);
 const returned = url.searchParams.get('state') || '';
 if (url.pathname !== '/callback' || returned.length !== state.length || !timingSafeEqual(Buffer.from(returned),Buffer.from(state)) || !/^[a-zA-Z0-9_-]+$/.test(url.searchParams.get('code') || '') || busy) {res.statusCode=400;return page('Abra o link de configuração fornecido no chat.');}
 busy = true;
 try {
  const reply = await fetch(`https://api.github.com/app-manifests/${url.searchParams.get('code')}/conversions`,{method:'POST',headers:{Accept:'application/vnd.github+json','User-Agent':'Siqueira-Setup'},signal:AbortSignal.timeout(20000)});
  if (!reply.ok) throw new Error('Falha no registro.');
  const app = await reply.json();
  if (app.owner?.login?.toLowerCase() !== 'viniciusadrian1' || !app.client_id || !app.client_secret || !/^[a-z0-9-]+$/.test(app.slug)) throw new Error('Confira a conta pessoal utilizada.');
  await writeFile(destination,JSON.stringify({GITHUB_CLIENT_ID:app.client_id,GITHUB_CLIENT_SECRET:app.client_secret,slug:app.slug}),{flag:'wx',mode:0o600});
  console.log('Aplicativo registrado. Credenciais salvas localmente em arquivo ignorado pelo Git.');
  page(`<h1>Aplicativo criado.</h1><p>Agora instale na sua conta, selecionando somente <strong>SiqueiraMiniaturas</strong>.</p><p><a href="https://github.com/apps/${escape(app.slug)}/installations/new">Instalar no repositório da Siqueira</a></p><p>Depois, volte ao chat e avise que concluiu a instalação.</p>`);
  server.close();
 } catch {res.statusCode=502;page('<h1>Não foi possível concluir.</h1><p>Volte ao chat para verificarmos o registro. Nenhuma credencial foi exibida.</p>');}
});
server.listen(4169,'127.0.0.1',()=>console.log(`Configuração local: ${origin}/?setup=${state}`));
setTimeout(()=>server.close(),3600000).unref();
