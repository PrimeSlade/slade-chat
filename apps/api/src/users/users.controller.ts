import {
  Controller,
  Get,
  Body,
  Patch,
  Req,
  Post,
  Param,
  Put,
} from '@nestjs/common';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { UsersService } from './users.service';
import { ZodValidationPipe } from 'src/common/pipes/zod.validation.pipe';
import {
  updateUsernameSchema,
  UpdateUsernameDto,
  Friendship,
  FriendshipWithUsers,
  UserStatus,
} from '../shared';
import { User } from 'better-auth';
import { ControllerResponse } from 'src/common/types/responce.type';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //Type Error
  @Get('me')
  getProfile(@Session() session: UserSession): ControllerResponse<User> {
    return { data: session.user, message: 'User fetched successfully' };
  }

  @Get('friends')
  async getFriends(
    @Session() session: UserSession,
  ): Promise<ControllerResponse<FriendshipWithUsers[]>> {
    const friends = await this.usersService.findFriends(session.user.id);

    return { data: friends, message: 'Friends fetched successfully' };
  }

  @Get('strangers')
  async getStrangers(
    @Session() session: UserSession,
  ): Promise<ControllerResponse<Friendship[]>> {
    const strangers = await this.usersService.findPendingStrangers(
      session.user.id,
    );

    return { data: strangers, message: 'Strangers fetched successfully' };
  }

  @Get('status')
  async getFriendsStatus(
    @Session() session: UserSession,
  ): Promise<ControllerResponse<UserStatus[]>> {
    const statuses = await this.usersService.findUserStatus(session.user.id);

    return { data: statuses, message: 'Statuses fetched successfully' };
  }

  @Get(':userId')
  async getUserById(
    @Param('userId') userId: string,
  ): Promise<ControllerResponse<User>> {
    const user = await this.usersService.findUserById(userId);

    return { data: user, message: 'User fetched successfully' };
  }

  @Get(':userId/last-seen')
  async getLastSeen(
    @Param('userId') userId: string,
  ): Promise<ControllerResponse<string | null>> {
    const lastSeen = await this.usersService.findUserLastSeen(userId);

    return { data: lastSeen, message: 'User last seen fetched successfully' };
  }

  @Patch('me/username')
  async updateUsername(
    @Body(new ZodValidationPipe(updateUsernameSchema)) body: UpdateUsernameDto,
    @Session() session: UserSession,
  ): Promise<ControllerResponse<User>> {
    const user = await this.usersService.updateUsername(
      session.user.id,
      body.username,
    );
    return { data: user, message: 'Username updated successfully' };
  }

  // @Patch('me')
  // async softDeleteUSer(@Req() req): Promise<ControllerResponse<null>> {
  //   await this.usersService.softDeleteUser(req.user.id);

  //   return { message: 'User deleted successfully' };
  // }

  @Post('request-by-username')
  async addFriend(
    @Body() body: { username: string },
    @Session() session: UserSession,
  ): Promise<ControllerResponse<Friendship>> {
    const addedUser = await this.usersService.addUser(
      body.username,
      session.user.id,
    );

    return { data: addedUser, message: 'User added successfully' };
  }

  @Patch('friends/:userId/accept')
  async acceptFriend(
    @Param('userId') userId: string,
    @Session() session: UserSession,
  ): Promise<ControllerResponse<Friendship>> {
    const friendShip = await this.usersService.acceptUser(
      session.user.id,
      userId,
    );

    return { data: friendShip, message: 'User accepted successfully' };
  }

  @Patch('friends/:userId/decline')
  async declineFriend(
    @Param('userId') userId: string,
    @Session() session: UserSession,
  ): Promise<ControllerResponse<Friendship>> {
    const friendShip = await this.usersService.declineUser(
      session.user.id,
      userId,
    );

    return { data: friendShip, message: 'User declined successfully' };
  }

  @Patch('friends/:userId/unfriend')
  async unfriend(
    @Param('userId') userId: string,
    @Session() session: UserSession,
  ): Promise<ControllerResponse<Friendship>> {
    const friendShip = await this.usersService.unfriendUser(
      session.user.id,
      userId,
    );

    return { data: friendShip, message: 'User unfriended successfully' };
  }

  @Put(':userId/block')
  async blockUser(
    @Param('userId') userId: string,
    @Session() session: UserSession,
  ): Promise<ControllerResponse<Friendship>> {
    const friendShip = await this.usersService.blockUser(
      session.user.id,
      userId,
    );

    return { data: friendShip, message: 'User blocked successfully' };
  }

  @Patch(':userId/unblock')
  async unBlockUser(
    @Param('userId') userId: string,
    @Session() session: UserSession,
  ): Promise<ControllerResponse<Friendship>> {
    const friendShip = await this.usersService.unBlockUser(
      session.user.id,
      userId,
    );

    return { data: friendShip, message: 'User unblocked successfully' };
  }
}
