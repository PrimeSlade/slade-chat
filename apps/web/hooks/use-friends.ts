import {
  getFriends,
  getStrangers,
  getUserById,
  getUserLastSeen,
  getFriendsStatus,
} from "@/lib/api/friends";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export const useFriends = () => {
  return useSuspenseQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });
};

export const useStrangers = () => {
  return useSuspenseQuery({
    queryKey: ["strangers"],
    queryFn: getStrangers,
  });
};

export const useUserById = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
};

export const useUserLastSeen = (userId: string) => {
  return useQuery({
    queryKey: ["user-last-seen", userId],
    queryFn: () => getUserLastSeen(userId),
    enabled: !!userId,
  });
};

export const useFriendsStatus = () => {
  return useSuspenseQuery({
    queryKey: ["friends-status"],
    queryFn: getFriendsStatus,
  });
};
