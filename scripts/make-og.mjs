// Genera public/og-default.png (1200×630) con sharp, que ya viene con Astro.
import sharp from 'sharp';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#14181f"/><rect y="610" width="1200" height="20" fill="#f5a524"/><text x="80" y="300" font-family="DejaVu Sans Mono, monospace" font-size="150" font-weight="700" fill="#f5a524">P0420</text><text x="80" y="400" font-family="DejaVu Sans, Arial, sans-serif" font-size="56" font-weight="700" fill="#ffffff">Códigos de avería OBD2</text><text x="80" y="470" font-family="DejaVu Sans, Arial, sans-serif" font-size="36" fill="#c9ced8">Causas, síntomas y solución paso a paso</text><text x="80" y="560" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" font-weight="700" fill="#ffffff">OBDCodigos</text></svg>`;
await sharp(Buffer.from(svg)).png().toFile('public/og-default.png');
console.log('og-default.png creado');
