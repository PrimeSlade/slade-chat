import { Injectable } from '@nestjs/common';

import { FetchByCursorDto } from './dto/query-news.dto';
import { PrismaService } from 'src/prisma.service';
import { News } from './entities/news.entity';
import { User } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { InsertNewsDto } from './dto/insert-news.dto';

@Injectable()
export class NewsService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  async insertNews(insertNewsDto: InsertNewsDto[]): Promise<News[]> {
    return await this.prismaService.new.createManyAndReturn({
      data: insertNewsDto.map((item: any) => ({
        articleId: item.article_id,
        title: item.title,
        link: item.link,
        description: item.description,
        content:
          item.content === 'ONLY AVAILABLE IN PAID PLANS' ? null : item.content,
        creator: item.creator || [],
        imageUrl: item.image_url || null,
        sourceUrl: item.source_url,
        category: (item.category || []).map((cat: string) => cat.toUpperCase()),
        pubDate: new Date(item.pubDate),
        pubDateTZ: item.pubDateTZ || 'UTC',
        publishedAt: new Date(item.pubDate),
        fetchedAt: new Date(),
      })),
      skipDuplicates: true,
    });
  }

  async getNewsByCursor({
    cursor,
    take,
    categories,
  }: FetchByCursorDto): Promise<{
    data: News[];
    nextCursor: number | null;
    hasNextPage: boolean;
  }> {
    const news = await this.prismaService.new.findMany({
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: 'desc' },
      ...(categories?.length && {
        where: { category: { hasSome: categories } },
      }),
    });

    let nextCursor: number | null = null;

    const hasNextPage = news.length > take;
    const data = news.slice(0, take);

    if (hasNextPage) {
      nextCursor = data[data.length - 1].id;
    }

    return { data, nextCursor, hasNextPage };
  }

  async fetchNews(user: User) {
    const categories = user.categories
      .map((category) => category.toLowerCase())
      .join(',');

    const apikey = this.configService.get<string>('NEWSDATA_API');

    const news = await fetch(
      `https://newsdata.io/api/1/latest?apikey=${apikey}` +
        `&language=en` +
        `&image=1` +
        `&removeduplicate=1` +
        `&sort=pubdateasc` +
        `&size=10` +
        (categories ? `&category=${categories}` : ''),
    );

    return news.json();
  }
}
