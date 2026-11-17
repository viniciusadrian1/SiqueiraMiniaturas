export const site = { name: 'Siqueira Miniaturas', whatsapp: '5511987951099' };
export function whatsappURL(message) { return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`; }
