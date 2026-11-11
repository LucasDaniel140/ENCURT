// ENCURT - encurtador de links simples, sem dependências externas.
// Roda como servidor local (npm start) e como função serverless na Vercel (api/index.js).
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const store = require('./store');

const TIMER_SECONDS = 5;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const NO_STORE_MSG =
  'Armazenamento não configurado. Na Vercel, conecte um banco Upstash Redis ao projeto (aba Storage) e faça um novo deploy.';

// ---------- Utilidades ----------
function newCode() {
  return Array.from(crypto.randomBytes(6), (b) => ALPHABET[b % ALPHABET.length]).join('');
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function parseUrl(input) {
  if (typeof input !== 'string') return null;
  let value = input.trim();
  if (!value || value.length > 2048) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) value = 'https://' + value; // aceita "site.com"
  try {
    const u = new URL(value);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (!u.hostname.includes('.') && u.hostname !== 'localhost') return null;
    return u.href;
  } catch {
    return null;
  }
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function sendHtml(res, status, html) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(html);
}

function readStream(req, limit = 10 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('payload muito grande'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// Na Vercel o corpo já chega processado em req.body; localmente lemos o stream.
async function readJson(req) {
  const body = req.body !== undefined ? req.body : await readStream(req);
  if (Buffer.isBuffer(body)) return JSON.parse(body.toString('utf8'));
  return typeof body === 'string' ? JSON.parse(body) : body;
}

function baseUrl(req) {
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/+$/, '');
  const proto = String(req.headers['x-forwarded-proto'] || 'http').split(',')[0].trim();
  return `${proto}://${req.headers['x-forwarded-host'] || req.headers.host}`;
}

// ---------- Páginas ----------
function page(title, body) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${title}</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0f172a;color:#e2e8f0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:16px;box-sizing:border-box}
  .card{width:100%;max-width:440px;background:#1e293b;border-radius:16px;padding:32px;text-align:center;box-sizing:border-box}
  .count{font-size:72px;font-weight:700;color:#38bdf8;line-height:1;margin:16px 0;font-variant-numeric:tabular-nums}
  .dest{color:#94a3b8;font-size:14px;word-break:break-all;margin:16px 0 0}
  a{color:#38bdf8}
  h1{font-size:20px;margin:0}
</style>
</head>
<body><div class="card">${body}</div></body>
</html>`;
}

function timerPage(url) {
  const safe = escapeHtml(url);
  return page('Redirecionando...', `
  <h1>Você será redirecionado em</h1>
  <div class="count" id="count">${TIMER_SECONDS}</div>
  <p class="dest">Destino: ${safe}</p>
  <noscript><meta http-equiv="refresh" content="${TIMER_SECONDS};url=${safe}"></noscript>
  <script>
    var left = ${TIMER_SECONDS};
    var dest = ${JSON.stringify(url).replace(/</g, '\\u003c')};
    var el = document.getElementById('count');
    var t = setInterval(function () {
      left--;
      el.textContent = Math.max(left, 0);
      if (left <= 0) { clearInterval(t); location.replace(dest); }
    }, 1000);
  </script>`);
}

function messagePage(title, text) {
  return page(title, `
  <h1>${title}</h1>
  <p class="dest">${text}</p>
  <p><a href="/">Criar um link</a></p>`);
}

// ---------- Rotas ----------
async function handler(req, res) {
  const { pathname } = new URL(req.url, 'http://localhost');

  try {
    if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
      return sendHtml(res, 200, fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8'));
    }

    if (req.method === 'POST' && pathname === '/api/shorten') {
      if (!store) return sendJson(res, 503, { error: NO_STORE_MSG });
      let data;
      try {
        data = await readJson(req);
      } catch {
        return sendJson(res, 400, { error: 'Requisição inválida.' });
      }
      const url = parseUrl(data && data.url);
      if (!url) return sendJson(res, 400, { error: 'Informe um link válido (http ou https).' });

      const link = { url, timer: data.timer === true, createdAt: new Date().toISOString() };
      let code;
      do {
        code = newCode();
      } while (!(await store.create(code, link)));
      return sendJson(res, 201, { code, shortUrl: `${baseUrl(req)}/${code}`, url, timer: link.timer });
    }

    if (req.method === 'GET' || req.method === 'HEAD') {
      if (!store) return sendHtml(res, 503, messagePage('Serviço não configurado', NO_STORE_MSG));
      const code = pathname.slice(1);
      const link = /^[a-zA-Z0-9]{1,32}$/.test(code) ? await store.get(code) : null;
      if (!link) return sendHtml(res, 404, messagePage('Link não encontrado', 'Esse link curto não existe ou foi removido.'));

      if (req.method === 'GET') await store.hit(code).catch((err) => console.error(err));
      if (link.timer) return sendHtml(res, 200, timerPage(link.url));
      res.writeHead(302, { Location: link.url, 'Cache-Control': 'no-store' });
      return res.end();
    }

    sendJson(res, 405, { error: 'Método não permitido.' });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) sendJson(res, 500, { error: 'Erro interno. Tente novamente.' });
  }
}

module.exports = handler;

// Execução local: npm start
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  http.createServer(handler).listen(PORT, () => console.log(`ENCURT rodando em http://localhost:${PORT}`));
}
