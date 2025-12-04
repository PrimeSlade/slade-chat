import { Controller, Get, Body, Patch, Req } from '@nestjs/common';
import { ResponseType } from 'src/common/types/responce.type';
import { User } from './entities/user.entity';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';

@Controller('users')
export class UsersController {
  @Get('me')
  getProfile(@Session() session: UserSession) {
    return { data: session.user, message: 'User fetched successfully' };
  }

  // @Patch('me')
  // async softDeleteUSer(@Req() req): Promise<ResponseType<null>> {
  //   await this.usersService.softDeleteUser(req.user.id);

  //   return { message: 'User deleted successfully' };
  // }
}
