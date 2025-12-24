import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Friendship,
  FriendshipWithSenders,
  FriendshipWithUsers,
  User,
} from '../shared';
import { UsersRepository } from './users.repository';
import { FriendStatus } from 'generated/prisma/enums';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  //Find by username
  async findUserByUserName(username: string, myId: string): Promise<User> {
    return this.usersRepository.findUserByUserName(username);
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
    }

    return this.usersRepository.addUser(receiver.id, myId);
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

    if (friendShip) {
      // Friendship exists → pass the id to the repo function
      return this.usersRepository.blockUser(myId, otherUserId, friendShip.id);
    }

    // No friendship → pass null or let repo handle creation
    return this.usersRepository.blockUser(myId, otherUserId, null);
  }
}
