import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  Friendship,
  FriendshipWithSenders,
  FriendshipWithUsers,
  User,
  UserStatus,
} from '../shared';
import { UsersRepository } from './users.repository';
import { FriendStatus } from 'generated/prisma/enums';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { extractFriendIds } from 'src/common/helpers/friendship.helper';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findUserById(userId: string): Promise<User> {
    return this.usersRepository.findUserById(userId);
  }

  //Find by username
  async findUserByUserName(username: string): Promise<User> {
    return this.usersRepository.findUserByUserName(username);
  }

  async findUserStatus(myId: string): Promise<UserStatus[]> {
    const friends = await this.usersRepository.findFriends(myId);

    const friendIds = extractFriendIds(friends, myId);

    const countKeys = friendIds.map((id) => `user:${id}:count`);

    const counts = (await this.cacheManager.mget(countKeys)) as (
      | number
      | null
    )[];

    const statuses: UserStatus[] = friendIds.map((id, index) => {
      const count = counts[index] || 0;
      return {
        userId: id,
        status: count >= 1 ? 'online' : 'offline',
      };
    });

    return statuses;
  }

  async findUserLastSeen(userId: string): Promise<string | null> {
    const isActive =
      (await this.cacheManager.get<number>(`user:${userId}:count`)) || 0;

    if (isActive >= 1) {
      return null;
    }

    const lastSeen = await this.cacheManager.get<string>(
      `user:${userId}:last_seen`,
    );

    return lastSeen || null;
  }

  //Update name
  async updateUsername(userId: string, username: string): Promise<User> {
    return this.usersRepository.updateUsername(userId, username);
  }

  //Friends
  async findFriends(myId: string): Promise<FriendshipWithUsers[]> {
    return this.usersRepository.findFriends(myId);
  }

  //Pending
  async findPendingStrangers(myId: string): Promise<FriendshipWithSenders[]> {
    return this.usersRepository.findPendingStrangers(myId);
  }

  //Add user via ids
  async addUser(username: string, myId: string): Promise<Friendship> {
    const receiver = await this.usersRepository.findUserByUserName(username);

    if (receiver.id === myId) {
      throw new BadRequestException('You cannot add yourself');
    }

    const friendship = await this.usersRepository.findStatus(myId, receiver.id);

    if (friendship) {
      if (friendship.status === FriendStatus.ACCEPTED) {
        throw new ConflictException('User is already your friend');
      }

      if (friendship.status === FriendStatus.PENDING) {
        if (friendship.senderId === myId) {
          throw new ConflictException(
            'You have already sent a friend request to this user.',
          );
        } else {
          throw new ConflictException(
            'This user has already sent you a friend request.',
          );
        }
      }

      if (friendship.status === FriendStatus.BLOCKED) {
        throw new ForbiddenException('Unable to add user.');
      }

      return this.usersRepository.addUser(receiver.id, myId, friendship.id);
    }

    return this.usersRepository.addUser(receiver.id, myId, null);
  }

  //Accept
  async acceptUser(myId: string, senderId: string): Promise<Friendship> {
    return this.usersRepository.acceptUser(myId, senderId);
  }

  //Decline
  async declineUser(myId: string, senderId: string): Promise<Friendship> {
    return this.usersRepository.declineUser(myId, senderId);
  }

  //Unfriend
  async unfriendUser(myId: string, otherUserId: string) {
    const friendShip = await this.usersRepository.findStatus(myId, otherUserId);

    if (!friendShip || friendShip.status !== FriendStatus.ACCEPTED) {
      throw new ConflictException('You are not friends');
    }

    return this.usersRepository.unfriendUser(friendShip.id);
  }

  //Block
  async blockUser(myId: string, otherUserId: string): Promise<Friendship> {
    const friendShip = await this.usersRepository.findStatus(myId, otherUserId);

    if (myId === otherUserId) {
      throw new BadRequestException('You cannot block yourself');
    }

    if (friendShip?.status === FriendStatus.BLOCKED) {
      throw new ConflictException('User has been already blocked');
    }

    if (friendShip) {
      // Friendship exists → pass the id to the repo function
      return this.usersRepository.blockUser(myId, otherUserId, friendShip.id);
    }

    // No friendship → pass null or let repo handle creation
    return this.usersRepository.blockUser(myId, otherUserId, null);
  }

  //Unblock
  async unBlockUser(myId: string, otherUserId: string): Promise<Friendship> {
    const friendShip = await this.usersRepository.findStatus(myId, otherUserId);

    if (!friendShip || friendShip.status !== FriendStatus.BLOCKED) {
      throw new ConflictException('Friendship is not blocked.');
    } else if (friendShip.blockedBy !== myId) {
      throw new ForbiddenException(
        'You cannot unblock a friendship you did not block.',
      );
    }

    return this.usersRepository.unBlockUser(friendShip.id);
  }
}
