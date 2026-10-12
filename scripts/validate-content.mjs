// Puerta de calidad: el build falla si un artículo incumple la estructura obligatoria.
// Pensada para ejecutarse también sobre el contenido que genere la API de forma automática.
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'articulos');
const TYPES = ['codigo', 'testigo', 'guia', 'marca'];
const errors = [];
const warns = [];
const seen = new Map();
const words = (html) => html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const count = (html, re) => (html.match(re) || []).length;

for (const file of readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  const e = (m) => errors.push(`${file}: ${m}`);
  const w = (m) => warns.push(`${file}: ${m}`);
  let a;
  try { a = JSON.parse(readFileSync(join(DIR, file), 'utf8')); } catch (x) { e(`JSON inválido (${x.message})`); continue; }

  if (!TYPES.includes(a.type)) e(`type inválido: ${a.type}`);
  for (const k of ['seo', 'content_html', 'featured_image_prompt', 'schema_faq', 'datePublished', 'dateModified']) if (!a[k]) e(`falta ${k}`);
  if (!a.seo || !a.content_html) continue;

  const { meta_title: t, meta_description: d, slug } = a.seo;
  if (!t || t.length > 65) e(`meta_title vacío o >65 caracteres (${t?.length})`);
  else if (t.length > 60) w(`meta_title de ${t.length} caracteres (>60)`);
  if (!d || d.length < 110 || d.length > 165) e(`meta_description fuera de 110–165 caracteres (${d?.length})`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug || '')) e(`slug inválido: ${slug}`);

  const key = a.type === 'marca' ? `marca/${a.brand}/${slug}` : `${a.type}/${slug}`;
  if (seen.has(key)) e(`URL duplicada con ${seen.get(key)}`); else seen.set(key, file);
  if (seen.has(`t:${t}`)) e(`meta_title duplicado con ${seen.get(`t:${t}`)}`); else seen.set(`t:${t}`, file);
  if (seen.has(`d:${d}`)) e(`meta_description duplicada con ${seen.get(`d:${d}`)}`); else seen.set(`d:${d}`, file);

  const h = a.content_html;
  if (count(h, /<h1[ >]/g) !== 1) e('debe haber exactamente un <h1>');
  if (!/<table/.test(h)) e('falta la ficha técnica (<table>)');
  if (!/<ol>/.test(h)) e('falta la guía paso a paso (<ol>)');
  if (a.type !== 'guia' && !/<h2>Síntomas habituales/.test(h)) e('falta «Síntomas habituales»');
  if (a.type !== 'guia' && !/<h2>Causas principales/.test(h)) e('falta «Causas principales»');
  if (!h.includes('<!--ad-slot-1-->') || !h.includes('<!--ad-slot-2-->')) e('faltan marcadores de anuncio');
  if (/<script|onerror=|javascript:/i.test(h)) e('HTML con script o atributo peligroso');

  const intro = h.match(/<p class="intro">([\s\S]*?)<\/p>/)?.[1];
  if (!intro) e('falta <p class="intro">');
  else {
    const n = words(intro);
    if (n < 40 || n > 85) e(`introducción de ${n} palabras (objetivo 60–80)`);
    if (/^(en este artículo|a continuación|bienvenid)/i.test(intro.trim())) e('introducción vacía («En este artículo…»)');
  }
  if (!Array.isArray(a.schema_faq) || a.schema_faq.length < 3) e('FAQ: mínimo 3 preguntas');
  else for (const q of a.schema_faq) if (!q.question || !q.answer) e('FAQ con pregunta o respuesta vacía');

  if (a.type === 'marca') {
    if ((a.brand_specific_points ?? 0) < 3) e('página de marca sin al menos 3 particularidades propias: no se publica (contenido fino)');
    if (!/<h2>Particularidades/.test(h)) e('falta bloque «Particularidades»');
  }
  if (words(h) < 350 && a.type !== 'guia') w(`solo ${words(h)} palabras`);
}

for (const m of warns) console.warn('  aviso ', m);
if (errors.length) { console.error(`\n✗ ${errors.length} error(es) de contenido:`); for (const m of errors) console.error('  ', m); process.exit(1); }
console.log(`✓ ${seen.size / 3} artículos válidos${warns.length ? ` (${warns.length} avisos)` : ''}`);
