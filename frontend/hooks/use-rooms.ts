import {
  getRoomByUserId,
  getRooms,
  getMyRoomByRoomId,
  getInviteCandidates,
} from "@/lib/api/rooms";
import { useQuery } from "@tanstack/react-query";

export const useRooms = () => {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });
};

export const useRoomByUserId = (userId: string) => {
  return useQuery({
    queryKey: ["room", userId],
    queryFn: () => getRoomByUserId(userId),
    enabled: !!userId,
  });
};

export const useMyRoomByRoomId = (roomId: string) => {
  return useQuery({
    queryKey: ["room", "me", roomId],
    queryFn: () => getMyRoomByRoomId(roomId),
    enabled: !!roomId,
  });
};

export const useInviteCandidates = (roomId?: string) => {
  return useQuery({
    queryKey: ["room", roomId, "invite-candidates"],
    queryFn: () => getInviteCandidates(roomId!),
    enabled: !!roomId,
  });
};
