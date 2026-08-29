import { axiosInstance } from "../axios";
import {
  ResponseFormat,
  RoomParticipantWithRoom,
  RoomParticipantWithRoomByUserId,
  RoomParticipantWithRoomByRoomId,
  Room,
  RoomWithParticipantStatus,
  InviteCandidateUser,
  AddRoomMembersResult,
  AddRoomMembersDto,
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
    const { data } = await axiosInstance.get<
      ResponseFormat<RoomParticipantWithRoomByUserId>
    >(`/rooms/${userId}`);
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

const getMyRoomByRoomId = async (
  roomId: string
): Promise<ResponseFormat<RoomWithParticipantStatus> | undefined> => {
  try {
    const { data } = await axiosInstance.get<
      ResponseFormat<RoomWithParticipantStatus>
    >(`/rooms/me/${roomId}`);
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw error;
  }
};

const createDirectRoom = async (inputData: {
  content: string;
  otherId: string;
}): Promise<ResponseFormat<Room> | undefined> => {
  try {
    const { data } = await axiosInstance.post<ResponseFormat<Room>>(
      "/rooms/direct-room",
      inputData
    );
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

const createGroupRoom = async (inputData: {
  groupName: string;
  friendIds: string[];
}): Promise<ResponseFormat<Room> | undefined> => {
  try {
    const { data } = await axiosInstance.post<ResponseFormat<Room>>(
      "/rooms/group-room",
      inputData
    );
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

const getInviteCandidates = async (
  roomId: string
): Promise<ResponseFormat<InviteCandidateUser[]> | undefined> => {
  try {
    const { data } = await axiosInstance.get<ResponseFormat<InviteCandidateUser[]>>(
      `/rooms/${roomId}/invite-candidates`
    );
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

const addRoomMembers = async (inputData: {
  roomId: string;
  memberIds: AddRoomMembersDto["memberIds"];
}): Promise<ResponseFormat<AddRoomMembersResult> | undefined> => {
  try {
    const { data } = await axiosInstance.post<ResponseFormat<AddRoomMembersResult>>(
      `/rooms/${inputData.roomId}/members`,
      {
        memberIds: inputData.memberIds,
      }
    );
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

export {
  getRooms,
  getRoomByUserId,
  getMyRoomByRoomId,
  createDirectRoom,
  createGroupRoom,
  getInviteCandidates,
  addRoomMembers,
};
