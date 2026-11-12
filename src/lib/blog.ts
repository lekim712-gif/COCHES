import type { Article } from './articles';
export const BLOG_PAGE_SIZE = 21;
export const blogSorted = (l: Article[]) => [...l].sort((a, b) => b.data.datePublished.localeCompare(a.data.datePublished) || a.data.seo.slug.localeCompare(b.data.seo.slug));
