import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) => new Response(
`User-agent: *
Allow: /

# Buscadores y asistentes de IA permitidos (política abierta: visibilidad en IA)
Sitemap: ${new URL('/sitemap-index.xml', site).href}
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
