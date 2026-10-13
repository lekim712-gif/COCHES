// Generador automático de fichas con la API de Claude.
//
//   node scripts/generate-articles.mjs [--count N] [--only <clave>] [--dry-run] [--mock]
//
// Flujo por ficha: elegir la siguiente de content-plan/backlog.json → generar (salida estructurada) →
// repaso crítico por un segundo pase → validar estructura y duplicados → guardar como borrador → imagen propia.
// Las fichas nuevas se guardan SIN revisión humana: el sitio las publica con noindex hasta que se marquen
// como revisadas (npm run reviewed). Las fichas por marca NO se generan aquí (exigen datos verificados).
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { readFileSync, writeFileSync, readdirSync, existsSync, appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { buildHtml, tablaRows, AVISO_GEN, esc } from './lib/article.mjs';
import { validateArticle, urlKey, SIM_ERROR } from './lib/validate.mjs';
import { shingles, jaccard, bodyText } from './lib/similarity.mjs';
import { pickIcon } from './make-article-image.mjs';

const DIR = 'src/content/articulos';
const MODEL = process.env.GEN_MODEL || 'claude-opus-5-5';
const PRICE = { in: Number(process.env.GEN_PRICE_IN || 4), out: Number(process.env.GEN_PRICE_OUT || 20) }; // USD por millón de tokens (Claude Opus 5.5)
const MAX_PENDING = Number(process.env.MAX_PENDING_REVIEW || 40); // punto de control: con tantas fichas sin revisar se pausa
const MAX_ATTEMPTS = 2;

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => { const i = args.indexOf(n); return i > -1 ? args[i + 1] : d; };
const COUNT = Number(opt('--count', process.env.GEN_COUNT || 3));
const ONLY = opt('--only', '');
const DRY = flag('--dry-run'), MOCK = flag('--mock');
if (MOCK && process.env.GITHUB_ACTIONS === 'true' && !flag('--allow-mock')) { console.error('✗ --mock está prohibido en GitHub Actions.'); process.exit(1); }
if (!MOCK && !process.env.ANTHROPIC_API_KEY) { console.error('✗ Falta ANTHROPIC_API_KEY (o usa --mock para probar sin API).'); process.exit(1); }

const today = new Date().toISOString().slice(0, 10);
const log = (...m) => console.log(...m);
const summary = (line) => { if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, line + '\n'); };

/* ───────────────────────── Estado actual ───────────────────────── */
const readAll = () => readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => ({ key: f.slice(0, -5), ...JSON.parse(readFileSync(join(DIR, f), 'utf8')) }));
const backlog = JSON.parse(readFileSync('content-plan/backlog.json', 'utf8'));
const rejectedFile = 'content-plan/rechazadas.json';
const rejected = existsSync(rejectedFile) ? JSON.parse(readFileSync(rejectedFile, 'utf8')) : [];

const existing = readAll();
const pending = existing.filter((a) => !a.reviewed_by).length;
log(`Fichas existentes: ${existing.length} · pendientes de revisión: ${pending} (límite ${MAX_PENDING})`);
if (!ONLY && pending >= MAX_PENDING) {
  const msg = `Generación en pausa: hay ${pending} fichas sin revisar (límite ${MAX_PENDING}). Se reanuda cuando Carlos revise.`;
  log(msg); summary(`### ⏸ ${msg}`);
  process.exit(0);
}

/* ───────────────────────── Cola ───────────────────────── */
const keyOf = (t, slug) => `${t}-${slug}`;
const queue = [];
const C = backlog.codigos.map(([code, name, note]) => ({ type: 'codigo', slug: code.toLowerCase(), code, name, note }));
const T = backlog.testigos.map(([slug, name, note]) => ({ type: 'testigo', slug, name, note }));
const G = backlog.guias.map(([slug, name, note]) => ({ type: 'guia', slug, name, note }));
const pattern = ['c', 'c', 't', 'c', 'g']; // variedad temática: más códigos, intercalando testigos y guías
const lists = { c: [...C], t: [...T], g: [...G] };
for (let i = 0; lists.c.length + lists.t.length + lists.g.length > 0 && i < 1000; i++) {
  const l = lists[pattern[i % pattern.length]];
  if (l.length) queue.push(l.shift());
}
const gated = new Set(backlog.requieren_revision_humana || []);
queue.forEach((q) => { q.key = keyOf(q.type, q.slug); q.needsReview = gated.has(q.slug); });
const done = new Set(existing.map((a) => a.key));
const skipRejected = new Set(rejected.map((r) => r.key));
let todo = ONLY ? queue.filter((q) => q.key === ONLY) : queue.filter((q) => !done.has(q.key) && !skipRejected.has(q.key));
if (ONLY && !todo.length) { console.error(`✗ La clave ${ONLY} no está en el backlog.`); process.exit(1); }
if (ONLY && done.has(ONLY) && !flag('--force')) { console.error(`✗ ${ONLY} ya existe y se sobrescribiría (puede estar revisada). Usa --force solo si es lo que quieres.`); process.exit(1); }
todo = todo.slice(0, COUNT);
if (!todo.length) { log('Nada pendiente en el backlog.'); summary('### ✅ Backlog completo: no hay fichas pendientes.'); process.exit(0); }
log(`A generar (${todo.length}): ${todo.map((t) => t.key).join(', ')}`);

/* ───────────────────────── Esquemas ───────────────────────── */
const Ficha = z.object({
  meta_title: z.string(),
  meta_description: z.string(),
  h1: z.string(),
  intro: z.string(),
  ficha_tecnica: z.object({ gravedad: z.string(), sistemas: z.string(), coste: z.string(), herramientas: z.string() }),
  sintomas: z.array(z.string()),
  causas: z.array(z.string()),
  pasos: z.array(z.string()),
  faq: z.array(z.object({ pregunta: z.string(), respuesta: z.string() })),
  productos: z.array(z.string()),
  relacionados: z.array(z.string()),
});
const Critica = z.object({
  ok: z.boolean(),
  problemas: z.array(z.object({ gravedad: z.enum(['bloqueante', 'menor']), texto: z.string() })),
});

/* ───────────────────────── Prompts ───────────────────────── */
const SYSTEM = `Eres un técnico de automoción con muchos años de taller que redacta fichas de diagnóstico para una web en español de España (OBDCodigos).
Escribes con la precisión de un maestro mecánico: terminología correcta (banco 1, sonda lambda posterior, ciclo de trabajo, presión en bar), frases directas, nada de relleno.

REGLAS DE CONTENIDO (innegociables):
1. Cero invenciones. Para códigos genéricos del estándar SAE J2012 / ISO 15031-6, ciñete a las causas universales validadas por la ingeniería automotriz. No inventes datos de ningún fabricante, modelo, motor ni referencia de pieza.
2. No des valores concretos de especificación que dependan del fabricante (resistencias, tensiones, presiones, pares de apriete, holguras). Si hace falta una cifra, usa un rango muy general ya aceptado (por ejemplo, tensión de batería en reposo de unos 12,4 V o más) y di que se consulte el manual de taller. Ante la duda, no pongas la cifra.
3. Seguridad primero: incluye el aviso de seguridad pertinente dentro de los pasos (corriente, alta presión de combustible, elementos calientes, trabajar bajo el vehículo). Nunca recomiendes anular o eliminar sistemas de emisiones (EGR, filtro de partículas, catalizador, AdBlue) ni puentear sensores o testigos; si surge la pregunta, indica que es ilegal para circular y que no supera la ITV.
4. Sin primera persona ni experiencia inventada ("en mi taller…"). Sin promesas ni garantías de resultado. Sin marcas comerciales de herramientas o recambios.
5. Costes: rangos orientativos de taller en España en euros, separando causa sencilla y causa grave. Indica «según modelo».
6. Diagnóstico antes de cambiar piezas: ordena los pasos de lo más barato y probable a lo más caro; el último paso debe confirmar la reparación.
7. Cada ficha debe aportar algo que la distinga de las demás: no repitas frases de otras fichas ni uses plantillas genéricas.

FORMATO (campos estructurados):
- intro: entre 60 y 80 palabras, define el problema técnico desde la primera frase. Prohibido empezar con "En este artículo", "A continuación" o similares.
- meta_description: entre 120 y 158 caracteres, con el código o tema y el beneficio para el lector.
- ficha_tecnica: gravedad (con una breve justificación, p. ej. «Media: se puede circular, pero no conviene alargarlo»), sistemas (lista breve separada por comas), coste (rango en euros según causa), herramientas (separadas por comas).
- sintomas: 4 a 6 elementos; causas: 4 a 7 elementos; pasos: 6 a 9 pasos numerables, en imperativo, cada uno una acción concreta y comprobable.
- faq: 3 o 4 preguntas reales de búsqueda (p. ej. «¿Se puede circular con…?», «¿Cuánto cuesta repararlo?»), respuestas de 25 a 60 palabras.
- productos: 2 a 4 términos de búsqueda genéricos en español de herramientas o consumibles útiles para este diagnóstico (p. ej. «multímetro digital automotriz»), en minúsculas, sin marcas.
- relacionados: 0 a 3 identificadores EXACTOS elegidos de la lista de fichas existentes que se te dará (solo si de verdad están relacionados).`;

const spec = (item, existingSlugs, feedback) => {
  const base = `Redacta la ficha siguiente.\nTipo: ${item.type}\n`;
  const tipo = {
    codigo: `Código: ${item.code}\nTítulo oficial resumido: ${item.name}\nEl h1 será exactamente «Código ${item.code}: ${item.name}». Usa meta_title exactamente «Código ${item.code}: causas, síntomas y solución». En sintomas/causas/pasos va el diagnóstico completo.`,
    testigo: `Tema: ${item.name}\nEs una ficha de testigo del tablero: indica el color y qué significa cada estado, si se puede seguir circulando, y en «pasos» qué hacer, ordenado. En sintomas pon cómo se manifiesta (estados del testigo, comportamiento del coche) y en causas los orígenes habituales. h1: «${item.name}». meta_title: máximo 60 caracteres.`,
    guia: `Tema: ${item.name}\nEs una guía de mantenimiento: en «pasos» el procedimiento completo y seguro; sintomas y causas deben ir como listas vacías. En ficha_tecnica, gravedad significa dificultad y riesgo (p. ej. «Baja si se hace con seguridad»). h1: «${item.name}». meta_title: máximo 60 caracteres. No des pares de apriete ni valores de fabricante: remite al manual.`,
  }[item.type];
  return `${base}${tipo}${item.note ? `\nNota editorial: ${item.note}` : ''}\n\nFichas existentes que puedes enlazar en «relacionados» (usa el identificador tal cual): ${existingSlugs.join(', ')}.${feedback ? `\n\nTU INTENTO ANTERIOR FUE RECHAZADO. Corrige estos problemas y no los repitas:\n- ${feedback.join('\n- ')}` : ''}`;
};

const CRITICA_SYSTEM = `Eres un revisor técnico exigente de contenidos de automoción. Recibirás una ficha ya redactada y debes decidir si es publicable.
Marca como BLOQUEANTE solo problemas reales:
- datos inventados o dudosos presentados como hechos (cifras concretas de fabricante, referencias de pieza, afirmaciones sobre marcas o modelos sin respaldo universal);
- errores técnicos sobre qué significa el código o cómo funciona el sistema;
- consejos peligrosos, ilegales (anular EGR/DPF/catalizador/AdBlue, puentear sensores) o pasos que omitan una precaución de seguridad esencial;
- primera persona o experiencia inventada;
- un orden de diagnóstico absurdo (cambiar piezas caras antes de comprobar lo básico).
Marca como MENOR lo opinable (estilo, matices). Si no hay bloqueantes, ok = true. Sé concreto: cada problema indica qué frase y por qué.`;

/* ───────────────────────── Llamadas a la API ───────────────────────── */
const client = MOCK ? null : new Anthropic();
let tokensIn = 0, tokensOut = 0;

async function ask({ system, user, schema, effort }) {
  const params = {
    model: MODEL,
    max_tokens: 16000,
    system,
    messages: [{ role: 'user', content: user }],
    output_config: { effort, format: zodOutputFormat(schema) },
  };
  let res;
  try { // Con rechazo de seguridad, la API reintenta en otro modelo (por defecto de Anthropic).
    res = await client.beta.messages.parse({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' });
  } catch (e) {
    if (e instanceof Anthropic.BadRequestError) res = await client.messages.parse(params); // por si el modelo/plataforma no admite fallbacks
    else throw e;
  }
  tokensIn += res.usage?.input_tokens ?? 0;
  tokensOut += res.usage?.output_tokens ?? 0;
  if (res.stop_reason === 'refusal') throw new Error(`el modelo rechazó la petición (${JSON.stringify(res.stop_details)})`);
  if (!res.parsed_output) throw new Error(`sin salida estructurada válida (stop_reason=${res.stop_reason})`);
  return res.parsed_output;
}

/* ───────────────────────── Modo prueba sin API ───────────────────────── */
function mockFicha(item) {
  const pal = (n) => Array.from({ length: n }, (_, i) => `${item.slug.replace(/\W/g, '')}${i}`).join(' ');
  const lst = (n, t) => Array.from({ length: n }, (_, i) => `${t} ${i + 1} de ${item.key} ${pal(4)}.`);
  return {
    meta_title: item.type === 'codigo' ? `Código ${item.code}: causas, síntomas y solución` : item.name.replace(/:.*$/, '').slice(0, 58),
    meta_description: `Ficha de prueba de ${item.name.slice(0, 55)}: síntomas, causas y diagnóstico paso a paso para localizar la avería sin cambiar piezas.`,
    h1: item.name, intro: `Texto de prueba de ${item.key} para comprobar el flujo. ${pal(52)}`,
    ficha_tecnica: { gravedad: 'Media: prueba', sistemas: 'Motor, sensores', coste: '50–300 € según modelo', herramientas: 'Escáner OBD2, multímetro' },
    sintomas: item.type === 'guia' ? [] : lst(4, 'Síntoma'),
    causas: item.type === 'guia' ? [] : lst(4, 'Causa'),
    pasos: lst(6, 'Paso'),
    faq: [1, 2, 3].map((n) => ({ pregunta: `¿Pregunta de prueba ${n} sobre ${item.key}?`, respuesta: `Respuesta número ${n} para ${item.key} ${pal(8)}.` })),
    productos: ['multímetro digital automotriz', 'escáner obd2 bluetooth elm327'],
    relacionados: ['p0420'],
  };
}

/* ───────────────────────── Construcción y comprobaciones ───────────────────────── */
function compose(item, f, existingSlugs) {
  const h1 = item.type === 'codigo' ? `Código ${item.code}: ${item.name}` : f.h1;
  const metaTitle = item.type === 'codigo' ? `Código ${item.code}: causas, síntomas y solución` : f.meta_title;
  const html = buildHtml({
    h1, intro: f.intro, tabla: tablaRows(f.ficha_tecnica),
    sintomas: item.type === 'guia' ? [] : f.sintomas, causas: item.type === 'guia' ? [] : f.causas, pasos: f.pasos,
    extra: item.type === 'codigo' ? `<p class="aviso">${esc(AVISO_GEN)}</p>` : '',
  });
  const icon = pickIcon(item.type === 'codigo' ? item.name : h1, f.ficha_tecnica.sistemas);
  const rel = (f.relacionados || []).filter((s) => existingSlugs.includes(s) && s !== item.slug).slice(0, 3);
  return {
    type: item.type, ...(item.type === 'codigo' ? { code: item.code } : {}),
    name: item.type === 'codigo' ? item.name : h1,
    datePublished: today, dateModified: today, review_status: 'draft-ia',
    generated_by: MOCK ? 'mock' : MODEL,
    ...(item.needsReview ? { needs_review: true } : {}),
    seo: { meta_title: metaTitle, meta_description: f.meta_description, slug: item.slug },
    content_html: html,
    featured_image_prompt: `Ilustración vectorial propia del sitio (pictograma «${icon}») generada por el sitio; sin servicios externos.`,
    schema_faq: f.faq.map((q) => ({ question: q.pregunta, answer: q.respuesta })),
    products: (f.productos || []).slice(0, 4), related: rel,
  };
}

function check(article, others) {
  const problems = [];
  const { errors } = validateArticle(article);
  problems.push(...errors);
  const key = urlKey(article);
  for (const o of others) {
    if (urlKey(o) === key) problems.push(`URL duplicada con ${o.key}`);
    if (o.seo?.meta_title === article.seo.meta_title) problems.push(`meta_title duplicado con ${o.key}`);
    if (o.seo?.meta_description === article.seo.meta_description) problems.push(`meta_description duplicada con ${o.key}`);
  }
  const mine = shingles(bodyText(article));
  for (const o of others) {
    if (o.type !== article.type) continue;
    const s = jaccard(mine, shingles(bodyText(o)));
    if (s >= SIM_ERROR) problems.push(`contenido demasiado parecido (${(s * 100).toFixed(0)} %) a ${o.key}: diferéncialo (otro enfoque, otros ejemplos, otra estructura de causas)`);
  }
  const words = (article.content_html.match(/<p class="intro">([\s\S]*?)<\/p>/)?.[1] || '').split(/\s+/).filter(Boolean).length;
  if (words < 55 || words > 82) problems.push(`la introducción tiene ${words} palabras: debe tener entre 60 y 80`);
  return problems;
}

/* ───────────────────────── Bucle principal ───────────────────────── */
const results = [];
let apiDown = false;
for (const item of todo) {
  if (apiDown) break; // la API falla: no se insiste con el resto
  const corpus = readAll();
  const existingSlugs = corpus.filter((a) => a.type !== 'marca').map((a) => a.seo.slug);
  let feedback = null, saved = false, lastWhy = '', transient = false;
  log(`\n▶ ${item.key} — ${item.name}`);
  for (let attempt = 1; attempt <= MAX_ATTEMPTS && !saved; attempt++) {
    try {
      const f = MOCK ? mockFicha(item) : await ask({ system: SYSTEM, user: spec(item, existingSlugs, feedback), schema: Ficha, effort: 'high' });
      const article = compose(item, f, existingSlugs);
      let problems = check(article, corpus);
      if (!problems.length && !MOCK) {
        const crit = await ask({ system: CRITICA_SYSTEM, user: `Título de la ficha: ${article.name}\n\nFicha (JSON):\n${JSON.stringify({ ...f }, null, 1)}`, schema: Critica, effort: 'medium' });
        const bloq = crit.problemas.filter((p) => p.gravedad === 'bloqueante').map((p) => p.texto);
        if (!crit.ok || bloq.length) problems = bloq.length ? bloq : ['el revisor técnico no la considera publicable'];
        else if (crit.problemas.length) log('  avisos menores del revisor:', crit.problemas.map((p) => p.texto).join(' | '));
      }
      if (problems.length) { feedback = problems; lastWhy = problems.join(' | '); log(`  intento ${attempt} rechazado: ${lastWhy}`); continue; }
      if (!DRY) {
        const file = join(DIR, `${item.key}.json`);
        writeFileSync(file, JSON.stringify(article, null, 2) + '\n');
        execFileSync('node', ['scripts/make-article-image.mjs', file], { stdio: 'inherit' });
      }
      saved = true; log(`  ✓ ${DRY ? '(simulado) ' : ''}guardada como borrador sin revisar`);
    } catch (e) {
      lastWhy = e.message; log(`  intento ${attempt} falló: ${e.message}`);
      if (e instanceof Anthropic.APIError) { transient = true; apiDown = true; break; } // clave, saldo, cuota o caída: no es culpa de la ficha
      if (/rechazó la petición/.test(e.message)) break; // un rechazo de seguridad no se reintenta
    }
  }
  if (!saved) {
    results.push({ key: item.key, ok: false, why: lastWhy, transient });
    if (!DRY && !MOCK && !transient) rejected.push({ key: item.key, motivo: lastWhy.slice(0, 600), fecha: today });
  } else results.push({ key: item.key, ok: true });
}

if (!DRY && !MOCK && results.some((r) => !r.ok && !r.transient)) writeFileSync(rejectedFile, JSON.stringify(rejected, null, 2) + '\n');
const cost = (tokensIn * PRICE.in + tokensOut * PRICE.out) / 1e6;
const okN = results.filter((r) => r.ok).length;
log(`\nResumen: ${okN}/${results.length} fichas creadas · tokens in ${tokensIn} / out ${tokensOut} · coste estimado ≈ ${cost.toFixed(2)} USD`);
summary(`### Generación de fichas\n- Creadas: **${okN}/${results.length}** (${MODEL})\n- Coste estimado: **${cost.toFixed(2)} USD**\n- Pendientes de revisión tras esta tanda: **${pending + okN}**\n${results.map((r) => `- ${r.ok ? '✅' : '❌'} \`${r.key}\`${r.ok ? '' : ' — ' + r.why.slice(0, 200)}`).join('\n')}`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `created=${okN}\n`);
if (apiDown) { console.error('✗ La API de Claude falló (clave, saldo, cuota o caída). No se ha vetado ninguna ficha. Revisa el secreto ANTHROPIC_API_KEY y el saldo.'); process.exit(1); }
