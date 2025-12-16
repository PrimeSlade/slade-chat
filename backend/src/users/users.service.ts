import { Injectable } from '@nestjs/common';
import { Friendship, User } from '../shared';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  //Find by username
  async findUserByUserName(username: string, myId: string): Promise<User> {
    const user = await this.prismaService.user.findFirstOrThrow({
      where: {
        username,
        id: { not: myId },
      },
    });
    return user;
  }

  //Update name
  async updateUsername(userId: string, username: string): Promise<User> {
    const user = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        username,
      },
    });

    return user;
  }

  //Friends
  async findFriends(myId: string): Promise<Friendship[]> {
    const friends = await this.prismaService.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ senderId: myId }, { receiverId: myId }], //both sides
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    return friends;
  }

  //Pending
  async findPendingStrangers(myId: string): Promise<Friendship[]> {
    const strangers = await this.prismaService.friendship.findMany({
      where: {
        receiverId: myId,
        status: 'PENDING',
      },
      include: {
        sender: true,
      },
    });

    return strangers;
  }

  //Add user via ids
  async addUser(receiverId: string, senderId: string): Promise<Friendship> {
    const user = await this.prismaService.friendship.create({
      data: {
        senderId,
        receiverId,
      },
    });

    return user;
  }

  //Accept
  async acceptUser(receiverId: string, senderId: string): Promise<Friendship> {
    const user = await this.prismaService.friendship.update({
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

    return user;
  }

  //Block
  async blockUser(receiverId: string, senderId: string): Promise<Friendship> {
    const user = await this.prismaService.friendship.update({
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

    return user;
  }

  // async softDeleteUser(id: number): Promise<undefined> {
  //   await this.prismaService.user.update({
  //     where: {
  //       id,
  //     },
  //     data: {
  //       deletedAt: new Date(),
  //     },
  //   });
  // }
}
