// Detección de contenido casi duplicado entre fichas (riesgo de «contenido fino» en el buscador).
const words = (t) => t.replace(/<[^>]+>/g, ' ').toLowerCase().replace(/[^a-záéíóúüñ0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
export const shingles = (text, n = 5) => {
  const w = words(text), s = new Set();
  for (let i = 0; i + n <= w.length; i++) s.add(w.slice(i, i + n).join(' '));
  return s;
};
export const jaccard = (a, b) => {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter || 1);
};
// Texto comparable: sin la ficha técnica ni los marcadores; incluye las respuestas de las preguntas frecuentes.
export const bodyText = (a) => a.content_html.replace(/<table[\s\S]*?<\/table>/g, ' ') + ' ' + (a.schema_faq || []).map((q) => q.answer).join(' ');
