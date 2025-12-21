import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Friendship, FriendshipWithUsers, User } from '../shared';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  //Find by username
  async findUserByUserName(username: string, myId: string): Promise<User> {
    return this.usersRepository.findUserByUserName(username, myId);
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
  async findPendingStrangers(myId: string): Promise<Friendship[]> {
    return this.usersRepository.findPendingStrangers(myId);
  }

  //Add user via ids
  async addUser(
    senderId: string,
    username: string,
    myId: string,
  ): Promise<Friendship> {
    const receiver = await this.usersRepository.findUserByUserName(
      username,
      myId,
    );

    const friendship = await this.usersRepository.findStatus(myId, username);

    if (friendship) {
      if (friendship.status === 'ACCEPTED') {
        throw new ConflictException('User is already your friend');
      }

      if (friendship.status === 'PENDING') {
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

      if (friendship.status === 'BLOCKED') {
        throw new ForbiddenException('Unable to add user.');
      }
    }

    return this.usersRepository.addUser(receiver.id, senderId);
  }

  //Accept
  async acceptUser(receiverId: string, senderId: string): Promise<Friendship> {
    return this.usersRepository.acceptUser(receiverId, senderId);
  }

  //Block
  async blockUser(receiverId: string, senderId: string): Promise<Friendship> {
    return this.usersRepository.blockUser(receiverId, senderId);
  }
}
