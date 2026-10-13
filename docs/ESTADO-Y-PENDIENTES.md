# Estado del proyecto y pendientes

_Actualizado: 13 de octubre de 2026._

## Hecho
- **Web completa en local** (Astro estático): portada, índices, 10 fichas de códigos, 4 testigos, 2 guías, 5 fichas por marca, páginas legales, metodología, 404, robots.txt, sitemap y `ads.txt`.
- **Contenido** en JSON con el esquema `seo / content_html / featured_image_prompt / schema_faq`, validado en cada build (`npm run validate`).
- **Imágenes:** 21 ilustraciones generadas con IA enlazadas, y generador propio gratuito para las fichas nuevas (`npm run image`).
- **SEO técnico:** canonical, Open Graph, datos estructurados (Organization, WebSite, Article, BreadcrumbList, FAQPage), sitemap con `lastmod` real, 0 enlaces internos rotos.
- **Cumplimiento:** Consent Mode v2 por defecto denegado, aviso legal, privacidad y cookies con datos del titular, transparencia sobre el uso de IA.
- **Monetización preparada y apagada:** bloques AdSense y enlaces Amazon se activan con variables de entorno.
- **Control de lanzamiento:** `npm run build:prod` falla si falta algo obligatorio.

## Pendiente (en este orden)
1. **Comprar `obdcodigos.com`** (confirmar disponibilidad en el registrador).
2. **Automatizaciones** (siguiente fase):
   - Generación de fichas desde `content-plan/backlog.json` con la API de Claude y el esquema JSON; cada ficha pasa por `validate-content.mjs`.
   - Imagen con el generador propio y guardado como borrador.
   - Publicación escalonada (5-10 fichas/semana) con despliegue automático e IndexNow.
   - Marcado de revisión con `npm run reviewed` cuando Carlos Peláez revise.
3. ~~Revisión técnica de las 21 fichas por Carlos Peláez~~ **Hecha el 13/10/2026** (sin cambios): las 21 fichas son indexables y muestran «Revisada por». Las fichas nuevas que se generen volverán a empezar «pendiente de revisión» con `noindex`.
4. **Hosting: Hostinger** (dominio y hosting). Guía paso a paso en `docs/DESPLIEGUE-HOSTINGER.md`: añadir el dominio, SSL, cuenta FTP limitada a su carpeta y primera subida manual de `dist/` (con `.htaccess`).
5. **Correo `contacto@obdcodigos.com`:** crearlo en Hostinger si el plan lo incluye, o reenviarlo a tu correo.
6. **Search Console y Bing Webmaster:** verificar el dominio y enviar `sitemap-index.xml`.
7. **AdSense:** solicitarlo con 20-30 fichas revisadas e indexadas. Después, rellenar `PUBLIC_ADSENSE_CLIENT` y los slots, y configurar el mensaje de consentimiento (Privacidad y mensajes).
8. **Amazon Afiliados (amazon.es):** solicitarlo con la web en línea; rellenar `PUBLIC_AMAZON_TAG`.

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
