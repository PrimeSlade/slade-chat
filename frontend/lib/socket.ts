import { io, Socket } from "socket.io-client";
import { env } from "./env";
import { authClient } from "./auth-client";

const { data } = await authClient.token();

export const socket: Socket = io(`${env.NEXT_PUBLIC_API_URL}/chat`, {
  autoConnect: false,
  auth: {
    token: data?.token,
  },
});
