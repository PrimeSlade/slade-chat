import { Module } from '@nestjs/common';
import { HttpRoomGuard } from './guards/http-room.guard';
import { WsRoomGuard } from './guards/ws-rooms.guard';

@Module({
  providers: [HttpRoomGuard, WsRoomGuard],
  exports: [HttpRoomGuard, WsRoomGuard],
})
export class CommonModule {}
