// ENCURT - encurtador de links simples, sem dependências externas.
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'links.json');
const INDEX_FILE = path.join(__dirname, 'public', 'index.html');
const TIMER_SECONDS = 5;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// ---------- Armazenamento (arquivo JSON) ----------
fs.mkdirSync(DATA_DIR, { recursive: true });
let links = {};
if (fs.existsSync(DATA_FILE)) {
  links = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function save() {
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(links, null, 2));
  fs.renameSync(tmp, DATA_FILE); // escrita atômica: não corrompe se o processo cair
}

function newCode() {
  let code;
  do {
    code = Array.from(crypto.randomBytes(6), (b) => ALPHABET[b % ALPHABET.length]).join('');
  } while (links[code]);
  return code;
}

// ---------- Utilidades ----------
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

function readBody(req, limit = 10 * 1024) {
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

function baseUrl(req) {
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/+$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'http';
  return `${proto}://${req.headers.host}`;
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

function notFoundPage() {
  return page('Link não encontrado', `
  <h1>Link não encontrado</h1>
  <p class="dest">Esse link curto não existe ou foi removido.</p>
  <p><a href="/">Criar um link</a></p>`);
}

// ---------- Servidor ----------
const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  try {
    if (req.method === 'GET' && pathname === '/') {
      return sendHtml(res, 200, fs.readFileSync(INDEX_FILE, 'utf8'));
    }

    if (req.method === 'POST' && pathname === '/api/shorten') {
      let data;
      try {
        data = JSON.parse(await readBody(req));
      } catch {
        return sendJson(res, 400, { error: 'Requisição inválida.' });
      }
      const url = parseUrl(data && data.url);
      if (!url) return sendJson(res, 400, { error: 'Informe um link válido (http ou https).' });

      const code = newCode();
      links[code] = { url, timer: data.timer === true, clicks: 0, createdAt: new Date().toISOString() };
      save();
      return sendJson(res, 201, { code, shortUrl: `${baseUrl(req)}/${code}`, url, timer: links[code].timer });
    }

    if (req.method === 'GET' || req.method === 'HEAD') {
      const link = links[pathname.slice(1)];
      if (!link || !Object.hasOwn(links, pathname.slice(1))) return sendHtml(res, 404, notFoundPage());

      if (req.method === 'GET') {
        link.clicks++;
        save();
      }
      if (link.timer) return sendHtml(res, 200, timerPage(link.url));
      res.writeHead(302, { Location: link.url, 'Cache-Control': 'no-store' });
      return res.end();
    }

    sendJson(res, 405, { error: 'Método não permitido.' });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) sendJson(res, 500, { error: 'Erro interno.' });
  }
});

server.listen(PORT, () => console.log(`ENCURT rodando em http://localhost:${PORT}`));
