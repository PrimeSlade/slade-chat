import { axiosInstance } from "../axios";
import {
  Friendship,
  FriendshipWithSenders,
  FriendshipWithUsers,
  ResponseFormat,
  UpdateUsernameDto,
  User,
  UserStatus,
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
  ResponseFormat<FriendshipWithSenders[]> | undefined
> => {
  try {
    const { data } = await axiosInstance.get<
      ResponseFormat<FriendshipWithSenders[]>
    >("/users/strangers");
    return data;
  } catch (error: any) {
    console.log(error);
    throw new Error("Error");
  }
};

const patchUserName = async (
  inputData: UpdateUsernameDto
): Promise<ResponseFormat<User> | undefined> => {
  try {
    const { data } = await axiosInstance.patch<ResponseFormat<User>>(
      "/users/me/username",
      inputData
    );

    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

const addFriend = async (inputData: {
  username: string;
}): Promise<ResponseFormat<Friendship> | undefined> => {
  try {
    const { data } = await axiosInstance.post<ResponseFormat<Friendship>>(
      "/users/request-by-username",
      inputData
    );

    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

const acceptFriend = async (inputData: {
  id: string;
}): Promise<ResponseFormat<Friendship> | undefined> => {
  try {
    const { data } = await axiosInstance.patch<ResponseFormat<Friendship>>(
      `/users/friends/${inputData.id}/accept`
    );

    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

const declineFriend = async (inputData: {
  id: string;
}): Promise<ResponseFormat<Friendship> | undefined> => {
  try {
    const { data } = await axiosInstance.patch<ResponseFormat<Friendship>>(
      `/users/friends/${inputData.id}/decline`
    );

    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

const unfriend = async (inputData: {
  id: string;
}): Promise<ResponseFormat<Friendship> | undefined> => {
  try {
    const { data } = await axiosInstance.patch<ResponseFormat<Friendship>>(
      `/users/friends/${inputData.id}/unfriend`
    );
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

const blockUser = async (inputData: {
  id: string;
}): Promise<ResponseFormat<Friendship> | undefined> => {
  try {
    const { data } = await axiosInstance.put<ResponseFormat<Friendship>>(
      `/users/${inputData.id}/block`
    );
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

const getUserById = async (
  userId: string
): Promise<ResponseFormat<User> | undefined> => {
  try {
    const { data } = await axiosInstance.get<ResponseFormat<User>>(
      `/users/${userId}`
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return undefined;
    }
    console.error(
      `Error fetching user ${userId}:`,
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || "An unknown error occurred"
    );
  }
};

const getUserLastSeen = async (
  userId: string
): Promise<ResponseFormat<string | null> | undefined> => {
  try {
    const { data } = await axiosInstance.get<ResponseFormat<string | null>>(
      `/users/${userId}/last-seen`
    );
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

const getFriendsStatus = async (): Promise<
  ResponseFormat<UserStatus[]> | undefined
> => {
  try {
    const { data } = await axiosInstance.get<ResponseFormat<UserStatus[]>>(
      "/users/status"
    );
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

export {
  getFriends,
  getStrangers,
  patchUserName,
  addFriend,
  acceptFriend,
  declineFriend,
  unfriend,
  blockUser,
  getUserById,
  getUserLastSeen,
  getFriendsStatus,
};
