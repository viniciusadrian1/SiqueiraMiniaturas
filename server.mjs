import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg':'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
const port = Number(process.env.PORT || 4173);
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const route = pathname === '/' ? '/index.html' : /^\/admin\/?$/.test(pathname) ? '/admin/index.html' : pathname;
    const target = path.resolve(root, '.' + route);
    const relative = path.relative(root, target);
    const rootFiles = ['index.html','app.js','catalog.js','catalog-data.js','motion.js','motion.css','hero-refinement.css','showcase.css','responsive.css'];
    const allowed = rootFiles.includes(relative) || /^(assets|admin|content)[\\/]/.test(relative);
    if (!allowed || relative.startsWith('..') || path.isAbsolute(relative) || !types[path.extname(target)] || relative.split(path.sep).some(p => p.startsWith('.'))) {
      res.writeHead(404); return res.end('Não encontrado');
    }
    const content = await readFile(target);
    res.writeHead(200, { 'Content-Type': types[path.extname(target)], 'X-Content-Type-Options': 'nosniff' });
    res.end(content);
  } catch { res.writeHead(404); res.end('Não encontrado'); }
}).listen(port, '127.0.0.1', () => console.log(`Siqueira Miniaturas: http://localhost:${port}`));
