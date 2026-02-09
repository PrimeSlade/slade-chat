import { getInitials } from "./string";

type RoomLike = {
  type: "DIRECT" | "GROUP";
  name?: string | null;
  image?: string | null;
  participants: {
    user: {
      id: string;
      name?: string | null;
      image?: string | null;
    };
  }[];
};

export type { RoomLike };

export const getRoomDisplay = (room: RoomLike) => {
  if (!room) {
    return { displayName: "Unknown", avatarUrl: getInitials("Un") };
  }

  if (room.type === "DIRECT") {
    const otherParticipant = room.participants[0];
    return {
      displayUserId: otherParticipant.user.id,
      displayName: otherParticipant.user.name ?? "Unknown",
      avatarUrl:
        otherParticipant.user.image ??
        getInitials(otherParticipant.user.image ?? "A"),
    };
  }

  return {
    displayUserId: null,
    displayName: room.name ?? "Unnamed Room",
    avatarUrl: room.image ?? getInitials(room.name ?? "Ar"),
  };
};

type MessageData = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
};

export const updateRoomMessages = <T extends { roomId: string; room: any }>(
  oldData: { data: T[] },
  roomId: string,
  message: MessageData
) => {
  return {
    ...oldData,
    data: oldData.data.map((room) => {
      if (room.roomId === roomId) {
        return {
          ...room,
          room: {
            ...room.room,
            messages: [message],
          },
        };
      }
      return room;
    }),
  };
};
