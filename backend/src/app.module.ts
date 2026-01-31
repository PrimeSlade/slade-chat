import { Module, OnModuleInit, Inject } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth';
import { ChatModule } from './chat/chat.module';
import { RoomsModule } from './rooms/rooms.module';
import { MessagesModule } from './messages/messages.module';
import { CacheModule, CACHE_MANAGER } from '@nestjs/cache-manager';
import KeyvRedis, { Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Cache } from 'cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule.forRoot({ auth }),
    EventEmitterModule.forRoot(),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = `redis://default:${configService.get('REDIS_PASSWORD')}@${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`;

        const redisStore = new KeyvRedis({
          url: redisUrl,
          socket: {
            reconnectStrategy: (retries) => {
              console.log(`Redis reconnect #${retries}`);
              return Math.min(retries * 500, 3000);
            },
          },
        });

        redisStore.on('error', (err) => {
          console.error('Redis connection error:', err);
        });

        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            redisStore,
          ],
        };
      },
      inject: [ConfigService],
    }),

    UsersModule,
    PrismaModule,
    ChatModule,
    RoomsModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async onModuleInit() {
    await this.cacheManager.clear();
    console.log('Cache cleared on module initialization');
  }
}
