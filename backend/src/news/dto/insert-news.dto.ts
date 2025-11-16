import { Category } from 'generated/prisma/enums';
import z from 'zod';

export const insertNewsSchema = z.object({
  publishedAt: z.coerce.date(),
  fetchedAt: z.coerce.date(),
  articleId: z.string(),
  title: z.string(),
  link: z.string(),
  content: z.string().nullable().optional(),
  sourceUrl: z.string(),
  creator: z.array(z.string()),
  imageUrl: z.string().nullable().optional(),
  description: z.string(),
  category: z.array(z.enum(Category)),
  pubDate: z.coerce.date(),
  pubDateTZ: z.string(),
});

export type InsertNewsDto = z.infer<typeof insertNewsSchema>;
