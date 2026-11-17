export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function imageURL(value) {
  const text = String(value || '');
  if (/^\/?assets\/[\p{L}\p{N} _()./-]+$/u.test(text) && !text.includes('..')) return text.split('/').map(part => encodeURIComponent(part)).join('/');
  return 'assets/brand/favicon.svg';
}
export function publicCatalog(data) {
  const categories = (data.categories || []).filter(c => c.visible !== false);
  const ids = new Set(categories.map(c => c.id));
  return {categories, products:(data.products || []).filter(p => p.published !== false && ids.has(p.category))};
}
