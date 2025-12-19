import { axiosInstance } from "../axios";
import {
  Friendship,
  FriendshipWithUsers,
  ResponseFormat,
} from "@backend/shared";

const getFriends = async (): Promise<
  ResponseFormat<FriendshipWithUsers[]> | undefined
> => {
  try {
    const { data } = await axiosInstance.get<
      ResponseFormat<FriendshipWithUsers[]>
    >("/users/friends");
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

const getStrangers = async (): Promise<
  ResponseFormat<Friendship[]> | undefined
> => {
  try {
    const { data } = await axiosInstance.get<ResponseFormat<Friendship[]>>(
      "/users/strangers"
    );
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("Error");
  }
};

export { getFriends, getStrangers };
