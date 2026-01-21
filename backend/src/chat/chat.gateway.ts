import { Inject, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { Server, Socket } from 'socket.io';
import { RoomGuard } from './guards/rooms.guard';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { OnEvent } from '@nestjs/event-emitter';
import { MessageWithSender } from 'src/shared';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly baseUrl: string;

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.baseUrl = this.configService.get<string>('BASE_URL')!;
  }

  afterInit(server: Server) {
    server.use(async (socket: Socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      //auth
      try {
        const JWKS = createRemoteJWKSet(
          new URL(`${this.baseUrl}/api/auth/jwks`),
        );
        const { payload } = await jwtVerify(token, JWKS, {
          issuer: this.baseUrl,
          audience: this.baseUrl,
        });

        socket.data.user = payload;

        next();
      } catch (error) {
        // Invalid/Expired token: Immediately disconnect
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    const userId = client.data.user.id;

    //checking status
    const currentCount =
      (await this.cacheManager.get<number>(`user:${userId}:count`)) || 0;

    const newCount = currentCount + 1;

    // console.log('New count ', newCount);

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

    // console.log('New count ', newCount);

    await this.cacheManager.set(`user:${userId}:count`, newCount);

    if (newCount === 0) {
      await this.cacheManager.set(`user:${userId}:last_seen`, new Date());

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

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.broadcast.to(data.roomId).emit('user_typing', data);
  }

  @OnEvent('message.created')
  handleMessageCreatedEvent(roomId: string, payload: MessageWithSender) {
    this.server.to(roomId).emit('new_message', { data: payload });
  }
}
