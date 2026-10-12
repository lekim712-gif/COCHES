# OBDCodigos: web de diagnóstico OBD2

Sitio estático (Astro) de fichas técnicas de códigos de avería, testigos y mantenimiento, para España y Latinoamérica.

```bash
npm install
npm run seed       # regenera src/content/articulos/*.json (solo contenido de ejemplo)
npm run validate   # puerta de calidad de contenido
npm run dev        # desarrollo
npm run build      # validate + build a dist/
```

- Análisis de la idea, riesgos y hoja de ruta: [`docs/ANALISIS-Y-LANZAMIENTO.md`](docs/ANALISIS-Y-LANZAMIENTO.md)
- Configuración y variables: [`.env.example`](.env.example), [`src/config.ts`](src/config.ts)
- Formato de contenido: cada ficha es un JSON en `src/content/articulos/` con `seo`, `content_html`, `featured_image_prompt` y `schema_faq` (+ `type`, `code`/`brand`, fechas). La automatización futura solo debe escribir ficheros con esta forma y pasar `npm run validate`.
- Los marcadores `<!--ad-slot-1-->` y `<!--ad-slot-2-->` de `content_html` se sustituyen por los bloques AdSense al renderizar.

## Imágenes
- Las 21 fichas iniciales llevan ilustraciones generadas con IA (ya pagadas, no se regeneran).
- **Fichas nuevas:** el generador propio crea una tarjeta 1200×630 con pictograma técnico, sin servicios externos ni coste:
  `npm run image -- --missing` (solo las que no tienen imagen) o `npm run image -- src/content/articulos/<ficha>.json`.
  El pictograma se elige por el nombre del problema (catalizador, turbo, EGR, red CAN, batería, etc.); revisa el resultado.

## Revisión técnica
- Cada ficha muestra «pendiente de revisión técnica» hasta que alguien la revisa de verdad.
- Para marcarla: `npm run reviewed -- codigo-p0420 --by "Carlos Peláez" --date 2026-10-20` (`--unmark` la quita).

## Lanzamiento
- `.env` (no se sube a Git) guarda el dominio y los datos del titular; en producción se definen como variables de entorno en el hosting.
- `npm run build:prod` hace el build y **falla si queda algún `[PENDIENTE]`**, si faltan los datos del titular o si `SITE_URL` no es el dominio real.
