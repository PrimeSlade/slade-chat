import { axiosInstance } from "../axios";
import {
  ResponseFormat,
  RoomParticipantWithRoom,
  RoomParticipantWithRoomByUserId,
} from "@backend/shared";

const getRooms = async (): Promise<
  ResponseFormat<RoomParticipantWithRoom[]> | undefined
> => {
  try {
    const { data } = await axiosInstance.get<
      ResponseFormat<RoomParticipantWithRoom[]>
    >("/rooms/me");
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

const getRoomByUserId = async (
  userId: string
): Promise<ResponseFormat<RoomParticipantWithRoomByUserId> | undefined> => {
  try {
    console.log(userId);
    const { data } = await axiosInstance.get<
      ResponseFormat<RoomParticipantWithRoomByUserId>
    >(`/rooms/${userId}`);
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

export { getRooms, getRoomByUserId };
