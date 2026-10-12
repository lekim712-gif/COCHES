// Configuración editable del sitio. Los valores sensibles/variables se pasan por variables de entorno PUBLIC_*.
export const PENDIENTE = '[PENDIENTE]';

export const SITE = {
  name: 'CodigoAveria',
  tagline: 'Códigos de avería OBD2, testigos del tablero y mantenimiento',
  locale: 'es_ES',
  lang: 'es',
  email: import.meta.env.PUBLIC_CONTACT_EMAIL || 'contacto@codigoaveria.com',
  // Titular legal (obligatorio por LSSI-CE). Rellenar antes de publicar.
  owner: {
    name: import.meta.env.PUBLIC_OWNER_NAME || PENDIENTE,
    taxId: import.meta.env.PUBLIC_OWNER_TAXID || PENDIENTE,
    address: import.meta.env.PUBLIC_OWNER_ADDRESS || PENDIENTE,
  },
  adsenseClient: import.meta.env.PUBLIC_ADSENSE_CLIENT || '', // ca-pub-XXXXXXXXXXXXXXXX
  adSlots: { 1: import.meta.env.PUBLIC_ADSLOT_1 || '', 2: import.meta.env.PUBLIC_ADSLOT_2 || '' },
  amazonTag: import.meta.env.PUBLIC_AMAZON_TAG || '', // p. ej. micuenta-21
  amazonDomain: 'www.amazon.es',
  gaId: import.meta.env.PUBLIC_GA_ID || '', // G-XXXXXXXXXX
};

export const CATEGORIES = {
  codigo: { path: 'codigos', label: 'Códigos OBD2', title: 'Códigos de avería OBD2', desc: 'Significado, causas, síntomas y reparación de los códigos de error OBD2 (P, B, C y U).' },
  testigo: { path: 'testigos-tablero', label: 'Testigos del tablero', title: 'Testigos del tablero', desc: 'Qué significa cada testigo del cuadro de instrumentos y qué hacer cuando se enciende.' },
  guia: { path: 'mantenimiento-guias', label: 'Mantenimiento', title: 'Guías de mantenimiento', desc: 'Guías paso a paso de mantenimiento preventivo: aceite, fusibles, filtros y más.' },
} as const;
