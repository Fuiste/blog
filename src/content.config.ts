import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const linkSchema = z.object({
  label: z.string(),
  href: z.url()
});

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    heroImage: z.string().optional(),
    featured: z.boolean().default(false)
  })
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    status: z.enum(["Active", "Maintained", "Archive"]),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().int(),
    links: z.array(linkSchema).min(1)
  })
});

const photos = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/photos" }),
  schema: z.object({
    title: z.string(),
    image: z.string(),
    alt: z.string(),
    takenAt: z.string().optional(),
    location: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().int()
  })
});

export const collections = { posts, projects, photos };
