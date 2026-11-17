import {adminSettings} from './settings.js';
const string = (name,label,extra={}) => ({name,label,widget:'string',...extra});
const fields = [
 {name:'categories',label:'Categorias',widget:'list',summary:'{{fields.name}}',fields:[
  string('id','Identificador',{hint:'Sem espaços ou acentos. Exemplo: capacetes. Não altere após associar produtos.',pattern:['^[a-z0-9-]+$','Use letras minúsculas, números e hífens.']}),
  string('name','Nome da categoria'),{name:'visible',label:'Mostrar no site',widget:'boolean',default:true,hint:'Ao ocultar uma categoria, suas peças também ficam ocultas.'}
 ]},
 {name:'products',label:'Produtos',widget:'list',summary:'{{fields.name}}',fields:[
  string('id','Código da peça',{hint:'Único, sem espaços. Exemplo: ferrari-2024-01',pattern:['^[a-z0-9-]+$','Use letras minúsculas, números e hífens.']}),
  string('name','Nome da peça'),
  {name:'category',label:'Categoria',widget:'relation',collection:'catalog',file:'items',search_fields:['categories.*.name'],display_fields:['categories.*.name'],value_field:'categories.*.id'},
  {name:'image',label:'Foto do produto',widget:'image',choose_url:false,media_library:{config:{max_file_size:5000000}},hint:'JPG, PNG ou WebP, até 5 MB. Prefira fotos com cerca de 1600 pixels.'},
  string('subtitle','Detalhes rápidos',{hint:'Exemplo: Escala 1:43 · Temporada 2024',required:false}),
  {name:'detail',label:'Descrição',widget:'text',required:false},
  string('price','Preço exibido',{required:false,hint:'Opcional. Exemplo: R$ 199,90. Deixe vazio para consultar pelo WhatsApp.'}),
  string('tag','Selo da peça',{required:false,hint:'Exemplo: Novidade'}),
  string('label','Tipo exibido',{required:false,hint:'Exemplo: MINIATURA'}),
  {name:'published',label:'Mostrar no site',widget:'boolean',default:false},
  {name:'illustrative',label:'Imagem ilustrativa',widget:'boolean',default:false},
  string('imagePosition','Recorte das imagens de demonstração',{required:false,hint:'Deixe vazio ao enviar uma foto real.'})
 ]}
];
async function start(demo=false) {
 const button=document.querySelector('#open-demo'); button.disabled=true;
 window.CMS_MANUAL_INIT=true;
 try {
  if(demo){const response=await fetch('/content/catalog.json');if(!response.ok)throw new Error('Demo unavailable');window.repoFiles={content:{'catalog.json':{path:'content/catalog.json',content:await response.text()}}};}
  await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/admin/vendor/decap-cms.js';script.onload=resolve;script.onerror=reject;document.head.append(script);});
  window.CMS.init({config:{load_config_file:false,backend:demo?{name:'test-repo'}:{name:'github',repo:adminSettings.repo,branch:adminSettings.branch,base_url:location.origin,auth_endpoint:'api/auth'},locale:'pt',logo_url:location.origin+'/assets/brand/logo-full.svg',display_url:location.origin,media_folder:'assets/uploads',public_folder:'/assets/uploads',publish_mode:'simple',show_preview_links:false,editor:{preview:false},collections:[{name:'catalog',label:'Catálogo',delete:false,files:[{name:'items',label:'Produtos e categorias',file:'content/catalog.json',format:'json',fields}]}]}});
  document.querySelector('#setup').hidden=true;
  document.querySelector('#demo-banner').hidden=!demo;
 } catch {
  document.querySelector('#status').textContent='O painel não carregou. Execute npm run build para preparar os arquivos e tente novamente.';
  button.disabled=false;
 }
}
document.querySelector('#open-demo').addEventListener('click',()=>start(true));
if (adminSettings.enabled && /^[\w.-]+\/[\w.-]+$/.test(adminSettings.repo)) start();
else {
 document.querySelector('#status').textContent='Repositório escolhido: viniciusadrian1/SiqueiraMiniaturas. Falta confirmar o acesso e configurar o login do GitHub para salvar e publicar alterações.';
 document.querySelector('#open-demo').hidden=false;
}
