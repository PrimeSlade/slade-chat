import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
