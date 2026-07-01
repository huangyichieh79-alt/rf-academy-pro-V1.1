'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const { ensureLessons } = require('./ensure_lessons.js');

const ROOT = path.resolve(__dirname, '..');
const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT) || 8080;
const MIME = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml; charset=utf-8', '.md': 'text/markdown; charset=utf-8'
};

ensureLessons();

const server = http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host || HOST}`).pathname); }
  catch { response.writeHead(400).end('Bad request'); return; }
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const file = path.resolve(ROOT, relative);
  if (file !== ROOT && !file.startsWith(`${ROOT}${path.sep}`)) { response.writeHead(403).end('Forbidden'); return; }
  fs.stat(file, (statError, stats) => {
    if (statError || !stats.isFile()) { response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found'); return; }
    const extension = path.extname(file).toLowerCase();
    const noCache = ['.html', '.js', '.json'].includes(extension) || path.basename(file) === 'service-worker.js';
    response.writeHead(200, {
      'Content-Type': MIME[extension] || 'application/octet-stream',
      'Cache-Control': noCache ? 'no-cache, no-store, must-revalidate' : 'public, max-age=3600',
      'Service-Worker-Allowed': '/'
    });
    fs.createReadStream(file).on('error', () => response.destroy()).pipe(response);
  });
});

server.on('error', error => {
  console.error(`Unable to start RF Academy on port ${PORT}: ${error.message}`);
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}/`;
  console.log(`RF Academy Pro is running at ${url}`);
  console.log('Press Ctrl+C to stop the local server.');
  if (process.env.RF_OPEN_BROWSER === '1' && process.platform === 'win32') {
    const child = spawn('cmd.exe', ['/c', 'start', '', url], { detached: true, stdio: 'ignore', windowsHide: true });
    child.unref();
  }
});
