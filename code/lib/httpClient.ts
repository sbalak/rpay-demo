import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { log } from "@/utils/logger";

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  log.debug(
    "httpClient/processQueue(): Request failed with queue size:",
    failedQueue.length
  );
  failedQueue.forEach((prom) => {
    const url = prom.config?.url;
    log.debug(`httpClient/processQueue(): URL: ${url}`);
    if (token) {
      log.debug(
        "httpClient/processQueue(): Resolving request with new accessToken"
      );
      prom.config.headers["Authorization"] = `Bearer ${token}`;
      prom.resolve(axios(prom.config));
    } else {
      log.debug("httpClient/processQueue(): Rejecting request with error");
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
  log.debug("httpClient/Request(): Calling: " + config.url);
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    log.debug("httpClient/Request(): Token found");

    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    log.error("httpClient/Response(): Detailed Error: " + error);

    const refreshToken = await SecureStore.getItemAsync("refreshToken");
    const accessToken = await SecureStore.getItemAsync("accessToken");

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const retryOriginalRequest = new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: { ...originalRequest } });
      });

      if (!refreshToken) {
        log.warn(
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
          log.info("httpClient/try: Refreshing accessToken");

          const response = await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
            {
              refreshToken,
              accessToken,
            }
          );

          const newAccessToken = response.data.accessToken;
          const newRefreshToken = response.data.refreshToken;

          log.debug("httpClient/try: New accessToken: " + newAccessToken);
          log.debug("httpClient/try: New refreshToken: " + newRefreshToken);

          await SecureStore.setItemAsync("accessToken", newAccessToken);
          await SecureStore.setItemAsync("refreshToken", newRefreshToken);

          httpClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;

          log.debug(
            "httpClient/try: Set headers with new accessToken: " +
              newAccessToken
          );

          processQueue(null, newAccessToken);
        }
        catch (err) {
          log.error("httpClient/try: Error refreshing accessToken");
          log.error(
            "httpClient/try: Process queue with error: " + JSON.stringify(err)
          );
          processQueue(err, null);
          await SecureStore.deleteItemAsync("accessToken");
          await SecureStore.deleteItemAsync("refreshToken");
          await SecureStore.deleteItemAsync("userId");
          router.replace("/login");
          return Promise.reject(err);
        }
        finally {
          log.debug("httpClient/finally: Set isRefreshing to false");
          isRefreshing = false;
        }
      }

      return retryOriginalRequest;
    }

    return Promise.reject(error);
  }
);

export default httpClient;
