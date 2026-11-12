# Ampliar / crear fichas de obdcodigos.com (reconstruido el 12/11/2026)

Objetivo: cada ficha debe ser un artículo completo, útil y original en español de España (códigos/testigos 900–1.400 palabras al crear; las mejoradas 1.200–1.700).

## API de lib.mjs (en esta carpeta)
`import { P, H3, UL, OL, TIP, TBL, SEC, F, enrich, create, rewrite } from './lib.mjs';`
- Bloques: `P(texto)`, `H3(t)`, `UL([..])`, `OL([..])`, `TIP(t)`, `TBL(['Col1','Col2'], [[..],[..]])`, `SEC('Título H2', ...bloques)`.
- `enrich('<clave>', { start:[SEC(..)], middle:[SEC(..)], after:[SEC(..)], faq:[[pregunta, respuesta],..] })`: amplía una ficha existente. `start` va tras «Causas principales», `middle` antes del paso a paso, `after` tras el paso a paso. Si ya existe una sección con el mismo título, la SUSTITUYE en su sitio. Las FAQ ya existentes (misma pregunta) no se duplican; para ELIMINAR secciones o FAQ sobrantes edita el JSON a mano (python) tras ejecutar.
- `create('<clave>', { type, code, slug, name, desc, intro, tabla: F(gravedad, sistemas, coste, herramientas), sintomas:[..5-7], causas:[..5-7], before:[SEC..], pasosTitle?, pasos:[..8-10], after:[SEC..], faq:[[q,a]..6+], products:[3], related:[slugs existentes] })`. desc = meta_description (110–165 caracteres). intro 40–85 palabras. metaTitle opcional (≤65; en códigos se genera «Código X: causas, síntomas y solución»). Para testigos y guías `name` es el título completo (H1).
- `rewrite(clave, {...})`: reconstruye una guía completa (usa title, metaTitle, desc, intro, tabla, before, pasosTitle, pasos, after, faq, products, related).
- Claves: codigo-p0191, testigo-testigo-xxx (slug testigo-xxx), guia-guia-xxx (slug guia-xxx). Mira cualquier JSON de src/content/articulos de cada tipo como modelo (por ejemplo codigo-p0404, testigo-testigo-caja-dsg, guia-guia-limpieza-admision).

## Estructura por tipo
- Códigos: qué significa y cómo lo detecta la centralita; datos en vivo y valores de referencia (siempre «según el manual del fabricante»); árbol de decisión; cómo distinguir la causa (tabla); ejemplo de diagnóstico típico (ilustrativo); cuánto cuesta (tabla en €); errores frecuentes; cuándo acudir al taller; códigos relacionados (texto plano).
- Testigos: qué indica y estados (tabla color/estado → gravedad → qué hacer); qué hacer paso a paso según la situación; causas y coste (tabla); cómo evitar que vuelva; cuándo acudir al taller o grúa; testigos relacionados.
- Guías (≥5 h2, TOC automático): por qué importa / cómo funciona; cada cuánto (tabla); herramientas y materiales; pasos; errores frecuentes; cuánto cuesta (tabla); cuándo llevarlo al taller; seguridad; casos particulares.

## Reglas de calidad
- Original y técnicamente correcto; nada copiado de otras webs. Cifras con rango y «según el manual del fabricante».
- Específico de cada tema, no texto intercambiable (el validador exige similitud <0.30 entre fichas del mismo tipo).
- Seguridad (frenos, airbag, dirección, alta presión de combustible, batería, gasolina, elevar el coche): precauciones claras y cuándo NO hacerlo uno mismo.
- Ejemplos de diagnóstico: marcados como ilustrativos; NUNCA casos reales, testimonios, matrículas ni cifras inventadas presentadas como medidas.
- Sin HTML propio (solo P/UL/OL/TBL/H3/TIP/SEC), sin enlaces, sin emojis, sin nombres de competidores, sin mencionar que lo escribe una IA. Euros (€), decimales con coma.
- No cambies slug/seo/related de fichas existentes ni `reviewed_by`. No hagas commit/push/build.
- Ejecuta `cd /home/user/COCHES && npm run validate` y corrige lo que afecte a tus fichas.
