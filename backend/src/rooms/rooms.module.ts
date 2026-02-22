import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { RoomsReposiory } from './rooms.repository';
import { MessagesModule } from 'src/messages/messages.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [MessagesModule, UsersModule],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsReposiory],
  exports: [RoomsService],
})
export class RoomsModule {}
