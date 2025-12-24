import {
  Controller,
  Get,
  Body,
  Patch,
  Req,
  Post,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { UsersService } from './users.service';
import { ZodValidationPipe } from 'src/common/pipes/zod.validation.pipe';
import {
  updateUsernameSchema,
  UpdateUsernameDto,
  ResponseType,
  Friendship,
  FriendshipWithUsers,
} from '../shared';
import { User } from 'better-auth';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //Type Error
  @Get('me')
  getProfile(@Session() session: UserSession): ResponseType<User> {
    return { data: session.user, message: 'User fetched successfully' };
  }

  @Get('friends')
  async getFriends(
    @Session() session: UserSession,
  ): Promise<ResponseType<FriendshipWithUsers[]>> {
    const friends = await this.usersService.findFriends(session.user.id);

    return { data: friends, message: 'Friends fetched successfully' };
  }

  @Get('strangers')
  async getStrangers(
    @Session() session: UserSession,
  ): Promise<ResponseType<Friendship[]>> {
    const strangers = await this.usersService.findPendingStrangers(
      session.user.id,
    );

    return { data: strangers, message: 'Strangers fetched successfully' };
  }

  @Patch('me/username')
  async updateUsername(
    @Body(new ZodValidationPipe(updateUsernameSchema)) body: UpdateUsernameDto,
    @Session() session: UserSession,
  ): Promise<ResponseType<User>> {
    const user = await this.usersService.updateUsername(
      session.user.id,
      body.username,
    );
    return { data: user, message: 'Username updated successfully' };
  }

  // @Patch('me')
  // async softDeleteUSer(@Req() req): Promise<ResponseType<null>> {
  //   await this.usersService.softDeleteUser(req.user.id);

  //   return { message: 'User deleted successfully' };
  // }

  @Post('request-by-username')
  async addFriend(
    @Body() body: { username: string },
    @Session() session: UserSession,
  ): Promise<ResponseType<Friendship>> {
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
  ): Promise<ResponseType<Friendship>> {
    const user = await this.usersService.acceptUser(session.user.id, userId);

    return { data: user, message: 'User accepted successfully' };
  }

  @Delete('friends/:userId/decline')
  async declineFriend(
    @Param('userId') userId: string,
    @Session() session: UserSession,
  ): Promise<ResponseType<Friendship>> {
    const user = await this.usersService.declineUser(session.user.id, userId);

    return { data: user, message: 'User declined successfully' };
  }

  @Delete('friends/:userId/unfriend')
  async unfriend(
    @Param('userId') userId: string,
    @Session() session: UserSession,
  ): Promise<ResponseType<Friendship>> {
    const user = await this.usersService.unfriendUser(session.user.id, userId);

    return { data: user, message: 'User unfriended successfully' };
  }

  @Put(':userId/block')
  async blockUser(
    @Param('userId') userId: string,
    @Session() session: UserSession,
  ) {
    const user = await this.usersService.blockUser(session.user.id, userId);

    return { data: user, message: 'User blocked successfully' };
  }
}
