// src/common/filters/prisma-client-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response, Request } from 'express';
import { Prisma } from 'generated/prisma/client';
import { mapPrismaError } from '../helpers/prisma-error.helper';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.error('Prisma exception:', exception);

    const { status, message } = mapPrismaError(exception);

    response.status(status).json({
      status: 'error',
      statusCode: status,
      message,
      timestamp: new Date(),
      path: request.url,
    });
  }
}
