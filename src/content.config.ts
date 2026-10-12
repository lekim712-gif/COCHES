import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articulos = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/articulos' }),
  schema: z.object({
    type: z.enum(['codigo', 'testigo', 'guia', 'marca']),
    name: z.string(),
    code: z.string().optional(),
    brand: z.string().optional(),
    brand_name: z.string().optional(),
    datePublished: z.string(),
    dateModified: z.string(),
    review_status: z.string().optional(),
    seo: z.object({ meta_title: z.string(), meta_description: z.string(), slug: z.string() }),
    content_html: z.string(),
    featured_image_prompt: z.string(),
    schema_faq: z.array(z.object({ question: z.string(), answer: z.string() })).min(3),
    products: z.array(z.string()).default([]),
    related: z.array(z.string()).default([]),
    brand_specific_points: z.number().optional(),
    featured_image: z.string().optional(),
  }),
});

export const collections = { articulos };
