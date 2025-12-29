import { io, Socket } from "socket.io-client";
import { env } from "./env";

export const socket: Socket = io(`${env.NEXT_PUBLIC_API_URL}/chat`, {
  autoConnect: false,
});
