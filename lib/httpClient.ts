import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  console.log(
    "httpClient/processQueue(): Request failed with queue size:",
    failedQueue.length
  );
  failedQueue.forEach((prom) => {
    const url = prom.config?.url;
    console.log(`httpClient/processQueue(): URL: ${url}`);
    if (token) {
      console.log(
        "httpClient/processQueue(): Resolving request with new accessToken"
      );
      prom.config.headers["Authorization"] = `Bearer ${token}`;
      prom.resolve(axios(prom.config));
    } else {
      console.log("httpClient/processQueue(): Rejecting request with error");
      prom.reject(error);
    }
  });

  failedQueue = [];
};

const httpClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use(async (config) => {
  console.log("httpClient/Request(): Calling: " + config.url);
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    console.log("httpClient/Request(): Token found");

    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log(
      "httpClient/Response(): Status Code: " + error.response?.status
    );
    console.log("httpClient/Response(): Detailed Error: " + error);

    const refreshToken = await SecureStore.getItemAsync("refreshToken");
    const accessToken = await SecureStore.getItemAsync("accessToken");

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const retryOriginalRequest = new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: { ...originalRequest } });
      });

      if (!refreshToken) {
        console.log(
          "httpClient/Response(): No refresh token found, logging out"
        );

        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("userId");
        router.replace("/login");
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          console.log("httpClient/try: Refreshing accessToken");

          const response = await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
            {
              refreshToken,
              accessToken,
            }
          );

          const newAccessToken = response.data.accessToken;
          const newRefreshToken = response.data.refreshToken;

          console.log("httpClient/try: New accessToken: " + newAccessToken);
          console.log("httpClient/try: New refreshToken: " + newRefreshToken);

          await SecureStore.setItemAsync("accessToken", newAccessToken);
          await SecureStore.setItemAsync("refreshToken", newRefreshToken);

          httpClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;

          console.log(
            "httpClient/try: Set headers with new accessToken: " +
              newAccessToken
          );

          processQueue(null, newAccessToken);
        } catch (err) {
          console.log("httpClient/try: Error refreshing accessToken");
          console.log(
            "httpClient/try: Process queue with error: " + JSON.stringify(err)
          );
          processQueue(err, null);
          await SecureStore.deleteItemAsync("accessToken");
          await SecureStore.deleteItemAsync("refreshToken");
          await SecureStore.deleteItemAsync("userId");
          router.replace("/login");
          return Promise.reject(err);
        } finally {
          console.log("httpClient/finally: Set isRefreshing to false");
          isRefreshing = false;
        }
      }

      return retryOriginalRequest;
    }

    return Promise.reject(error);
  }
);

export default httpClient;
