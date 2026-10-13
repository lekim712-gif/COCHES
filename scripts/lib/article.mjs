// Constructor de HTML común: la IA devuelve campos estructurados y este código compone el HTML,
// así la estructura obligatoria (H1, tabla, listas, pasos, marcadores de anuncio) es siempre idéntica.
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const li = (a) => a.map((x) => `<li>${esc(x)}</li>`).join('');

export const AVISO_GEN = 'Esta ficha describe causas universales del estándar SAE J2012. Los valores exactos de resistencia, tensión y presión dependen del fabricante: consulta siempre el manual de taller de tu vehículo.';

export const tablaRows = (f) => [
  ['Gravedad del fallo', f.gravedad],
  ['Sistemas afectados', f.sistemas],
  ['Coste estimado de taller', f.coste],
  ['Herramientas necesarias', f.herramientas],
];

export function buildHtml({ h1, intro, tabla, sintomas, causas, pasos, extra }) {
  return [
    `<h1>${esc(h1)}</h1>`,
    `<p class="intro">${esc(intro)}</p>`,
    `<h2>Ficha técnica</h2>`,
    `<table class="ficha"><tbody>${tabla.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>`,
    `<!--ad-slot-1-->`,
    sintomas?.length ? `<h2>Síntomas habituales</h2><ul>${li(sintomas)}</ul>` : '',
    causas?.length ? `<h2>Causas principales</h2><ul>${li(causas)}</ul>` : '',
    extra ?? '',
    pasos?.length ? `<h2>Guía de diagnóstico y reparación paso a paso</h2><ol>${li(pasos)}</ol>` : '',
    `<!--ad-slot-2-->`,
  ].filter(Boolean).join('\n');
}
