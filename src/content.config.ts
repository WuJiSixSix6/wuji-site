import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    summary: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    pinned: z.boolean().default(false),
    draft: z.boolean().default(false),
    coverTheme: z
      .enum(['celestial-gold', 'jade-nebula', 'obsidian-aurora', 'crimson-ink', 'azure-void'])
      .default('celestial-gold'),
    coverImage: z.string().optional(),
  }),
});

export const collections = { blog };
