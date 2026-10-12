// Marca fichas como revisadas por una persona. SOLO usar cuando la revisión se ha hecho de verdad.
// Uso: node scripts/mark-reviewed.mjs codigo-p0420 codigo-p0300 [--by "Carlos Peláez"] [--date 2026-10-20]
//      node scripts/mark-reviewed.mjs --unmark codigo-p0420   (quita la marca)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i > -1 ? args[i + 1] : d; };
const by = opt('--by', 'Carlos Peláez'), date = opt('--date', new Date().toISOString().slice(0, 10));
const unmark = args.includes('--unmark');
const skip = new Set(['--by', by, '--date', date, '--unmark']);
const keys = args.filter((a) => !skip.has(a));
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
