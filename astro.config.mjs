import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync, readdirSync } from 'node:fs';

// Dominio canónico (sin www y sin barra final). Se define al comprar el dominio: SITE_URL=https://midominio.com
const site = process.env.SITE_URL || 'https://codigoaveria.com';

// lastmod real = dateModified del JSON de cada artículo (nunca la fecha del build).
const DIR = new URL('./src/content/articulos/', import.meta.url);
const lastmod = new Map();
for (const f of readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  const a = JSON.parse(readFileSync(new URL(f, DIR), 'utf8'));
  const path = a.type === 'codigo' ? `/codigos/${a.seo.slug}/`
    : a.type === 'testigo' ? `/testigos-tablero/${a.seo.slug}/`
    : a.type === 'guia' ? `/mantenimiento-guias/${a.seo.slug}/`
    : `/marcas/${a.brand}/${a.seo.slug}/`;
  lastmod.set(path, a.dateModified);
}

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  build: { inlineStylesheets: 'auto' },
  integrations: [
    sitemap({
      filter: (p) => !/\/(aviso-legal|privacidad|cookies|gracias)\/$/.test(p),
      serialize(item) {
        const lm = lastmod.get(new URL(item.url).pathname);
        if (lm) item.lastmod = new Date(lm).toISOString();
        return item;
      },
    }),
  ],
});
