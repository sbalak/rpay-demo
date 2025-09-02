import axios from "axios";

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  console.log(
    "httpClient.web/processQueue(): Request failed with queue size:",
    failedQueue.length
  );
  failedQueue.forEach((prom) => {
    const url = prom.config?.url;
    console.log(`httpClient.web/processQueue(): URL: ${url}`);
    if (token) {
      console.log(
        "httpClient.web/processQueue(): Resolving request with new accessToken"
      );
      prom.config.headers["Authorization"] = `Bearer ${token}`;
      prom.resolve(axios(prom.config));
    } else {
      console.log(
        "httpClient.web/processQueue(): Rejecting request with error"
      );
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

httpClient.interceptors.request.use((config) => {
  console.log("httpClient.web/Request(): Calling: " + config.url);
  const token = localStorage.getItem("accessToken");
  if (token) {
    console.log("httpClient.web/Request(): Token found");

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
      "httpClient.web/Response(): Status Code: " + error.response?.status
    );
    console.log("httpClient.web/Response(): Detailed Error: " + error);

    const refreshToken = localStorage.getItem("refreshToken");
    const accessToken = localStorage.getItem("accessToken");

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const retryOriginalRequest = new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: { ...originalRequest } });
      });

      if (!refreshToken) {
        console.log(
          "httpClient.web/Response(): No refresh token found, logging out"
        );

        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          console.log("httpClient.web/try: Refreshing accessToken");

          const response = await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
            {
              refreshToken,
              accessToken,
            }
          );

          const newAccessToken = response.data.accessToken;
          const newRefreshToken = response.data.refreshToken;

          console.log("httpClient.web/try: New accessToken: " + newAccessToken);
          console.log(
            "httpClient.web/try: New refreshToken: " + newRefreshToken
          );

          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          httpClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;

          console.log(
            "httpClient.web/try: Set headers with new accessToken: " +
              newAccessToken
          );

          processQueue(null, newAccessToken);
        } catch (err) {
          console.log("httpClient.web/try: Error refreshing accessToken");
          console.log(
            "httpClient.web/try: Process queue with error: " +
              JSON.stringify(err)
          );
          processQueue(err, null);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userId");
          window.location.href = "/login";
          return Promise.reject(err);
        } finally {
          console.log("httpClient.web/finally: Set isRefreshing to false");
          isRefreshing = false;
        }
      }

      return retryOriginalRequest;
    }

    return Promise.reject(error);
  }
);

export default httpClient;
