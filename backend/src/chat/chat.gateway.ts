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
import { WsRoomGuard } from '../common/guards/ws-rooms.guard';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { OnEvent } from '@nestjs/event-emitter';
import { MessageWithSender } from 'src/shared';
import { UsersService } from 'src/users/users.service';
import { extractFriendIds } from 'src/common/helpers/friendship.helper';
import { RoomsService } from 'src/rooms/rooms.service';
import { MessagesService } from 'src/messages/messages.service';

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
    private readonly usersService: UsersService,
    private readonly roomsService: RoomsService,
    private readonly messagesService: MessagesService,
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

    // Join a room with the user's ID for targeted notifications
    client.join(userId);

    //checking status
    const currentCount =
      (await this.cacheManager.get<number>(`user:${userId}:count`)) || 0;

    const newCount = currentCount + 1;

    // console.log('New count ', newCount);

    await this.cacheManager.set(`user:${userId}:count`, newCount);

    if (newCount === 1) {
      const [friends, roomIdsData] = await Promise.all([
        this.usersService.findFriends(userId),
        this.roomsService.getRoomIdsByUserId(userId),
      ]);

      const friendIds = extractFriendIds(friends, userId);
      const roomIds = roomIdsData.map((ids) => ids.roomId);

      this.server.to(friendIds).emit('user_status', {
        userId: userId,
        status: 'online',
      });

      if (roomIds.length > 0) {
        this.server.to(roomIds).emit('user_status_room_inc', {
          userId: userId,
          status: 'online',
        });
      }
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const userId = client.data.user.id;

    // Leave the user's room
    client.leave(userId);

    const currentCount =
      (await this.cacheManager.get<number>(`user:${userId}:count`)) || 0;

    const newCount = Math.max(0, currentCount - 1);

    // console.log('New count ', newCount);

    await this.cacheManager.set(`user:${userId}:count`, newCount);

    if (newCount === 0) {
      const [friends, roomIdsData] = await Promise.all([
        this.usersService.findFriends(userId),
        this.roomsService.getRoomIdsByUserId(userId),
      ]);

      const friendIds = extractFriendIds(friends, userId);
      const roomIds = roomIdsData.map((ids) => ids.roomId);

      await this.cacheManager.set(`user:${userId}:last_seen`, new Date());

      this.server.to(friendIds).emit('user_status', {
        userId: userId,
        status: 'offline',
      });

      if (roomIds.length > 0) {
        this.server.to(roomIds).emit('user_status_room_dec', {
          userId: userId,
          status: 'offline',
        });
      }
    }
  }

  @UseGuards(WsRoomGuard)
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

  @SubscribeMessage('user_typing')
  handleTyping(
    @MessageBody() data: { roomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.broadcast.to(data.roomId).emit('user_typing', data.userId);
  }

  @SubscribeMessage('mark_seen')
  async handleMarkSeen(
    @MessageBody() data: { roomId: string; messageId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.id;

    const message = await this.messagesService.getMessageByMessageId(
      data.messageId,
    );

    await this.roomsService.updateLastReadAt(
      userId,
      data.roomId,
      message!.createdAt,
    );

    client.broadcast.to(data.roomId).emit('user_read_update', {
      userId: userId,
      lastReadAt: message?.createdAt,
    });
  }

  @OnEvent('message_created')
  async handleMessageCreatedEvent(roomId: string, payload: MessageWithSender) {
    const data = await this.roomsService.getRoomParticipantsByRoomId(
      roomId,
      payload.senderId,
    );

    const memberids = data.map((user) => user.userId);

    this.server.to(memberids).emit('new_message', { data: payload });
  }

  @OnEvent('room_created')
  handleDriectRoomCreatedEvent(userId: string) {
    this.server.to(userId).emit('room_invalidate');
  }
}
