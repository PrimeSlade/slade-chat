import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { CommonModule } from 'src/common/common.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [CommonModule, UsersModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
