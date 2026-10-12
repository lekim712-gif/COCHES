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
