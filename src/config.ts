// Configuración editable del sitio. Los valores sensibles/variables se pasan por variables de entorno PUBLIC_*.
export const PENDIENTE = '[PENDIENTE]';
// Valor opcional: vacío o un marcador como «-» / «none» cuenta como NO definido (algunos paneles obligan a escribir algo).
const opt = (v?: string) => (v && !['-', '--', 'none', 'no', 'n/a', 'na', 'null'].includes(v.trim().toLowerCase()) ? v.trim() : '');

export const SITE = {
  name: 'OBDCodigos',
  tagline: 'Códigos de avería OBD2, testigos del tablero y mantenimiento',
  locale: 'es_ES',
  lang: 'es',
  email: import.meta.env.PUBLIC_CONTACT_EMAIL || 'contacto@obdcodigos.com',
  // Titular legal (obligatorio por LSSI-CE). Rellenar antes de publicar.
  owner: {
    name: import.meta.env.PUBLIC_OWNER_NAME || PENDIENTE,
    taxId: import.meta.env.PUBLIC_OWNER_TAXID || PENDIENTE,
    address: import.meta.env.PUBLIC_OWNER_ADDRESS || PENDIENTE,
  },
  // Revisor técnico del proyecto. La mención «Revisada por» solo aparece en las fichas que lo indican (reviewed_by).
  reviewer: {
    name: import.meta.env.PUBLIC_REVIEWER_NAME || '',
    years: Number(import.meta.env.PUBLIC_REVIEWER_EXPERIENCE || 0),
  },
  // true (por defecto) = las fichas sin revisar se indexan mostrando «pendiente de revisión técnica». Poner PUBLIC_INDEX_UNREVIEWED=0 para exigir revisión antes de indexar.
  // Las fichas con needs_review (temas de seguridad) siempre exigen revisión humana.
  indexUnreviewed: import.meta.env.PUBLIC_INDEX_UNREVIEWED !== '0',
  adsenseClient: opt(import.meta.env.PUBLIC_ADSENSE_CLIENT) || 'ca-pub-3471604320419676', // ID público del editor; la variable de entorno tiene prioridad
  adSlots: { 1: opt(import.meta.env.PUBLIC_ADSLOT_1), 2: opt(import.meta.env.PUBLIC_ADSLOT_2) },
  amazonTag: opt(import.meta.env.PUBLIC_AMAZON_TAG), // p. ej. micuenta-21
  amazonDomain: 'www.amazon.es',
  gaId: opt(import.meta.env.PUBLIC_GA_ID), // G-XXXXXXXXXX
};

export const CATEGORIES = {
  codigo: { path: 'codigos', label: 'Códigos OBD2', title: 'Códigos de avería OBD2', desc: 'Significado, causas, síntomas y reparación de los códigos de error OBD2 (P, B, C y U).' },
  testigo: { path: 'testigos-tablero', label: 'Testigos del tablero', title: 'Testigos del tablero', desc: 'Qué significa cada testigo del cuadro de instrumentos y qué hacer cuando se enciende.' },
  guia: { path: 'mantenimiento-guias', label: 'Mantenimiento', title: 'Guías de mantenimiento', desc: 'Guías paso a paso de mantenimiento preventivo: aceite, fusibles, filtros y más.' },
} as const;
