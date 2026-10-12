// Convierte los PNG originales (carpeta pasada como argumento) a WebP 1200×630 en public/img/articulos/
// y enlaza cada imagen en el JSON del artículo con el campo featured_image.
import sharp from 'sharp';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const src = process.argv[2];
if (!src) { console.error('uso: node scripts/process-images.mjs <carpeta-png>'); process.exit(1); }
const out = 'public/img/articulos', content = 'src/content/articulos';
mkdirSync(out, { recursive: true });
for (const f of readdirSync(src).filter((f) => f.endsWith('.png'))) {
  const key = f.slice(0, -4);
  const json = join(content, `${key}.json`);
  if (!existsSync(json)) { console.warn('sin artículo para', key); continue; }
  await sharp(join(src, f)).resize(1200, 630, { fit: 'cover', position: 'centre' }).webp({ quality: 78 }).toFile(join(out, `${key}.webp`));
  await sharp(join(src, f)).resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 82, mozjpeg: true }).toFile(join(out, `${key}.jpg`)); // og:image y JSON-LD
  const a = JSON.parse(readFileSync(json, 'utf8'));
  a.featured_image = `/img/articulos/${key}.webp`;
  writeFileSync(json, JSON.stringify(a, null, 2) + '\n');
  console.log('ok', key);
}
