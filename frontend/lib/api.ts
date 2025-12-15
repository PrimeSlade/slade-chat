import axios from "axios";
import { axiosInstance } from "./axios";

const getFriends = async () => {
  try {
    const data = await axiosInstance.get("/friends");
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
  }
};
