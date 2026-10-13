// Puerta de calidad: el build falla si un artículo incumple la estructura obligatoria.
// Se ejecuta sobre todo el contenido, también sobre lo que genere la automatización.
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateArticle, urlKey, SIM_WARN, SIM_ERROR } from './lib/validate.mjs';
import { shingles, jaccard, bodyText } from './lib/similarity.mjs';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'articulos');
const errors = [], warns = [], seen = new Map(), corpus = [];

for (const file of readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  let a;
  try { a = JSON.parse(readFileSync(join(DIR, file), 'utf8')); } catch (x) { errors.push(`${file}: JSON inválido (${x.message})`); continue; }
  const r = validateArticle(a);
  r.errors.forEach((m) => errors.push(`${file}: ${m}`));
  r.warns.forEach((m) => warns.push(`${file}: ${m}`));
  if (!a.seo || !a.content_html) continue;
  for (const [k, label] of [[urlKey(a), 'URL'], [`t:${a.seo.meta_title}`, 'meta_title'], [`d:${a.seo.meta_description}`, 'meta_description']]) {
    if (seen.has(k)) errors.push(`${file}: ${label} duplicado con ${seen.get(k)}`); else seen.set(k, file);
  }
  corpus.push({ file, type: a.type, sh: shingles(bodyText(a)) });
}
// Contenido casi duplicado entre fichas del mismo tipo (riesgo de contenido fino).
for (let i = 0; i < corpus.length; i++) for (let j = i + 1; j < corpus.length; j++) {
  if (corpus[i].type !== corpus[j].type) continue;
  const s = jaccard(corpus[i].sh, corpus[j].sh);
  if (s >= SIM_ERROR) errors.push(`${corpus[i].file} ~ ${corpus[j].file}: contenido demasiado parecido (${(s * 100).toFixed(0)} %)`);
  else if (s >= SIM_WARN) warns.push(`${corpus[i].file} ~ ${corpus[j].file}: contenido parecido (${(s * 100).toFixed(0)} %)`);
}

for (const m of warns) console.warn('  aviso ', m);
if (errors.length) { console.error(`\n✗ ${errors.length} error(es) de contenido:`); for (const m of errors) console.error('  ', m); process.exit(1); }
console.log(`✓ ${corpus.length} artículos válidos${warns.length ? ` (${warns.length} avisos)` : ''}`);
