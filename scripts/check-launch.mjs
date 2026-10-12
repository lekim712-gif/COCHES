// Bloqueantes de lanzamiento: se ejecuta tras el build de producción (npm run build:prod).
// Falla si queda algún marcador [PENDIENTE] en el HTML generado o si falta información obligatoria.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { existsSync } from 'node:fs';
if (existsSync('.env')) for (const l of readFileSync('.env', 'utf8').split('\n')) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m && !(m[1] in process.env)) process.env[m[1]] = m[2]; }
const errors = [], warns = [];
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
for (const f of walk('dist').filter((f) => f.endsWith('.html'))) {
  if (readFileSync(f, 'utf8').includes('[PENDIENTE]')) errors.push(`${f}: contiene [PENDIENTE] (datos del titular sin definir)`);
}
for (const v of ['PUBLIC_OWNER_NAME', 'PUBLIC_OWNER_TAXID', 'PUBLIC_OWNER_ADDRESS']) if (!process.env[v]) errors.push(`falta la variable ${v} (aviso legal y política de privacidad)`);
if (!process.env.SITE_URL || /example|localhost/.test(process.env.SITE_URL)) errors.push('SITE_URL no es el dominio real');
if (!process.env.PUBLIC_ADSENSE_CLIENT) warns.push('PUBLIC_ADSENSE_CLIENT vacío: no se mostrarán anuncios (correcto hasta que AdSense apruebe)');
if (!process.env.PUBLIC_AMAZON_TAG) warns.push('PUBLIC_AMAZON_TAG vacío: no se mostrarán enlaces de afiliación');
warns.forEach((w) => console.warn('  aviso ', w));
if (errors.length) { console.error('\n✗ NO listo para publicar:'); errors.forEach((e) => console.error('  ', e)); process.exit(1); }
console.log('✓ Comprobación de lanzamiento superada');
