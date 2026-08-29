import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Pagination } from '../types/responce.type';

export interface ResponseFormat<T> {
  status: 'success';
  data: T;
  message: string;
  timestamp: Date;
  pagination?: Pagination;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    return next.handle().pipe(
      map((data) => ({
        status: 'success',
        data: data?.data ?? null,
        message: data?.message ?? 'Request successful',
        timestamp: new Date(),
        ...(data?.pagination && { pagination: data.pagination }),
      })),
    );
  }
}
