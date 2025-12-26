import { Prisma } from 'generated/prisma/client';

export type RoomParticipantWithRoom = Prisma.RoomParticipantGetPayload<{
  include: {
    room: {
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc';
          };
          take: 1;
        };
        participants: {
          include: {
            user: {
              select: {
                id: true;
                name: true;
                image: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export type RoomParticipantWithRoomByUserId = Prisma.RoomParticipantGetPayload<{
  include: {
    room: {
      include: {
        messages: {
          take: 1;
          orderBy: {
            createdAt: 'desc';
          };
        };
        participants: {
          include: {
            user: {
              select: {
                id: true;
                name: true;
                image: true;
              };
            };
          };
        };
      };
    };
  };
}>;
