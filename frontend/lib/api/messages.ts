import { axiosInstance } from "../axios";
import {
  ResponseFormat,
  Message,
  GetMessagesDto,
  CreateMessageDto,
  MessageWithSender,
} from "@backend/shared";

const createMessage = async ({
  roomId,
  content,
}: CreateMessageDto): Promise<ResponseFormat<Message> | undefined> => {
  try {
    const { data } = await axiosInstance.post<ResponseFormat<Message>>(
      `/messages/room/${roomId}`,
      { content }
    );
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
    throw new Error(error.response.data.message);
  }
};

export { createMessage, getMessages };
