import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { loginUser, verifyUser } from "@/utils/authHelper";
import httpClient from "@/lib/httpClient";
import { usePushToken } from "./usePushToken";
import { log } from "@/utils/logger";


const initialState = {
  authState: { token: null, userId: null, authenticated: null },
  login: async () => {},
  verify: async () => {},
  logout: async () => {},
};

type AuthContextType = {
  authState: { token: string | null; userId: string | null; authenticated: boolean | null; };
  login: (username: string) => Promise<any>;
  verify: (username: string, code: string) => Promise<any>;
  logout: () => Promise<any>;
};

const AuthContext = createContext<AuthContextType>(initialState);

interface Props extends PropsWithChildren {}

const AuthProvider: React.FC<Props> = ({ children }) => {
  const [authState, setAuthState] = useState<{
    token: string | null;
    userId: string | null;
    authenticated: boolean | null;
  }>({
    token: null,
    userId: null,
    authenticated: null,
  });

  // Register push token after authentication
  usePushToken(
    authState.authenticated ? authState.userId ?? undefined : undefined
  );

  useEffect(() => {
    const loadAccessToken = async () => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      const userId = await SecureStore.getItemAsync("userId");

      log.debug("useAuth.tsx/useEffect(): Current AccessToken: " + accessToken);
      log.debug("useAuth.tsx/useEffect(): Current RefreshToken: " + refreshToken);
      log.debug("useAuth.tsx/useEffect(): Current CustomerId: " + userId);

      if (accessToken) {
        httpClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        setAuthState({
          token: accessToken,
          userId: userId,
          authenticated: true,
        });

        log.info("useAuth.tsx/useEffect(): Authenticated");
      }
      else {
        setAuthState({
          token: null,
          userId: null,
          authenticated: false,
        });

        log.warn("useAuth.tsx/useEffect(): AccessToken Invalidated");
      }
    };

    loadAccessToken();
  }, []);

  const login = async (username: string) => {
    const res = await loginUser(username);
    return res;
  };

  const verify = async (username: string, code: string) => {
    try {
      const response = await verifyUser(username, code);
      const data = await response;

      log.debug("useAuth.tsx/verify(): Verify Response: " + JSON.stringify(data));

      if (data.status === 401) {
        log.warn("useAuth.tsx/verify(): Verify Response Unauthorized: " + JSON.stringify(data));
        return data;
      }

      const decoded = jwtDecode(data.accessToken) as any;

      await SecureStore.setItemAsync("accessToken", data.accessToken);
      await SecureStore.setItemAsync("refreshToken", data.refreshToken);
      await SecureStore.setItemAsync("userId", String(decoded.Id));

      axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;

      setAuthState({
        token: data.accessToken,
        userId: decoded.Id,
        authenticated: true,
      });

      return data;
    }
    catch (error) {
      log.error("useAuth.tsx/verify(): Verify Error: " + JSON.stringify((error as any).response.data));

      return { error: true, message: (error as any).response.data };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
      await SecureStore.deleteItemAsync("userId");

      setAuthState({
        token: null,
        userId: null,
        authenticated: false,
      });

      log.info("useAuth.tsx/logout(): Logout Successful");

      router.replace("/login");
    }
    catch (error) {
      log.error("useAuth.tsx/logout(): Logout Error: " + JSON.stringify((error as any).response.data));

      return { error: true, message: (error as any).response.data };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        verify,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth can be accessible only within the AuthProvider");
  }

  return context;
};
