export function productURL(product){return `/produto/${encodeURIComponent(product.id)}/`;}
export function validDate(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;
 const date=new Date(value+'T12:00:00Z');return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value;
}
export function validateAvailability(a){
 if(!a)return;
 if(!['consult','ready','incoming','order'].includes(a.status))throw new Error('Escolha uma disponibilidade válida.');
 if(!['incoming','order'].includes(a.status))return;
 if(!['unknown','days','date'].includes(a.mode))throw new Error('Escolha como informar a previsão.');
 if(a.mode==='days'&&(!Number.isInteger(Number(a.days))||Number(a.days)<1||Number(a.days)>365))throw new Error('Informe um prazo entre 1 e 365 dias.');
 if(a.mode==='date'&&!validDate(a.date))throw new Error('Informe uma data prevista válida.');
}
export function availabilityInfo(product,today=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date())){
 const a=product.availability||{status:'consult'};
 if(a.status==='ready')return {status:'ready',title:'Pronta entrega',estimate:'Disponível para combinar o envio.',action:'Quero esta peça',reserve:false};
 if(['incoming','order'].includes(a.status)){
  let estimate='Previsão de chegada sob consulta.';
  if(a.mode==='days'&&Number(a.days)>0)estimate=`Previsão: em até ${Number(a.days)} ${Number(a.days)===1?'dia':'dias'}.`;
  if(a.mode==='date'&&validDate(a.date))estimate=a.date<today?'Previsão em atualização. Consulte a chegada.':`Chegada prevista para ${a.date.split('-').reverse().join('/')}.`;
  return {status:a.status,title:a.status==='incoming'?'A caminho':'Sob encomenda',estimate,action:a.status==='incoming'?'Quero reservar':'Consultar encomenda',reserve:a.status==='incoming'};
 }
 return {status:'consult',title:'Disponibilidade sob consulta',estimate:'Fale com a gente para conferir esta peça.',action:'Consultar pelo WhatsApp',reserve:false};
}
export function productMessage(product){const a=availabilityInfo(product);return `Olá! ${a.reserve?'Quero saber como reservar':'Tenho interesse em'} ${product.name}, que vi na Siqueira Miniaturas. ${a.reserve?'Pode confirmar a previsão de chegada e as condições de reserva?':'Pode confirmar a disponibilidade e os detalhes?'} ${'https://siqueiraminiaturas.vercel.app'+productURL(product)}`;}
export function displayPrice(value){return value?(String(value).trim().startsWith('R$')?String(value).trim():`R$ ${String(value).trim()}`):'Valor sob consulta';}

export function productImages(product){return [...new Set([product.image,...(Array.isArray(product.images)?product.images:[])].filter(value=>typeof value==='string'&&value))];}
