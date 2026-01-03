import { axiosInstance } from "../axios";
import {
  ResponseFormat,
  GetMessagesDto,
  CreateMessageDto,
  MessageWithSender,
} from "@backend/shared";

const createMessage = async ({
  roomId,
  content,
}: CreateMessageDto): Promise<
  ResponseFormat<MessageWithSender> | undefined
> => {
  try {
    const { data } = await axiosInstance.post<
      ResponseFormat<MessageWithSender>
    >(`/messages/room/${roomId}`, { content });
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

const getMessages = async ({ roomId, ...params }: GetMessagesDto) => {
  try {
    const { data } = await axiosInstance.get(`/messages/room/${roomId}`, {
      params,
    });
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw error;
  }
};

export { createMessage, getMessages };
