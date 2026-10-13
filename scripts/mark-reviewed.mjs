// Marca fichas como revisadas por una persona. SOLO usar cuando la revisión se ha hecho de verdad.
// Uso: node scripts/mark-reviewed.mjs todas   (todas las pendientes)
//      node scripts/mark-reviewed.mjs codigo-p0420 codigo-p0300 [--by "Carlos Peláez"] [--date 2026-10-20]
//      node scripts/mark-reviewed.mjs --unmark codigo-p0420   (quita la marca)
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i > -1 ? args[i + 1] : d; };
const by = opt('--by', 'Carlos Peláez'), date = opt('--date', new Date().toISOString().slice(0, 10));
const unmark = args.includes('--unmark');
const skip = new Set(['--by', by, '--date', date, '--unmark']);
let keys = args.filter((a) => !skip.has(a));
if (keys.includes('todas')) { // todas las fichas que aún no tienen revisión
  keys = readdirSync('src/content/articulos').filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5))
    .filter((k) => !JSON.parse(readFileSync(`src/content/articulos/${k}.json`, 'utf8')).reviewed_by);
  console.log(`«todas»: ${keys.length} fichas pendientes`);
}
if (!keys.length) { console.error('indica al menos una ficha (p. ej. codigo-p0420)'); process.exit(1); }
for (const k of keys) {
  const f = `src/content/articulos/${k}.json`;
  if (!existsSync(f)) { console.error('no existe', f); continue; }
  const a = JSON.parse(readFileSync(f, 'utf8'));
  if (unmark) { delete a.reviewed_by; delete a.reviewed_at; }
  else { a.reviewed_by = by; a.reviewed_at = date; a.dateModified = date > a.dateModified ? date : a.dateModified; }
  writeFileSync(f, JSON.stringify(a, null, 2) + '\n');
  console.log(unmark ? 'desmarcada' : `revisada por ${by} (${date})`, k);
}
