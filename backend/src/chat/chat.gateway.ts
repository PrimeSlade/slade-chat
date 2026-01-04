import { ForbiddenException, Inject, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { Server, Socket } from 'socket.io';
import { RoomGuard } from './guards/rooms.guard';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly baseUrl: string;

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.baseUrl = this.configService.get<string>('BASE_URL')!;
  }

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    const token = client.handshake.auth.token;

    if (!token) {
      client.disconnect();
      return;
    }

    //auth
    try {
      const JWKS = createRemoteJWKSet(new URL(`${this.baseUrl}/api/auth/jwks`));
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: this.baseUrl,
        audience: this.baseUrl,
      });

      client.data.user = payload;
    } catch (error) {
      // Invalid/Expired token: Immediately disconnect
      client.disconnect();
    }

    const userId = client.data.user.id;

    //checking status
    const currentCount =
      (await this.cacheManager.get<number>(`user:${userId}:count`)) || 0;

    const newCount = currentCount + 1;

    console.log('New count ', newCount);

    await this.cacheManager.set(`user:${userId}:count`, newCount);

    if (newCount === 1) {
      this.server.emit('user_status', {
        userId: userId,
        status: 'online',
      });
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const userId = client.data.user.id;

    const currentCount =
      (await this.cacheManager.get<number>(`user:${userId}:count`)) || 0;

    const newCount = Math.max(0, currentCount - 1);

    console.log('New count ', newCount);

    await this.cacheManager.set(`user:${userId}:count`, newCount);

    if (newCount === 0) {
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

      await this.cacheManager.set(
        `user:${userId}:last_seen`,
        new Date(),
        sevenDaysInMs,
      );

      this.server.emit('user_status', {
        userId: userId,
        status: 'offline',
      });
    }
  }

  @UseGuards(RoomGuard)
  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Client ${client.id} joining room: ${data.roomId}`);
    client.join(data.roomId);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Client ${client.id} leaving room: ${data.roomId}`);
    client.leave(data.roomId);
  }
}
