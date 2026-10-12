import type { APIRoute } from 'astro';
import { SITE } from '../config';
// Se genera con el ID de editor (pub-XXXX) cuando se configura PUBLIC_ADSENSE_CLIENT.
export const GET: APIRoute = () => {
  const pub = SITE.adsenseClient.replace(/^ca-/, '');
  const body = pub ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : '# ads.txt: se completará al activar AdSense (PUBLIC_ADSENSE_CLIENT)\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
