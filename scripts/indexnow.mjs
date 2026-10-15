// Avisa a Bing, Yandex y otros buscadores con IndexNow de las URLs del sitio (no sirve para Google).
// La clave es pública por diseño: se verifica con public/<clave>.txt. Uso: node scripts/indexnow.mjs
import { readFileSync, readdirSync } from 'node:fs';
const host = 'obdcodigos.com';
const key = readdirSync('public').map((f) => f.match(/^([0-9a-f]{32})\.txt$/)?.[1]).find(Boolean);
if (!key) { console.log('Sin clave IndexNow'); process.exit(0); }
const xml = readFileSync('dist/sitemap-0.xml', 'utf8');
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const r = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList }),
});
console.log(`IndexNow: ${urlList.length} URLs, respuesta ${r.status}`);
