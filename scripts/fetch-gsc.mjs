// Descarga datos de Search Console (API oficial) con una cuenta de servicio y los guarda en content-plan/gsc/.
// Sin dependencias: firma el JWT con node:crypto. Variables: GSC_SERVICE_ACCOUNT (JSON), GSC_SITE (p. ej. sc-domain:obdcodigos.com).
import { createSign } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';

const raw = process.env.GSC_SERVICE_ACCOUNT;
const site = process.env.GSC_SITE || 'sc-domain:obdcodigos.com';
if (!raw) { console.error('Falta el secreto GSC_SERVICE_ACCOUNT'); process.exit(2); }
const sa = JSON.parse(raw);
const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');

async function token() {
  const now = Math.floor(Date.now() / 1000);
  const head = b64({ alg: 'RS256', typ: 'JWT' });
  const claim = b64({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 });
  const sig = createSign('RSA-SHA256').update(`${head}.${claim}`).sign(sa.private_key, 'base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${claim}.${sig}` }) });
  const j = await r.json();
  if (!j.access_token) throw new Error('Token: ' + JSON.stringify(j));
  return j.access_token;
}

const day = (d) => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10);
const tk = await token();
async function query(dimensions, rowLimit = 500) {
  const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: 'POST', headers: { authorization: `Bearer ${tk}`, 'content-type': 'application/json' },
    body: JSON.stringify({ startDate: day(90), endDate: day(2), dimensions, rowLimit }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(j)}`);
  return (j.rows || []).map((x) => ({ keys: x.keys, clicks: x.clicks, impressions: x.impressions, ctr: +x.ctr.toFixed(4), position: +x.position.toFixed(1) }));
}

mkdirSync('content-plan/gsc', { recursive: true });
const out = { site, generated: new Date().toISOString().slice(0, 10), range: [day(90), day(2)], queries: await query(['query']), pages: await query(['page']), query_page: await query(['query', 'page'], 1000) };
writeFileSync('content-plan/gsc/latest.json', JSON.stringify(out, null, 1) + '\n');
console.log(`GSC ok: ${out.queries.length} consultas, ${out.pages.length} páginas (${out.range.join(' → ')})`);
