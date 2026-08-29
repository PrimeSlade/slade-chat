import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const res = exception.getResponse();

    // Some exceptions return an object, some a string
    const message = typeof res === 'string' ? res : (res as any).message;

    response.status(status).json({
      status: 'error',
      statusCode: status,
      message,
      timestamp: new Date(),
      path: request.url,
    });
  }
}
