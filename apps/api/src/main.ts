import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    cors: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalFilters(
    new AllExceptionsFilter(), // 3. Executed Last (Catch-all)
    new HttpExceptionFilter(), // 2. Executed Second
    new PrismaClientExceptionFilter(), // 1. Executed First
  );

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(port);
}
bootstrap();
