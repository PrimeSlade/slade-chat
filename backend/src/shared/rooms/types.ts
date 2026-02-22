import { Prisma } from 'generated/prisma/client';

export type { Room } from 'generated/prisma/client';

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

export type RoomParticipantWithRoomByRoomId = Prisma.RoomParticipantGetPayload<{
  include: {
    room: {
      include: {
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
        _count: {
          select: {
            participants: true;
          };
        };
      };
    };
  };
}>;

type BaseParticipant =
  RoomParticipantWithRoomByRoomId['room']['participants'][number];

export type RoomWithParticipantStatus = Omit<
  RoomParticipantWithRoomByRoomId,
  'room'
> & {
  room: Omit<RoomParticipantWithRoomByRoomId['room'], 'participants'> & {
    participants: (Omit<BaseParticipant, 'user'> & {
      user: BaseParticipant['user'] & {
        status: 'online' | 'offline';
      };
    })[];
  };
};

export type RoomIdsByUserId = Prisma.RoomParticipantGetPayload<{
  select: {
    roomId: true;
  };
}>;

export type RoomParticipantsByRoomId = Prisma.RoomParticipantGetPayload<{
  select: {
    userId: true;
  };
}>;

//TODO:
export type InviteCandidateUser = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    image: true;
    username: true;
  };
}>;

export type AddRoomMembersResult = {
  addedIds: string[];
  alreadyMemberIds: string[];
};

export type { RoomParticipant } from 'generated/prisma/client';
