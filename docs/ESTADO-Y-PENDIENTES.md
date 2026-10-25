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

## Actualización 22/10/2026
- 70 fichas publicadas. Lote del día: P0141, P0170, P0322, P0134, P0105; guías filtro de habitáculo, limpiar MAF, limpiar EGR, cómo elegir un escáner OBD2 y «el coche pierde potencia».
- Ampliados con secciones nuevas (prevención y cuándo acudir al taller) los testigos de motor, batería, presión de aceite y filtro de partículas (eran los de menos texto y los de más impresiones). Al cambiar el contenido, pasan otra vez a «pendiente de revisión técnica» hasta nueva revisión de Carlos.
- Search Console: 252 impresiones y 1 clic en el periodo; el testigo del filtro de partículas es la página con más impresiones (47, posición ~43).

## Actualización 22/10/2026 (tarde)
- Escritos los 4 testigos de seguridad (ABS, frenos, airbag, dirección asistida) con la confirmación del usuario. Llevan `needs_review: true`: salen con `noindex` y fuera del sitemap hasta que Carlos los revise y se marquen como revisados.

## Actualización 23/10/2026
- 85 fichas publicadas (+4 testigos de seguridad en noindex). Lote del día: P0190, P0230, P0131, P0133, P0325; guías «tironea al acelerar», humo del escape, no arranca, consumo excesivo y chirrido de correa — pendientes de revisión de Carlos.
- Search Console: 289 impresiones y 1 clic; sin problemas de indexación.

## Actualización 24/10/2026
- 95 fichas indexables. Lote del día: P0507, P0730, P0116, P0120, P2263; guías ruidos al frenar (noindex hasta revisión humana, tema de seguridad), vibraciones del volante, calefacción, aire acondicionado y «el coche se cala».
- Search Console: 334 impresiones y 1 clic; sin problemas de indexación.

## Actualización 25/10/2026
- 105 fichas indexables. Lote del día: P0600, U0121 (noindex hasta revisión), P0403, P0201, P0115; guías batería que se descarga sola, olor a quemado (noindex hasta revisión), ruidos de suspensión (noindex hasta revisión), ITV y emisiones, datos en vivo del OBD2.
- Search Console: 374 impresiones, 2 clics; sin problemas de indexación. AdSense: pendiente de pulsar «Solicitar revisión» (el panel muestra «Debe revisarse», sin motivo de rechazo).
