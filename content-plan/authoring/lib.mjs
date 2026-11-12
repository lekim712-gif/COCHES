// Utilidades para crear y ampliar fichas de obdcodigos.com (reconstruido 12/11/2026).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { buildHtml, esc, tablaRows } from '../../scripts/lib/article.mjs';
const DIR = new URL('../../src/content/articulos', import.meta.url).pathname;
const today = () => new Date().toISOString().slice(0, 10);
export const P = (t) => `<p>${esc(t)}</p>`;
export const H3 = (t) => `<h3>${esc(t)}</h3>`;
export const UL = (a) => `<ul>${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
export const OL = (a) => `<ol>${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`;
export const TIP = (t) => `<blockquote class="tip"><strong>Consejo:</strong> ${esc(t)}</blockquote>`;
export const TBL = (head, rows) => `<table class="cmp"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
export const SEC = (h2, ...blocks) => `<h2>${esc(h2)}</h2>${blocks.join('')}`;
export const F = (gravedad, sistemas, coste, herramientas) => ({ gravedad, sistemas, coste, herramientas });
const file = (k) => `${DIR}/${k}.json`;
const words = (h) => h.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const faqObj = (f) => f.map(([question, answer]) => ({ question, answer }));
const h2title = (s) => (s.match(/^<h2>(.*?)<\/h2>/) || [])[1];
const AD2 = '<!--ad-slot-2-->';

// Parte content_html en: pre (h1, intro), y secciones h2 (cada una con su h2). Devuelve también el sufijo de anuncio.
function split(html) {
  let tail = '';
  if (html.trimEnd().endsWith(AD2)) { html = html.trimEnd().slice(0, -AD2.length).trimEnd(); tail = AD2; }
  const parts = html.split(/\n?(?=<h2>)/);
  const pre = parts.shift();
  return { pre, secs: parts.map((s) => s.trim()).filter(Boolean), tail };
}
const join = ({ pre, secs, tail }) => [pre, ...secs, tail].filter(Boolean).join('\n');
const cleanTitle = (t) => t.replace(/&amp;/g, '&');

// Amplía una ficha existente. start: tras «Causas principales»; middle: antes del paso a paso; after: tras el paso a paso.
// Si ya existe una sección con el mismo título, se sustituye en su sitio.
export function enrich(key, { start = [], middle = [], after = [], faq = [] }) {
  const a = JSON.parse(readFileSync(file(key), 'utf8'));
  const d = split(a.content_html);
  const place = (list, where) => {
    for (const html of list) {
      const t = cleanTitle(h2title(html) || '');
      const i = d.secs.findIndex((s) => cleanTitle(h2title(s) || '') === t);
      if (i >= 0) { d.secs[i] = html; continue; }
      let idx;
      const iSteps = d.secs.findIndex((s) => /<ol>/.test(s) && !/^<h2>(Ficha técnica)/.test(s));
      const iCauses = d.secs.findIndex((s) => h2title(s) === 'Causas principales');
      if (where === 'start') idx = iCauses >= 0 ? iCauses + 1 : 0;
      else if (where === 'middle') idx = iSteps >= 0 ? iSteps : d.secs.length;
      else idx = iSteps >= 0 ? iSteps + 1 : d.secs.length;
      d.secs.splice(idx, 0, html);
    }
  };
  // se colocan en orden para que el orden de los bloques de cada zona se conserve
  const ins = (list, where) => list.forEach((h) => place([h], where));
  ins(start, 'start'); ins(middle, 'middle'); ins(after, 'after');
  a.content_html = join(d);
  const have = new Set(a.schema_faq.map((q) => q.question));
  for (const [question, answer] of faq) if (!have.has(question)) a.schema_faq.push({ question, answer });
  a.dateModified = today();
  writeFileSync(file(key), JSON.stringify(a, null, 2) + '\n');
  console.log(key, words(a.content_html), 'palabras,', a.schema_faq.length, 'FAQ');
}

// Crea una ficha nueva. Campos: type, code, slug, name|title, desc, intro, tabla, sintomas, causas, before, pasosTitle, pasos, after, faq, products, related, metaTitle.
export function create(key, s) {
  const name = s.title || s.name;
  const h1 = s.h1 || (s.type === 'codigo' ? `Código ${s.code}: ${name}` : name);
  const slug = s.slug || key.split('-').slice(1).join('-');
  const metaTitle = s.metaTitle || (s.type === 'codigo' ? `Código ${s.code}: causas, síntomas y solución` : name.slice(0, 65));
  const prev = existsSync(file(key)) ? JSON.parse(readFileSync(file(key), 'utf8')) : null;
  const html = buildHtml({ h1, intro: s.intro, tabla: tablaRows(s.tabla), sintomas: s.sintomas, causas: s.causas, pasos: s.pasos, pasosTitle: s.pasosTitle, extra: (s.before || []).join(''), after: (s.after || []).join('') });
  const a = {
    type: s.type, ...(s.code ? { code: s.code } : {}), name,
    datePublished: prev?.datePublished || today(), dateModified: today(),
    review_status: 'draft-ia', generated_by: 'Claude (redactada en sesión de trabajo)',
    seo: { meta_title: metaTitle, meta_description: s.desc, slug },
    content_html: html,
    featured_image_prompt: 'Ilustración vectorial propia del sitio generada automáticamente; sin servicios externos.',
    schema_faq: faqObj(s.faq || []),
    products: s.products || [], related: s.related || [],
    ...(prev?.featured_image ? { featured_image: prev.featured_image } : {}),
  };
  writeFileSync(file(key), JSON.stringify(a, null, 2) + '\n');
  console.log(key, words(html), 'palabras,', a.schema_faq.length, 'FAQ');
}

// Reescribe una guía completa (mantiene fechas y revisión si existían).
export function rewrite(key, { title, metaTitle, desc, intro, tabla, before = [], pasosTitle, pasos, after = [], faq, products, related }) {
  const prev = existsSync(file(key)) ? JSON.parse(readFileSync(file(key), 'utf8')) : {};
  create(key, { type: 'guia', title, metaTitle, desc, intro, tabla, before, pasosTitle, pasos, after, faq: faq || (prev.schema_faq || []).map((q) => [q.question, q.answer]), products: products || prev.products, related: related || prev.related });
  if (prev.reviewed_by) { const a = JSON.parse(readFileSync(file(key), 'utf8')); a.reviewed_by = prev.reviewed_by; a.reviewed_at = prev.reviewed_at; writeFileSync(file(key), JSON.stringify(a, null, 2) + '\n'); }
}

// Entrada de blog nueva: type 'blog'. secciones: [SEC(..)]. Sin ficha técnica ni pasos obligatorios.
export function createBlog(key, { title, metaTitle, desc, intro, sections, faq, products = [], related = [] }) {
  const slug = key.replace(/^blog-/, '');
  const prev = existsSync(file(key)) ? JSON.parse(readFileSync(file(key), 'utf8')) : null;
  const html = [`<h1>${esc(title)}</h1>`, `<p class="intro">${esc(intro)}</p>`, '<!--ad-slot-1-->', ...sections, '<!--ad-slot-2-->'].join('\n');
  const a = {
    type: 'blog', name: title, datePublished: prev?.datePublished || today(), dateModified: today(),
    review_status: 'draft-ia', generated_by: 'Claude (redactada en sesión de trabajo)',
    seo: { meta_title: metaTitle || title.slice(0, 65), meta_description: desc, slug },
    content_html: html, featured_image_prompt: 'Ilustración vectorial propia del sitio generada automáticamente; sin servicios externos.',
    schema_faq: faqObj(faq), products, related,
    ...(prev?.featured_image ? { featured_image: prev.featured_image } : {}),
  };
  writeFileSync(file(key), JSON.stringify(a, null, 2) + '\n');
  console.log(key, words(html), 'palabras,', a.schema_faq.length, 'FAQ');
}
