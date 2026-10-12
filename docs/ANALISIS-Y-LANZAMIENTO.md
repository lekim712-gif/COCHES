# Análisis de la idea y plan de lanzamiento

## 1. Veredicto

**Viable como experimento de bajo coste; no como "máquina de dinero escalable" tal y como está planteada.** El nicho tiene demanda real y permanente, pero tres supuestos del planteamiento original necesitan corrección.

### Lo que sí funciona
- **Demanda permanente y muy fragmentada:** miles de búsquedas long-tail ("p0420 causas", "testigo aceite parpadea") con intención clara de resolver un problema ahora.
- **Coste de operación mínimo:** sitio estático, hosting casi gratuito, contenido generado por API.
- **Monetización natural:** quien busca un código de avería es comprador potencial de un escáner OBD2 (Amazon) y es un tema apto para anuncios.
- **Encaje técnico:** el formato (ficha, tabla, pasos, FAQ) es el que mejor se cita en buscadores y asistentes de IA.

### Supuestos a corregir
1. **"Sin riesgo YMYL" es demasiado optimista.** Google trata como más sensible lo que puede afectar a la seguridad física. Frenos, airbag, presión de combustible diésel (>1.000 bar) o baterías entran ahí. No penaliza el nicho, pero exige autoría creíble, avisos de seguridad y cero datos inventados. Una cifra errónea (par de apriete, presión) aquí es un problema real.
2. **"Escalabilidad masiva automatizada" choca con la política de *scaled content abuse* de Google** (spam de contenido a escala, sea con IA o sin ella). La matriz código × marca es exactamente el patrón que penaliza si las páginas son variaciones de plantilla. Por eso el proyecto **solo crea una ficha de marca si aporta ≥ 3 particularidades reales de esa plataforma** (el validador bloquea el build si no). Pocas páginas buenas valen más que miles finas.
3. **Las respuestas directas de IA (AI Overviews) se comen parte del tráfico** de las consultas más simples ("qué significa P0300"). Las fichas que ganan clics son las que dan algo que el resumen no da: diagnóstico guiado, costes, causas por plataforma, herramientas.

### Riesgos principales (ordenados)
| Riesgo | Impacto | Mitigación incluida |
|---|---|---|
| Rechazo de AdSense por "contenido de poco valor" o sitio incompleto | Retrasa meses la monetización | Páginas legales, metodología, contacto, contenido útil original, ads desactivados hasta aprobar |
| Penalización por contenido a escala | Pérdida de tráfico | Puerta de calidad de marca, fechas de actualización reales, publicación gradual |
| Datos técnicos inventados (alucinación) | Riesgo para el usuario, pérdida de confianza | Regla "ceñirse a SAE", valores de fabricante remitidos al manual, revisión humana |
| Competencia ya establecida (sitios de códigos, foros, fabricantes) | Posicionamiento lento | Foco en long-tail por plataforma, diagnóstico guiado |
| RPM bajo en español, y mucho más bajo en Latinoamérica | Ingresos reducidos | Priorizar España; afiliación como segunda vía |
| Afiliación: Amazon cierra cuentas sin ventas en 180 días y tiene programas por país | Pérdida de la cuenta | Registrar amazon.es primero; verificar qué países LatAm tienen programa |

### Expectativas realistas
Un dominio nuevo suele tardar **varios meses** en recibir tráfico orgánico significativo, y AdSense solo paga a partir de un umbral de ingresos. Es un proyecto de 6-12 meses para ver resultados, no de semanas. No hay cifras de ingresos fiables que prometer: dependen de volumen de tráfico, país y suerte con el algoritmo.

### Recomendaciones que cambian el resultado
1. **Una persona real como revisor técnico** (mecánico o técnico formado) con nombre y breve trayectoria en "Sobre nosotros" y en cada ficha. Es la mayor palanca de calidad percibida.
2. **Empezar en España** (español de España: "coche", "testigo", "avería"). Latinoamérica usa otro léxico ("carro", "falla", "check engine") y merece su propia sección con `hreflang` más adelante, no mezclada.
3. **Añadir datos que la IA no tiene a mano**: rangos de coste de taller verificados, valores medidos de ejemplo, fotos reales de los componentes.
4. **Publicar gradualmente** (p. ej. 5-10 fichas/semana, no 500 de golpe) y medir qué indexa Google antes de escalar.
5. **Definir un disparador de escala**: ampliar solo las familias de contenido que ya reciban impresiones en Search Console.

## 2. Dominio

No puedo registrar dominios desde este entorno; hay que comprarlo. Criterios: `.com` o `.es`, corto, fácil de dictar, sin guiones ni números, y que no contenga marcas de fabricantes.

Candidatos comprobados con una consulta DNS desde este entorno (**solo una pista, no confirma disponibilidad**; verifícalos en el registrador):

| Dominio | Consulta DNS |
|---|---|
| codigoaveria.com | sin registro DNS (posiblemente libre) |
| codigosaveria.com | sin registro DNS (posiblemente libre) |
| averiaobd.com | sin registro DNS (posiblemente libre) |
| obdcodigos.es | sin registro DNS (posiblemente libre) |
| testigoscoche.com | resuelve (probablemente ocupado) |
| diagnosticoobd.com | resuelve (probablemente ocupado) |

Compra recomendada: Cloudflare Registrar o similar, con renovación a precio de coste. Comprueba que el nombre no infringe marcas registradas. **Dominio canónico: apex sin `www`**, con redirección 301 de `www`.

## 3. Lo que se ha construido

- **Astro 5 estático**, HTML puro y sin JS en las fichas, `trailingSlash: always`.
- **Silos**: `/codigos/[codigo]/`, `/marcas/[marca]/[codigo]/`, `/testigos-tablero/`, `/mantenimiento-guias/`.
- **Contenido**: 21 fichas (10 códigos, 4 testigos, 2 guías, 5 fichas por marca) en JSON con el esquema `seo / content_html / featured_image_prompt / schema_faq`.
- **Validador de calidad** (`npm run validate`, también en `build`): exige H1 único, tabla, `<ul>`, `<ol>`, FAQ ≥ 3, introducción 40-85 palabras, metas únicos y particularidades reales en páginas de marca.
- **SEO técnico**: canonical, Open Graph, `max-image-preview`, JSON-LD (Organization, WebSite, Article, BreadcrumbList, FAQPage), sitemap con `lastmod` real, robots.txt, 404, HSTS/nosniff.
- **Monetización lista pero apagada**: bloques AdSense en los puntos pedidos (tras la tabla y tras los pasos) y enlaces Amazon con `rel="sponsored"` y aviso de afiliación. No cargan nada hasta definir las variables de `.env.example`.
- **Cumplimiento UE**: Consent Mode v2 en denegado por defecto, carga de Google Funding Choices (CMP certificado) cuando se configure AdSense, páginas de aviso legal, privacidad y cookies.

**Nota sobre FAQPage:** desde 2023 Google solo muestra el desplegable de preguntas para sitios gubernamentales y de salud. Se mantiene el marcado porque es válido y ayuda a asistentes de IA, pero no esperes rich results.

## 4. Antes de publicar (bloqueantes)

1. Comprar el dominio y definir `SITE_URL`.
2. Rellenar titular legal (`PUBLIC_OWNER_*`), y los `[PENDIENTE]` de *Sobre nosotros* y *Metodología* **con información veraz**. Revisar los textos legales con un asesor.
3. **Revisión técnica humana de las 21 fichas.** Están marcadas `review_status: draft-ia`. No he podido verificar los datos con fuentes externas ni con un mecánico: los rangos de coste y los procedimientos son orientativos.
4. Sustituir las imágenes (hoy solo hay `featured_image_prompt`; el siguiente paso es generarlas con Flux/DALL-E y mostrarlas).

## 5. Hoja de ruta de lanzamiento

1. **Hosting**: Cloudflare Pages conectado al repo. Build `npm run build`, salida `dist`. Variables de entorno de `.env.example`. Regla de zona de `www` → apex (301).
2. **Search Console + Bing Webmaster Tools**: verificar, enviar `sitemap-index.xml`, activar IndexNow.
3. **Esperar a tener 20-30 fichas buenas y algo de indexación**, y entonces solicitar AdSense. Antes: sitio accesible sin errores, legales completas, tráfico mínimo.
4. **Al aprobar AdSense**: configurar el mensaje de consentimiento (AdSense → Privacidad y mensajes), definir `PUBLIC_ADSENSE_CLIENT` y los slots; `ads.txt` se genera solo.
5. **Amazon Associates** (amazon.es): solicitar con el sitio en línea, definir `PUBLIC_AMAZON_TAG`.
6. **Después**: automatización de publicación (siguiente fase), con el validador como puerta de entrada y publicación escalonada.
