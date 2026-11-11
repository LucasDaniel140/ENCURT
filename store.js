// Armazenamento dos links.
// - Com KV_REST_API_URL/KV_REST_API_TOKEN (Upstash Redis, integrado à Vercel): usa Redis via REST.
// - Sem essas variáveis, fora da Vercel: usa um arquivo JSON local (bom para desenvolvimento).
// - Na Vercel sem Redis configurado: sem armazenamento (o disco é somente leitura).
const fs = require('fs');
const path = require('path');

const REDIS_URL = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/+$/, '');
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

function redisStore() {
  async function cmd(...args) {
    const res = await fetch(REDIS_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(`Redis: ${data.error || res.status}`);
    return data.result;
  }
  return {
    kind: 'redis',
    // Retorna false se o código já existir.
    async create(code, link) {
      return (await cmd('SET', `link:${code}`, JSON.stringify(link), 'NX')) === 'OK';
    },
    async get(code) {
      const raw = await cmd('GET', `link:${code}`);
      return raw ? JSON.parse(raw) : null;
    },
    async hit(code) {
      await cmd('INCR', `clicks:${code}`);
    },
  };
}

function fileStore() {
  const dir = process.env.DATA_DIR || path.join(__dirname, 'data');
  const file = path.join(dir, 'links.json');
  fs.mkdirSync(dir, { recursive: true });
  const links = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const has = (code) => Object.hasOwn(links, code);
  function save() {
    fs.writeFileSync(file + '.tmp', JSON.stringify(links, null, 2));
    fs.renameSync(file + '.tmp', file); // escrita atômica
  }
  return {
    kind: 'file',
    async create(code, link) {
      if (has(code)) return false;
      links[code] = { ...link, clicks: 0 };
      save();
      return true;
    },
    async get(code) {
      return has(code) ? links[code] : null;
    },
    async hit(code) {
      if (!has(code)) return;
      links[code].clicks++;
      save();
    },
  };
}

if (REDIS_URL && REDIS_TOKEN) module.exports = redisStore();
else if (process.env.VERCEL) module.exports = null;
else module.exports = fileStore();
