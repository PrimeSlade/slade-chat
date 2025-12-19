import { getFriends, getStrangers } from "@/lib/api/friends";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export const useFriends = () => {
  return useSuspenseQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });
};

export const useStrangers = () => {
  return useQuery({
    queryKey: ["strangers"],
    queryFn: getStrangers,
  });
};
