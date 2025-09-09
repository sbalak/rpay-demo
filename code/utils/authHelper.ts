import httpClient from "@/lib/httpClient";
import { getDeviceId } from "./getDeviceId";


export const loginUser = async (username: string): Promise<any> => {
  try {
    const response = await httpClient.post("/auth/login", {
      username,
      deviceId: getDeviceId(),
    });
    return response.data;
  }
  catch (error: any) {
    console.error("loginUser(): Error", error.response?.data || error.message);

    return {
      error: true,
      message: error.response?.data || error.message,
    };
  }
};

// Verify API call
export const verifyUser = async (
  username: string,
  code: string
): Promise<any> => {
  try {
    const response = await httpClient.post("/auth/verify", {
      username,
      code,
      deviceId: getDeviceId(),
    });
    return response.data;
  }
  catch (error: any) {
    console.error("verifyUser(): Error", error.response?.data || error.message);

    return {
      error: true,
      message: error.response?.data || error.message,
    };
  }
};
