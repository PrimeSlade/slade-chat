import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MessageSenderGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const userId = req.session?.user?.id;
    const messageId = req.params?.messageId;

    if (!userId || !messageId) {
      throw new ForbiddenException('Invalid access');
    }

    // Check if the message exists
    const message = await this.prismaService.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if the user is the sender of the message
    if (message.senderId !== userId) {
      throw new ForbiddenException('You are not the sender of this message');
    }

    return true;
  }
}
