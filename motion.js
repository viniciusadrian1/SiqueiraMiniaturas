// Native scroll, compressed frames and one decoded bitmap at a time.
const scene = document.querySelector('.scroll-scene');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const canvas = document.querySelector('.race-canvas');
const context = canvas?.getContext('2d', { alpha: false });
const frameCount = 192;
const frames = new Map();
const pending = new Set();
const failed = new Set();
const bitmaps = new Map();
let smoothFrame = 0;
let lastTick = 0;
let idealFrame = 0;
let targetFrame = 0, displayedFrame = -1, requestedFrame = 0, activeLoads = 0;
let decoding = false;
async function paintFrame() {
  if (!context || decoding || reducedMotion.matches) return;
  const available = [...frames.keys()];
  if (!available.length) return;
  const index = available.reduce((best, n) => Math.abs(n - targetFrame) < Math.abs(best - targetFrame) ? n : best);
  if (index === displayedFrame) return;
  decoding = true;
  try {
    let bitmap = bitmaps.get(index);
    if (!bitmap) {
      bitmap = await createImageBitmap(frames.get(index));
      bitmaps.set(index, bitmap);
    }
    // Keep a small decoded working set for quick direction changes (~42 MB max).
    bitmaps.delete(index);
    bitmaps.set(index, bitmap);
    while (bitmaps.size > 12) {
      const oldest = bitmaps.keys().next().value;
      bitmaps.get(oldest).close();
      bitmaps.delete(oldest);
    }
    if (!reducedMotion.matches) {
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      displayedFrame = index;
      canvas.dataset.frame = String(index);
      canvas.classList.add('ready');
    }
  } catch { frames.delete(index); failed.add(index); }
  finally { decoding = false; requestRender(); }
}
function fillQueue() {
  if (reducedMotion.matches || !context || !('createImageBitmap' in window)) return;
  const candidates = Array.from({ length: frameCount }, (_, n) => n)
    .filter(n => !frames.has(n) && !pending.has(n) && !failed.has(n))
    .sort((a, b) => Math.abs(a - targetFrame) - Math.abs(b - targetFrame));
  while (activeLoads < 4 && candidates.length) {
    const index = candidates.shift();
    pending.add(index); activeLoads++;
    fetch(`assets/race-sequence/frame-${String(index + 1).padStart(3, '0')}.webp`)
      .then(response => { if (!response.ok) throw new Error('Frame unavailable'); return response.blob(); })
      .then(blob => frames.set(index, blob))
      .catch(() => failed.add(index))
      .finally(() => { pending.delete(index); activeLoads--; requestRender(); });
  }
}
function renderScroll(now = performance.now()) {
  requestedFrame = 0;
  if (!scene) return;
  const bounds = scene.getBoundingClientRect();
  const distance = Math.max(1, bounds.height - scene.querySelector('.hero-frame').offsetHeight);
  const progress = reducedMotion.matches ? 0 : Math.min(1, Math.max(0, -bounds.top / distance));
  idealFrame = progress * (frameCount - 1);
  const delta = Math.min(64, Math.max(0, now - (lastTick || now - 16)));
  lastTick = now;
  smoothFrame += (idealFrame - smoothFrame) * (1 - Math.exp(-delta / 65));
  if (Math.abs(idealFrame - smoothFrame) < .05) smoothFrame = idealFrame;
  targetFrame = Math.round(smoothFrame);
  scene.style.setProperty('--progress', progress.toFixed(4));
  const compact = window.matchMedia('(max-width: 760px)').matches;
  // Keep the copy present in the mobile layout while the car moves below it.
  scene.style.setProperty('--intro-opacity', compact ? String(progress < .45 ? 1 : 0) : Math.max(0, 1 - progress * 3).toFixed(4));
  scene.style.setProperty('--detail-opacity', compact ? String(progress < .45 ? 0 : 1) : Math.min(1, Math.max(0, (progress - .45) / .25)).toFixed(4));
  if (reducedMotion.matches) {
    smoothFrame = 0;
    canvas?.classList.remove('ready');
    for (const bitmap of bitmaps.values()) bitmap.close();
    bitmaps.clear();
    return;
  }
  fillQueue(); paintFrame();
  if (smoothFrame !== idealFrame) requestRender();
}
function requestRender() { if (!requestedFrame) requestedFrame = requestAnimationFrame(renderScroll); }
window.addEventListener('scroll', requestRender, { passive: true });
window.addEventListener('resize', requestRender);
reducedMotion.addEventListener('change', () => { displayedFrame = -1; requestRender(); });
renderScroll();
document.querySelectorAll('[data-filter-link]').forEach(link => link.addEventListener('click', () => {
  const filter = document.querySelector(`[data-category="${link.dataset.filterLink}"]`);
  const search = document.querySelector('#search');
  if (search) search.value = '';
  filter?.click();
}));
