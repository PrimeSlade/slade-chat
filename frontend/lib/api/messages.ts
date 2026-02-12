import { axiosInstance } from "../axios";
import {
  ResponseFormat,
  GetMessagesDto,
  CreateMessageDto,
  UpdateMessageDto,
  MessageWithSender,
  SoftDeleteMessageDto,
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

const updateMessage = async ({
  roomId,
  messageId,
  content,
}: UpdateMessageDto): Promise<
  ResponseFormat<MessageWithSender> | undefined
> => {
  try {
    const { data } = await axiosInstance.patch<
      ResponseFormat<MessageWithSender>
    >(`/messages/room/${roomId}/${messageId}`, { content });
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

const deleteMessage = async ({
  roomId,
  messageId,
}: SoftDeleteMessageDto): Promise<
  ResponseFormat<MessageWithSender> | undefined
> => {
  try {
    const { data } = await axiosInstance.patch<
      ResponseFormat<MessageWithSender>
    >(`/messages/room/${roomId}/${messageId}/delete`);
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    throw new Error(error.response.data.message);
  }
};

export { createMessage, getMessages, updateMessage, deleteMessage };
