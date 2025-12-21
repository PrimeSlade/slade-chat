// src/common/helpers/prisma-error.helper.ts
import { HttpStatus } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';

type PrismaErrorOptions = {
  P2000?: string;
  P2001?: string;
  P2002?: string;
  P2003?: string;
  P2014?: string;
  P2025?: string;
};

export function mapPrismaError(
  error: unknown,
  options?: PrismaErrorOptions,
): { status: number; message: string } {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2000':
        return {
          status: HttpStatus.BAD_REQUEST,
          message:
            options?.P2000 || `Value too long for field: ${error.meta?.targe}`,
        };
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: options?.P2002 || `${error.meta?.target} already exists`,
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message:
            options?.P2003 ||
            `Invalid reference on field: ${error.meta?.field_name}`,
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message:
            options?.P2025 || `${error.meta?.modelName || 'Record'} not found`,
        };
      case 'P2001':
        return {
          status: HttpStatus.NOT_FOUND,
          message:
            options?.P2001 ||
            `${error.meta?.modelName || 'Record'} does not exist`,
        };
      case 'P2014':
        return {
          status: HttpStatus.BAD_REQUEST,
          message:
            options?.P2014 ||
            `Cannot delete ${error.meta?.modelName || 'record'} because other records depend on it`,
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Database error occurred (code: ${error.code})`,
        };
    }
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      status: HttpStatus.BAD_REQUEST,
      message: 'Invalid data provided to database operation',
    };
  }
  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
  };
}
