import { getRoomByUserId, getRooms, getMyRoomByRoomId } from "@/lib/api/rooms";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export const useRooms = () => {
  return useSuspenseQuery({
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
