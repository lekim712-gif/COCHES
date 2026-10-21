# Estado del proyecto y pendientes

_Actualizado: 13 de octubre de 2026._

## Publicada
**https://obdcodigos.com publicada el 13/10/2026** en Hostinger (subida manual inicial; después, despliegue automático). Auditoría del mismo día: 35 URLs rastreadas, 32 indexables, sitemap con 32 URLs, redirecciones, 404, cabeceras de seguridad, compresión (brotli), caché y `og:image` correctos. Único hallazgo, menor: `http://www…` tarda 2 saltos en llegar al dominio final (lo fuerza Hostinger antes que nuestro `.htaccess`).
Pendiente de medir: velocidad (PageSpeed Insights; los datos de campo tardan semanas en existir).

## Automatización de contenido (preparada, pendiente de la clave de la API)
Ver `docs/AUTOMATIZACION.md`. Falta el secreto `ANTHROPIC_API_KEY` en GitHub y una primera ejecución manual de una sola ficha para verificar el flujo con la API real (todo lo demás está probado en modo simulado, no la llamada real).

## Despliegue automático (activo desde el 13/10/2026)
Cada cambio subido a la rama `claude/happy-lovelace-3ojo5t` ejecuta `.github/workflows/deploy-hostinger.yml`: construye con `npm run build:prod` (usando el secreto `DOTENV`) y sube `dist/` por FTP a `public_html`. Primer despliegue real verificado: 55 s de subida y `.htaccess` nuevo activo (comprobación: `/.ftp-deploy-sync-state.json` devuelve 403). Secretos en GitHub: `DOTENV`, `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_SERVER_DIR`.
Las fichas nuevas se publican con `noindex` hasta que se marcan como revisadas.

## Hecho
- **Web completa en local** (Astro estático): portada, índices, 10 fichas de códigos, 4 testigos, 2 guías, 5 fichas por marca, páginas legales, metodología, 404, robots.txt, sitemap y `ads.txt`.
- **Contenido** en JSON con el esquema `seo / content_html / featured_image_prompt / schema_faq`, validado en cada build (`npm run validate`).
- **Imágenes:** 21 ilustraciones generadas con IA enlazadas, y generador propio gratuito para las fichas nuevas (`npm run image`).
- **SEO técnico:** canonical, Open Graph, datos estructurados (Organization, WebSite, Article, BreadcrumbList, FAQPage), sitemap con `lastmod` real, 0 enlaces internos rotos.
- **Cumplimiento:** Consent Mode v2 por defecto denegado, aviso legal, privacidad y cookies con datos del titular, transparencia sobre el uso de IA.
- **Monetización preparada y apagada:** bloques AdSense y enlaces Amazon se activan con variables de entorno.
- **Control de lanzamiento:** `npm run build:prod` falla si falta algo obligatorio.

## Pendiente (en este orden)
1. **Search Console:** añadir `obdcodigos.com` como propiedad de dominio (verificación con registro TXT en la zona DNS de Hostinger) y enviar `sitemap-index.xml`. Solicitar indexación de la portada y de 3-5 fichas.
2. **Bing Webmaster Tools:** importar el sitio desde Search Console. Activar IndexNow cuando estén las automatizaciones.
3. **Correo `contacto@obdcodigos.com`:** reclamar el email gratuito de Hostinger y crear exactamente esa cuenta.
4. **Automatizaciones:** generar fichas desde `content-plan/backlog.json` con la API de Claude y el esquema JSON (cada una pasa por `validate-content.mjs`), imagen con el generador propio, publicación escalonada (5-10 por semana), revisión de Carlos con `npm run reviewed`.
5. **Medir velocidad** en PageSpeed Insights (móvil) y revisar Search Console a la semana.
6. **AdSense:** solicitarlo con 20-30 fichas indexadas y algo de tráfico. Después rellenar `PUBLIC_ADSENSE_CLIENT` y los slots, y configurar el mensaje de consentimiento (Privacidad y mensajes).
7. **Amazon Afiliados (amazon.es):** solicitarlo con la web en línea; rellenar `PUBLIC_AMAZON_TAG`.

## Estrategia de indexación (decidida el 13/10/2026: «opción B»)
- **Las fichas sin revisar SÍ se indexan**, mostrando «elaborada con IA, pendiente de revisión técnica» y sin nombre de revisor. «Revisada por Carlos Peláez» solo aparece en las que él ha revisado de verdad.
- **Excepción:** los testigos de seguridad (ABS, frenos, airbag, dirección asistida; `requieren_revision_humana` en el backlog) llevan `noindex` y quedan fuera del sitemap hasta que los revise una persona.
- **Ritmo:** 3 fichas lunes y jueves (6 por semana). Punto de control: con 40 fichas sin revisar la generación se pausa.
- **Control semanal en Search Console:** si la mayoría de las fichas sale como «Rastreada, sin indexar» o «Descubierta, sin indexar», pausar y mejorar la plantilla antes de añadir más.
- **Escalar solo las familias que reciben impresiones.** Fichas por marca solo con particularidades reales y a mano.
- Para volver al modo estricto: `PUBLIC_INDEX_UNREVIEWED=0` en el secreto `DOTENV` de GitHub.
- `npm run build:prod` avisa de cuántas fichas son indexables.

## Decisiones tomadas
- Nicho OBD2 en español, España primero; electrodomésticos queda como posible segundo sitio si este funciona.
- Fichas por marca solo con particularidades reales de la plataforma (el validador lo exige).
- Imágenes: generador propio para lo nuevo; sin gastar créditos de servicios externos.
- El contenido es portable (JSON); cambiar de stack costaría solo maquetación.

## Actualización 15/10/2026
- 35 fichas publicadas. Lote 3 (15/10): P0234, P0101, P0238, P0113, P0341 — pendientes de revisión técnica por Carlos.
- Search Console conectado (workflow `fetch-gsc`, lunes y jueves); aún sin impresiones.
- AdSense: script en el head, `ads.txt` activo, revisión solicitada.
- Backlog reordenado con Semrush (ES y MX). Las 4 fichas de seguridad (ABS, freno, airbag, dirección asistida) siguen sin escribir: esperan decisión del usuario.

## Actualización 19/10/2026
- 40 fichas publicadas. Lote 4 (19/10): P0089, P0402, P0100, P0016, P0400 — pendientes de revisión técnica por Carlos.
- Search Console: primeras impresiones (22 consultas, 24 páginas; P0420 en posición ~4). Aún casi sin clics.

## Actualización 20/10/2026
- 50 fichas publicadas. Lote del día: P0243, P0236, P0571, P0638, P0500; testigos presión de neumáticos, precalentamiento diésel y AdBlue; guías borrar códigos OBD2 y cambio del filtro de aire — pendientes de revisión técnica por Carlos.
- Search Console: el testigo del filtro de partículas es la página con más impresiones (23); los testigos tienen demanda.
- Rutina diaria: 10 fichas con mezcla de tipos (códigos, testigos, guías, marca).

## Actualización 21/10/2026
- 60 fichas publicadas. Lote del día: P0193, P0104, P0441, P0562, P0421; testigos EPC, nivel de aceite y mantenimiento (llave inglesa); guías comprobar refrigerante y cambio de bujías — pendientes de revisión técnica por Carlos.
- Descarga de datos de Search Console ahora diaria. Backlog: 35 códigos, 3 guías y los 4 testigos de seguridad (sin escribir).
