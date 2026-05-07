// Content Collections schema. Two collections live here:
//   - `posts`: blog entries authored as `<slug>_<lang>.md`. `legacyUrl`
//     records the old Hatena entry path so build-redirects can emit a 301.
//   - `pages`: standalone pages (about, etc.) authored as `<slug>_<lang>.md`.
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // Old Hatena entry path (e.g. `/entry/2025/11/17/051856`); used by
    // scripts/build-redirects.ts to emit Cloudflare 301s.
    legacyUrl: z.string().optional(),
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { posts, pages };
