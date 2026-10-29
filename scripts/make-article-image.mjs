// Generador propio de imágenes destacadas (sin servicios externos ni créditos).
// Dibuja una tarjeta 1200×630 en la identidad del sitio con un pictograma técnico según el sistema afectado.
// Uso:  node scripts/make-article-image.mjs src/content/articulos/codigo-p0301.json [--force]
//       node scripts/make-article-image.mjs --missing      (solo artículos sin featured_image)
//       node scripts/make-article-image.mjs --sheet <png>  (hoja de contactos de todos los pictogramas)
import sharp from 'sharp';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const AMBER = '#f5a524', INK = '#e8e6e1', MUTED = '#9aa2b0', BG1 = '#10141b', BG2 = '#1d2430';
const OUT = process.env.IMG_OUT || 'public/img/articulos', DIR = 'src/content/articulos';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ───────── Pictogramas: viewBox 200×200, trazo ámbar + detalles claros ───────── */
const A = `stroke="${AMBER}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
const L = `stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".75"`;
const gear = (cx, cy, r, teeth, depth) => {
  const pts = [];
  for (let i = 0; i < teeth * 4; i++) {
    const ang = (Math.PI * 2 * i) / (teeth * 4) - Math.PI / (teeth * 4);
    const rr = i % 4 === 1 || i % 4 === 2 ? r + depth : r;
    pts.push(`${(cx + rr * Math.cos(ang)).toFixed(1)},${(cy + rr * Math.sin(ang)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}" ${A}/>`;
};
const dots = (x0, y0, cols, rows, dx, dy, r = 4.5) => {
  let s = '';
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) s += `<circle cx="${x0 + i * dx}" cy="${y0 + j * dy}" r="${r}" fill="${INK}" opacity=".8"/>`;
  return s;
};
const ICONS = {
  // catalizador / escape
  escape: `<path d="M8 100 H46 M154 100 H192" ${A}/><path d="M46 100 L64 60 H136 L154 100 L136 140 H64 Z" ${A}/>${dots(80, 84, 4, 3, 14, 16)}<path d="M170 82 l16 18 -16 18" ${L}/>`,
  // filtro de partículas
  dpf: `<path d="M10 100 H44 M156 100 H190" ${A}/><rect x="44" y="52" width="112" height="96" rx="20" ${A}/>${dots(70, 78, 5, 4, 15, 15)}<path d="M174 84 l14 16 -14 16" ${L}/>`,
  // turbo
  turbo: `<circle cx="96" cy="108" r="58" ${A}/><circle cx="96" cy="108" r="26" ${A}/><path d="M96 82 L110 108 L96 134 L82 108 Z" ${L}/><path d="M142 70 L178 36 H196" ${A}/><path d="M96 50 L96 28 H64" ${A}/>`,
  // bujía / encendido
  bujia: `<rect x="84" y="14" width="32" height="26" rx="5" ${A}/><rect x="90" y="40" width="20" height="62" rx="4" ${A}/><path d="M78 102 H122 L128 128 H72 Z" ${A}/><path d="M80 136 H120 M80 148 H120 M80 160 H120" ${L}/><path d="M100 160 V186 M100 186 H118" ${A}/>`,
  // combustible / inyección
  combustible: `<path d="M100 22 C100 22 52 84 52 124 a48 48 0 0 0 96 0 C148 84 100 22 100 22 Z" ${A}/><path d="M78 128 a24 24 0 0 0 20 24" ${L}/>`,
  // admisión / caudalímetro
  admision: `<path d="M16 84 H184 M16 124 H184" ${A}/><path d="M40 104 h40 M62 92 l18 12 -18 12 M110 104 h40 M132 92 l18 12 -18 12" ${L}/><rect x="84" y="36" width="32" height="48" rx="6" ${A}/><path d="M100 36 V20" ${A}/>`,
  // EGR / recirculación
  egr: `<path d="M150 62 A58 58 0 1 0 158 112" ${A}/><path d="M156 36 L150 66 L120 62" ${A}/><circle cx="100" cy="100" r="18" ${A}/><path d="M100 82 V118 M82 100 H118" ${L}/>`,
  // sensor
  sensor: `<rect x="70" y="100" width="60" height="58" rx="8" ${A}/><path d="M85 100 V74 H115 V100" ${A}/><path d="M100 158 V188" ${A}/><path d="M74 54 a38 38 0 0 1 52 0 M60 38 a58 58 0 0 1 80 0" ${L}/>`,
  // llave inglesa / mantenimiento
  llave: `<path d="M150 30 a38 38 0 0 0 -46 52 L36 150 a18 18 0 0 0 26 26 L130 108 a38 38 0 0 0 52 -46 L152 92 L128 68 Z" ${A}/><circle cx="50" cy="162" r="6" fill="${AMBER}"/>`,
  // red CAN / comunicaciones
  red: `<path d="M20 100 H180" ${A}/><circle cx="46" cy="52" r="16" ${A}/><circle cx="100" cy="52" r="16" ${A}/><circle cx="154" cy="52" r="16" ${A}/><circle cx="46" cy="148" r="16" ${A}/><circle cx="154" cy="148" r="16" ${A}/><path d="M46 68 V100 M100 68 V100 M154 68 V100 M46 132 V100 M154 132 V100" ${L}/>`,
  // batería / carga
  bateria: `<rect x="22" y="58" width="156" height="102" rx="12" ${A}/><path d="M52 58 V42 H78 V58 M122 58 V42 H148 V58" ${A}/><path d="M50 110 H82 M142 94 V126 M126 110 H158" ${L}/>`,
  // aceite / lubricación (aceitera)
  aceite: `<rect x="30" y="94" width="96" height="70" rx="12" ${A}/><path d="M50 94 V74 H106 V94" ${A}/><path d="M126 110 L172 72 H190" ${A}/><path d="M78 118 c0 0 -12 14 -12 22 a12 12 0 0 0 24 0 c0 -8 -12 -22 -12 -22 Z" ${L}/><path d="M178 90 v14" ${L}/>`,
  // fusibles
  fusible: `<rect x="56" y="22" width="88" height="116" rx="10" ${A}/><path d="M76 138 V176 M124 138 V176" ${A}/><path d="M82 56 V104 H118 V56" ${L}/>`,
  // transmisión / engranajes
  transmision: `${gear(84, 104, 38, 8, 12)}<circle cx="84" cy="104" r="12" ${A}/>${gear(152, 60, 22, 6, 9).replace(/stroke-width="6"/, 'stroke-width="5"')}`,
  // frenos
  frenos: `<circle cx="100" cy="100" r="74" ${A}/><circle cx="100" cy="100" r="22" ${A}/><circle cx="100" cy="52" r="7" fill="${INK}" opacity=".8"/><circle cx="100" cy="148" r="7" fill="${INK}" opacity=".8"/><circle cx="52" cy="100" r="7" fill="${INK}" opacity=".8"/><circle cx="148" cy="100" r="7" fill="${INK}" opacity=".8"/><path d="M150 30 a80 80 0 0 1 36 52" stroke="${AMBER}" stroke-width="14" stroke-linecap="round" fill="none"/>`,
  // temperatura / refrigerante
  temperatura: `<path d="M84 22 H116 V108 a34 34 0 1 1 -32 0 Z" ${A}/><circle cx="100" cy="146" r="14" fill="${AMBER}"/><path d="M100 132 V64" stroke="${AMBER}" stroke-width="8" stroke-linecap="round"/><path d="M130 52 h24 M130 76 h24 M130 100 h24" ${L}/>`,
  // neumáticos
  neumatico: `<path d="M44 148 A66 66 0 1 1 156 148" ${A}/><path d="M44 148 H156" ${A}/><path d="M60 136 H140" ${L}/><path d="M100 70 V112" stroke="${AMBER}" stroke-width="10" stroke-linecap="round"/><circle cx="100" cy="128" r="6" fill="${AMBER}"/>`,
  // depósito / EVAP (vapores de combustible)
  deposito: `<rect x="26" y="84" width="132" height="78" rx="26" ${A}/><path d="M128 84 V54 H172" ${A}/><path d="M56 66 c12 -12 -12 -24 0 -38 M92 66 c12 -12 -12 -24 0 -38" ${L}/>`,
  // volante (dirección asistida, airbag)
  volante: `<circle cx="100" cy="100" r="72" ${A}/><circle cx="100" cy="100" r="17" ${A}/><path d="M28 100 H83 M117 100 H172 M100 117 V172" ${A}/>`,
  // centralita / genérico
  centralita: `<rect x="52" y="52" width="96" height="96" rx="12" ${A}/><rect x="78" y="78" width="44" height="44" rx="6" ${L}/><path d="M72 52 V30 M100 52 V30 M128 52 V30 M72 148 V170 M100 148 V170 M128 148 V170 M52 72 H30 M52 100 H30 M52 128 H30 M148 72 H170 M148 100 H170 M148 128 H170" ${A}/>`,
  // motor genérico / testigo motor
  motor: `<path d="M44 76 H70 L82 60 H122 V76 H150 L166 92 V128 H150 L132 146 H66 L50 128 H34 V92 Z" ${A}/><path d="M34 100 H18 M166 100 H184 M92 60 V46 H112 V60" ${A}/><path d="M80 96 H128 M80 112 H128" ${L}/>`,
};

/* ───────── Selección del pictograma por palabras clave ───────── */
const RULES = [
  [/anticongelante/i, 'temperatura'], [/kit de emergencia|llevar en el coche|limpiaparabrisas|escobillas/i, 'llave'],
  [/cambiar una rueda/i, 'neumatico'], [/correa de distribución|distribución/i, 'transmision'], [/fugas bajo/i, 'combustible'],
  [/mantenimiento|llave inglesa|revisión programada/i, 'llave'],
  [/partículas|dpf|fap/i, 'dpf'], [/egr|recirculaci/i, 'egr'], [/turbo|sobrealimentaci/i, 'turbo'],
  [/evap|vapores/i, 'deposito'], [/precalentamiento/i, 'bujia'], [/adblue|urea/i, 'combustible'],
  [/mezcla demasiado pobre|fuga de aire|admisi|caudalímetro|maf\b|map\b|mariposa|filtro de aire|filtro de habitáculo/i, 'admision'],
  [/mezcla demasiado rica|combustible|inyecci|inyector|raíl|bomba|common rail|diésel/i, 'combustible'],
  [/catalizador|escape|lambda/i, 'escape'], [/bujía|encendido|bobina/i, 'bujia'],
  [/\bcan\b|\bred\b|comunicaci|módulo|cuadro de instrumentos/i, 'red'], [/batería|alternador|tensión del sistema/i, 'bateria'],
  [/aceite|lubricaci/i, 'aceite'], [/fusible|eléctric/i, 'fusible'], [/transmisi|marcha|caja de cambios/i, 'transmision'],
  [/\babs\b|\besp\b|freno|frenado/i, 'frenos'], [/refrigerante|temperatura/i, 'temperatura'], [/neumátic|tpms/i, 'neumatico'],
  [/dirección asistida|airbag|volante/i, 'volante'], [/ralentí/i, 'motor'],
  [/sensor|detonaci|cigüeñal|árbol de levas|velocidad/i, 'sensor'], [/procesador|ecu|ecm|pcm|centralita|escáner|códigos/i, 'centralita'], [/motor/i, 'motor'],
];
const firstMatch = (text) => (RULES.find(([re]) => re.test(text)) || [0, null])[1];
// Decide por el nombre del problema; solo si no basta, mira los sistemas afectados.
export const pickIcon = (name, system = '') => firstMatch(name) || firstMatch(system) || 'centralita';

/* ───────── Tarjeta ───────── */
const wrap = (text, max) => {
  const words = text.split(/\s+/), lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
};
export function cardSvg({ tag, big, title, icon }) {
  const hasBig = Boolean(big);
  const lines = wrap(title, hasBig ? 27 : 20).slice(0, 4);
  const bigSize = big.length > 6 ? 84 : 128;
  const titleY = hasBig ? 330 : 230, titleSize = hasBig ? 38 : 56, lineH = hasBig ? 50 : 70;
  const grid = Array.from({ length: 13 }, (_, i) => `<path d="M${i * 100} 0 V630" stroke="#fff" stroke-opacity=".035"/>`).join('') + Array.from({ length: 7 }, (_, i) => `<path d="M0 ${i * 100} H1200" stroke="#fff" stroke-opacity=".035"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${BG1}"/><stop offset="1" stop-color="${BG2}"/></linearGradient>
<radialGradient id="r" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${AMBER}" stop-opacity=".18"/><stop offset="1" stop-color="${AMBER}" stop-opacity="0"/></radialGradient></defs>
<rect width="1200" height="630" fill="url(#g)"/>${grid}
<circle cx="900" cy="300" r="300" fill="url(#r)"/>
<rect y="610" width="1200" height="20" fill="${AMBER}"/>
<rect x="70" y="70" width="${28 + tag.length * 17}" height="40" rx="8" fill="${AMBER}"/>
<text x="${70 + (28 + tag.length * 17) / 2}" y="98" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-size="22" font-weight="700" fill="${BG1}" letter-spacing="1.5">${esc(tag)}</text>
${hasBig ? `<text x="66" y="${240 + (bigSize === 128 ? 0 : -20)}" font-family="DejaVu Sans Mono, monospace" font-size="${bigSize}" font-weight="700" fill="${AMBER}">${esc(big)}</text>` : ''}
${lines.map((l, i) => `<text x="70" y="${titleY + i * lineH}" font-family="DejaVu Sans, Arial, sans-serif" font-size="${titleSize}" font-weight="${hasBig ? 600 : 700}" fill="${INK}">${esc(l)}</text>`).join('')}
<text x="70" y="580" font-family="DejaVu Sans, Arial, sans-serif" font-size="26" font-weight="700" fill="${MUTED}">OBDCodigos</text>
<g transform="translate(715 100) scale(2.35)">${ICONS[icon] || ICONS.centralita}</g>
</svg>`;
}

const SYSTEM_ROW = /<th scope="row">Sistemas afectados<\/th><td>([^<]*)<\/td>/;
export function describe(a, key) {
  const system = (a.content_html.match(SYSTEM_ROW) || [, ''])[1];
  let nameForIcon = a.name;
  if (a.type === 'marca') {   // las fichas de marca heredan el pictograma de su código base
    const baseFile = join(DIR, `codigo-${a.code.toLowerCase()}.json`);
    if (existsSync(baseFile)) nameForIcon = JSON.parse(readFileSync(baseFile, 'utf8')).name;
  }
  const tags = { codigo: 'CÓDIGO OBD2', testigo: 'TESTIGO', guia: 'GUÍA', marca: 'POR MARCA' };
  let big = '', title = a.name;
  if (a.type === 'codigo') big = a.code;
  else if (a.type === 'marca') { big = a.code; title = a.brand_name; }
  else title = a.name.replace(/:.*$/, '');
  return { tag: tags[a.type], big, title, icon: pickIcon(nameForIcon, system), key };
}

async function render(spec, force = false, article) {
  mkdirSync(OUT, { recursive: true });
  const svg = Buffer.from(cardSvg(spec));
  await sharp(svg).webp({ quality: 80 }).toFile(join(OUT, `${spec.key}.webp`));
  await sharp(svg).jpeg({ quality: 84, mozjpeg: true }).toFile(join(OUT, `${spec.key}.jpg`));
  return `/img/articulos/${spec.key}.webp`;
}

/* ───────── CLI ───────── */
if (process.argv[1] && process.argv[1].endsWith('make-article-image.mjs')) {
  const args = process.argv.slice(2);
  if (args[0] === '--sheet') {
    const names = Object.keys(ICONS), W = 300, H = 158, cols = 4, rows = Math.ceil(names.length / cols);
    const comps = await Promise.all(names.map(async (n, i) => ({
      input: await sharp(Buffer.from(cardSvg({ tag: 'PICTOGRAMA', big: n.toUpperCase().slice(0, 6), title: `Icono «${n}»`, icon: n }))).resize(W, H).png().toBuffer(),
      left: (i % cols) * W, top: Math.floor(i / cols) * H })));
    await sharp({ create: { width: W * cols, height: H * rows, channels: 3, background: '#000' } }).composite(comps).png().toFile(args[1] || 'sheet.png');
    console.log('hoja creada con', names.length, 'pictogramas');
  } else {
    const files = args.includes('--missing')
      ? readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => join(DIR, f)).filter((f) => !JSON.parse(readFileSync(f, 'utf8')).featured_image)
      : args.filter((x) => !x.startsWith('--'));
    for (const f of files) {
      const a = JSON.parse(readFileSync(f, 'utf8'));
      if (a.featured_image && !args.includes('--force')) { console.log('ya tiene imagen (usa --force):', f); continue; }
      const key = basename(f, '.json');
      const path = await render(describe(a, key));
      if (!args.includes('--dry')) { a.featured_image = path; writeFileSync(f, JSON.stringify(a, null, 2) + '\n'); }
      console.log('ok', key, '→', describe(a, key).icon);
    }
    if (!files.length) console.log('nada que generar');
  }
}
