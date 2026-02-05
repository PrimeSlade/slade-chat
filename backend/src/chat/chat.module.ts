import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { CommonModule } from 'src/common/common.module';
import { UsersModule } from 'src/users/users.module';
import { RoomsModule } from 'src/rooms/rooms.module';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  imports: [CommonModule, UsersModule, RoomsModule, MessagesModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
