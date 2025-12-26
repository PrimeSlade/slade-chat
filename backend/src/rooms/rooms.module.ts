import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { RoomsReposiory } from './rooms.repository';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService, RoomsReposiory],
})
export class RoomsModule {}
