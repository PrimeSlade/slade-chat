import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { ZodValidationPipe } from 'src/common/pipes/zod.validation.pipe';
import { FetchByCursorDto, fetchByCursorSchema } from './dto/query-news.dto';
import { User as UserDecorator } from 'src/common/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  createNews() {}

  @Get()
  async getNews(
    @Query(new ZodValidationPipe(fetchByCursorSchema)) query: FetchByCursorDto,
    @UserDecorator() user: User,
  ) {
    const { cursor, take } = query;

    let news: any = null;

    const { data, nextCursor, hasNextPage } =
      await this.newsService.getNewsByCursor({
        cursor,
        take,
        categories: user.categories,
      });

    news = data;

    if (data.length === 0 || nextCursor === null) {
      const fetchedNews = await this.newsService.fetchNews(user);

      console.log(fetchedNews.results);

      news = await this.newsService.insertNews(fetchedNews.results);
    }

    return {
      data: news,
      message: 'News successfully fetched',
      pagination: {
        nextCursor,
        hasNextPage,
      },
    };
  }
}
