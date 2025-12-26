import { getRoomByUserId, getRooms } from "@/lib/api/rooms";
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
