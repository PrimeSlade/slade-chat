import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

jest.mock('@thallesp/nestjs-better-auth', () => ({
  Session: () => () => undefined,
  UserSession: class UserSession {},
}));

jest.mock('src/common/guards/http-room.guard', () => ({
  HttpRoomGuard: class HttpRoomGuard {
    canActivate() {
      return true;
    }
  },
}));

jest.mock('src/common/guards/message-sender.guard', () => ({
  MessageSenderGuard: class MessageSenderGuard {
    canActivate() {
      return true;
    }
  },
}));

describe('MessagesController', () => {
  let controller: MessagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        {
          provide: MessagesService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
