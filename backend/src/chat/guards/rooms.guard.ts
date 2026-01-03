import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RoomGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const data = context.switchToWs().getData();

    const room = await this.prismaService.roomParticipant.findFirst({
      where: {
        userId: client.data.user.id,
        roomId: data.roomId,
      },
    });

    if (!room) {
      throw new WsException('You are not a member of this room');
    }

    return true;
  }
}
