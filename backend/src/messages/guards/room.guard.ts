import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RoomGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const userId = req.session?.user?.id;
    const roomId = req.params?.roomId;

    if (!userId || !roomId) {
      throw new ForbiddenException('Invalid access');
    }

    const room = await this.prismaService.roomParticipant.findFirst({
      where: {
        userId,
        roomId,
      },
    });

    if (!room) {
      throw new ForbiddenException('You are not a member of this room');
    }

    return true;
  }
}
