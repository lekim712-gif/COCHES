# Estado del proyecto y pendientes

_Actualizado: 13 de octubre de 2026._

## Publicada
**https://obdcodigos.com publicada el 13/10/2026** en Hostinger (subida manual inicial; después, despliegue automático). Auditoría del mismo día: 35 URLs rastreadas, 32 indexables, sitemap con 32 URLs, redirecciones, 404, cabeceras de seguridad, compresión (brotli), caché y `og:image` correctos. Único hallazgo, menor: `http://www…` tarda 2 saltos en llegar al dominio final (lo fuerza Hostinger antes que nuestro `.htaccess`).
Pendiente de medir: velocidad (PageSpeed Insights; los datos de campo tardan semanas en existir).

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

## Estrategia de indexación (decidida)
- **Una ficha solo es indexable cuando está revisada.** Sin revisar se publica con `noindex, follow`, sin canonical y fuera del sitemap. Al marcarla con `npm run reviewed -- <ficha>` pasa a indexable y entra en el sitemap.
- **Lanzamiento:** revisar las 21 y añadir 10-15 más hasta unas 30-35 indexables; publicar ese bloque junto. Después, 5-10 fichas por semana durante 6-8 semanas.
- **Punto de control semanal en Search Console:** si la mayoría de las fichas sale como «Rastreada, sin indexar» o «Descubierta, sin indexar», pausar y mejorar la plantilla antes de añadir más.
- **Escalar solo las familias que reciben impresiones.** Fichas por marca solo con particularidades reales.
- Interruptor de emergencia: `PUBLIC_INDEX_UNREVIEWED=1` indexa todo sin esperar revisión (no recomendado).
- `npm run build:prod` avisa de cuántas fichas son indexables.

## Decisiones tomadas
- Nicho OBD2 en español, España primero; electrodomésticos queda como posible segundo sitio si este funciona.
- Fichas por marca solo con particularidades reales de la plataforma (el validador lo exige).
- Imágenes: generador propio para lo nuevo; sin gastar créditos de servicios externos.
- El contenido es portable (JSON); cambiar de stack costaría solo maquetación.
