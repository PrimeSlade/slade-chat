import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  onModuleInit() {
    throw new Error('Method not implemented.');
  }
  async OnModuleInit() {
    await this.$connect();
  }
}
