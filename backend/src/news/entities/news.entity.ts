import { Category } from 'generated/prisma/enums';

export class News {
  id: number;
  publishedAt: Date;
  fetchedAt: Date;
  articleId: string;
  title: string;
  link: string;
  content: string | null;
  sourceUrl: string;
  creator: string[];
  imageUrl: string | null;
  description: string;
  category: Category[];
  pubDate: Date;
  pubDateTZ: string;
}
