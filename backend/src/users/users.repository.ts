import { Injectable } from '@nestjs/common';
import {
  Friendship,
  FriendshipWithSenders,
  FriendshipWithUsers,
  User,
} from '../shared';
import { PrismaService } from 'src/prisma.service';
import { FriendStatus } from 'generated/prisma/enums';

@Injectable()
export class UsersRepository {
  constructor(private prismaService: PrismaService) {}

  async findUserByUserName(username: string): Promise<User> {
    return this.prismaService.user.findFirstOrThrow({
      where: {
        username,
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
        status: FriendStatus.ACCEPTED,
        OR: [{ senderId: myId }, { receiverId: myId }], //both sides
      },
      include: {
        sender: true,
        receiver: true,
      },
    });
  }

  async findPendingStrangers(myId: string): Promise<FriendshipWithSenders[]> {
    return this.prismaService.friendship.findMany({
      where: {
        receiverId: myId,
        status: FriendStatus.PENDING,
      },
      include: {
        sender: true,
      },
    });
  }

  async addUser(receiverId: string, myId: string): Promise<Friendship> {
    return this.prismaService.friendship.create({
      data: {
        senderId: myId,
        receiverId,
      },
    });
  }

  async acceptUser(myId: string, senderId: string): Promise<Friendship> {
    return this.prismaService.friendship.update({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId: myId,
        },
      },
      data: {
        status: FriendStatus.ACCEPTED,
      },
    });
  }

  async declineUser(myId: string, senderId: string): Promise<Friendship> {
    return this.prismaService.friendship.delete({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId: myId,
        },
        status: FriendStatus.PENDING,
      },
    });
  }

  async unfriendUser(friendShipId: string): Promise<Friendship> {
    return this.prismaService.friendship.delete({
      where: {
        id: friendShipId,
      },
    });
  }

  async blockUser(
    myId: string,
    otherUserId: string,
    friendShipId: string | null,
  ): Promise<Friendship> {
    if (friendShipId) {
      return this.prismaService.friendship.update({
        where: {
          id: friendShipId,
        },
        data: {
          status: FriendStatus.BLOCKED,
          blockedBy: myId,
        },
      });
    }

    return this.prismaService.friendship.create({
      data: {
        senderId: myId,
        receiverId: otherUserId,
        status: FriendStatus.BLOCKED,
        blockedBy: myId,
      },
    });
  }

  async findStatus(
    myId: string,
    otherUserId: string,
  ): Promise<Friendship | null> {
    return this.prismaService.friendship.findFirst({
      where: {
        OR: [
          {
            senderId: myId,
            receiverId: otherUserId,
          },
          {
            receiverId: myId,
            senderId: otherUserId,
          },
        ],
      },
    });
  }
}
