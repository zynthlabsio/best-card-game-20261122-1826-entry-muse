// SPDX-License-Identifier: MIT
// Tiny static file server for local play-testing: `node serve.ts [--port N]`
// serves game/ at http://localhost:8080. Standard library only.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const args = process.argv.slice(2);
const pi = args.indexOf('--port');
const req = pi === -1 ? 8080 : Number(args[pi + 1]);
const port = Number.isInteger(req) && req > 0 && req < 65536 ? req : 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.wasm': 'application/wasm',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.txt': 'text/plain; charset=utf-8',
};

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { response.writeHead(400).end('bad request'); return; }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = resolve(join(root, normalize(pathname)));
  if (file !== root && !file.startsWith(root + sep)) { response.writeHead(403).end('forbidden'); return; }
  try {
    const stats = statSync(file);
    if (!stats.isFile()) throw new Error('not a file');
    response.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream', 'content-length': stats.size });
    createReadStream(file).pipe(response);
  } catch { response.writeHead(404).end('not found'); }
}).listen(port, () => console.log(`Embercrown at http://localhost:${port}`));
