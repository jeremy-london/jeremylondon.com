import { z, defineCollection } from "astro:content";

const BlogPosts = defineCollection({
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    category: z.string().trim(),
    author: z.string().trim(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()),
    image: z.string().optional(),
    publishDate: z.string().transform((str) => new Date(str)),
    load_pyodide: z.boolean().optional(),
  }),
});

export const collections = {
  blog: BlogPosts,
};
