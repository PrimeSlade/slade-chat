import axios from "axios";
import { env } from "@/lib/env";

export const axiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});
