// Genera review/pendientes-revision.html con las fichas SIN revisar, listas para leer o imprimir a PDF.
// Es lo que se le pasa al revisor técnico. Uso: node scripts/make-review-pack.mjs
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const DIR = 'src/content/articulos/';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const order = { codigo: 1, marca: 2, testigo: 3, guia: 4 };
const label = { codigo: 'Código OBD2', marca: 'Ficha por marca', testigo: 'Testigo del tablero', guia: 'Guía de mantenimiento' };
const arts = readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => ({ key: f.slice(0, -5), ...JSON.parse(readFileSync(DIR + f, 'utf8')) }))
  .filter((a) => !a.reviewed_by).sort((a, b) => order[a.type] - order[b.type] || a.key.localeCompare(b.key));
mkdirSync('review', { recursive: true });
if (!arts.length) { writeFileSync('review/pendientes-revision.html', '<!doctype html><meta charset="utf-8"><p>No hay fichas pendientes de revisión.</p>'); console.log('Sin fichas pendientes.'); process.exit(0); }
const sections = arts.map((a, i) => `
<section class="ficha-doc">
  <div class="cab"><span>Ficha ${i + 1} de ${arts.length} · ${label[a.type]}</span><code>${esc(a.key)}</code></div>
  ${a.content_html.replace(/<!--ad-slot-\d-->/g, '').replace('<table class="ficha">', '<table>')}
  <h2>Preguntas frecuentes</h2>
  ${a.schema_faq.map((q) => `<p><strong>${esc(q.question)}</strong><br>${esc(q.answer)}</p>`).join('')}
  <div class="revision"><strong>Revisión técnica</strong>
    <p>☐ Correcta &nbsp;&nbsp; ☐ Correcta con cambios menores &nbsp;&nbsp; ☐ Hay que rehacerla</p>
    <p class="lineas">Comentarios y correcciones:<br><br><br><br></p></div>
</section>`).join('\n');
const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Fichas pendientes de revisión técnica · OBDCodigos</title>
<style>
@page{size:A4;margin:16mm 15mm}body{font:11pt/1.5 "DejaVu Sans",Arial,sans-serif;color:#1b1f27;max-width:820px;margin:0 auto;padding:16px}
h1{font-size:19pt;margin:.2em 0 .4em}h2{font-size:13pt;margin:1.1em 0 .3em}.ficha-doc{page-break-before:always;border-top:3px solid #f5a524;margin-top:2rem;padding-top:1rem}
.cab{display:flex;justify-content:space-between;font-size:9pt;color:#5a6270;margin-bottom:8px}.intro{border-left:4px solid #f5a524;padding-left:10px}
table{width:100%;border-collapse:collapse;margin:8px 0}th,td{border:1px solid #bbb;padding:5px 8px;text-align:left;vertical-align:top;font-size:10pt}th{width:30%;background:#fbf1de}
li{margin:3px 0}.revision{margin-top:16px;border:1.5px solid #1b1f27;border-radius:6px;padding:8px 12px;page-break-inside:avoid}.lineas{color:#777}.aviso{background:#fff6e0;border:1px solid #f5a524;padding:6px 10px;font-size:9.5pt}
</style>
<section>
<h1>Fichas pendientes de revisión técnica · OBDCodigos</h1>
<p class="intro">Hola Carlos. Estas ${arts.length} fichas las ha redactado una IA a partir de una plantilla y <strong>nadie las ha comprobado todavía</strong>. Lo que se publique como «Revisada por» llevará tu nombre, así que necesitamos tu criterio de mecánico.</p>
<h2>En qué fijarte, por orden de importancia</h2>
<ol><li><strong>Seguridad:</strong> ¿algún paso peligroso o falta un aviso?</li><li><strong>Exactitud técnica:</strong> ¿síntomas, causas y orden del diagnóstico correctos y habituales en taller?</li><li><strong>Costes:</strong> ¿razonables para un taller en España?</li><li><strong>Cifras y términos:</strong> ¿alguna incorrecta o inventada?</li><li><strong>Lo que falta:</strong> ¿alguna causa muy común que no aparece?</li></ol>
<p class="aviso">Si no estás seguro de algo, escribe «no estoy seguro» en vez de aprobarlo. Una ficha dudosa se corrige o se retira.</p>
<p>Devuelve el resultado como te sea más cómodo: este documento rellenado, fotos de las páginas o una lista con el nombre de la ficha (arriba a la derecha de cada una) y tu comentario.</p>
<h2>Índice</h2><ol>${arts.map((a) => `<li>${esc(a.name)} <small>(${esc(a.key)})</small></li>`).join('')}</ol>
</section>
${sections}
</html>`;
writeFileSync('review/pendientes-revision.html', html);
console.log(`review/pendientes-revision.html con ${arts.length} fichas`);
