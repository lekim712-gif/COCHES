import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIES } from '../config';

export type Article = CollectionEntry<'articulos'>;

export const urlOf = (a: Article): string => {
  const { type, seo, brand } = a.data;
  return type === 'marca' ? `/marcas/${brand}/${seo.slug}/` : `/${CATEGORIES[type].path}/${seo.slug}/`;
};

export async function allArticles(): Promise<Article[]> {
  const list = await getCollection('articulos');
  return list.sort((a, b) => a.data.seo.slug.localeCompare(b.data.seo.slug, 'es', { numeric: true }));
}

export const byType = (list: Article[], t: Article['data']['type']) => list.filter((a) => a.data.type === t);

export const brands = (list: Article[]) => {
  const m = new Map<string, { slug: string; name: string; items: Article[] }>();
  for (const a of byType(list, 'marca')) {
    const e = m.get(a.data.brand!) ?? { slug: a.data.brand!, name: a.data.brand_name!, items: [] };
    e.items.push(a);
    m.set(a.data.brand!, e);
  }
  return [...m.values()];
};

/** Resuelve slugs de `related` a artículos no-marca. */
export const resolveRelated = (list: Article[], slugs: string[]) =>
  slugs.map((s) => list.find((a) => a.data.type !== 'marca' && a.data.seo.slug === s)).filter(Boolean) as Article[];

export const amazonUrl = (domain: string, tag: string, q: string) =>
  `https://${domain}/s?k=${encodeURIComponent(q)}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}`;
