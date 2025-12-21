import { ConflictException, Injectable } from '@nestjs/common';
import {
  Friendship,
  FriendshipWithReceivers,
  FriendshipWithUsers,
  User,
} from '../shared';
import { PrismaService } from 'src/prisma.service';
import { FriendStatus } from 'generated/prisma/enums';

@Injectable()
export class UsersRepository {
  constructor(private prismaService: PrismaService) {}

  async findUserByUserName(username: string, myId: string): Promise<User> {
    return this.prismaService.user.findFirstOrThrow({
      where: {
        username,
        id: { not: myId },
      },
    });
  }

  async updateUsername(userId: string, username: string): Promise<User> {
    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        username,
      },
    });
  }

  async findFriends(myId: string): Promise<FriendshipWithUsers[]> {
    return this.prismaService.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ senderId: myId }, { receiverId: myId }], //both sides
      },
      include: {
        sender: true,
        receiver: true,
      },
    });
  }

  async findPendingStrangers(myId: string): Promise<Friendship[]> {
    return this.prismaService.friendship.findMany({
      where: {
        receiverId: myId,
        status: 'PENDING',
      },
      include: {
        sender: true,
      },
    });
  }

  async addUser(receiverId: string, senderId: string): Promise<Friendship> {
    return this.prismaService.friendship.create({
      data: {
        senderId,
        receiverId,
      },
    });
  }

  async acceptUser(receiverId: string, senderId: string): Promise<Friendship> {
    return this.prismaService.friendship.update({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
      data: {
        status: 'ACCEPTED',
      },
    });
  }

  async blockUser(receiverId: string, senderId: string): Promise<Friendship> {
    return this.prismaService.friendship.update({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
      data: {
        status: 'BLOCKED',
      },
    });
  }

  async findStatus(myId: string, username: string): Promise<Friendship | null> {
    return this.prismaService.friendship.findFirst({
      where: {
        OR: [
          {
            senderId: myId,
            receiver: { username },
          },
          {
            receiverId: myId,
            sender: { username },
          },
        ],
      },
      include: {
        sender: true,
        receiver: true,
      },
    });
  }
}
