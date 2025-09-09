import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { loginUser, verifyUser } from "@/utils/authHelper";
import httpClient from "@/lib/httpClient.web";
import { getDeviceId } from "@/utils/getDeviceId";
import { log } from "@/utils/logger";

const initialState = {
  authState: { token: null, userId: null, authenticated: null },
  login: async () => {},
  verify: async () => {},
  logout: async () => {},
};

type AuthContextType = {
  authState: {
    token: string | null;
    userId: string | null;
    authenticated: boolean | null;
  };
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
  }>({ token: null, userId: null, authenticated: null });

  useEffect(() => {
    const loadAccessToken = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const userId = localStorage.getItem("userId");

      log.debug(
        "useAuth.web.tsx/useEffect(): Current AccessToken: " + accessToken
      );
      log.debug(
        "useAuth.web.tsx/useEffect(): Current RefreshToken: " + refreshToken
      );
      log.debug("useAuth.web.tsx/useEffect(): Current CustomerId: " + userId);

      if (accessToken) {
        httpClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;

        setAuthState({
          token: accessToken,
          userId: userId,
          authenticated: true,
        });

        log.info("useAuth.web.tsx/useEffect(): Authenticated");
      } else {
        setAuthState({
          token: null,
          userId: null,
          authenticated: false,
        });

        log.warn("useAuth.web.tsx/useEffect(): AccessToken Invalidated");
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
      const data = response;

      log.debug(
        "useAuth.web.tsx/verify(): Verify Response: " + JSON.stringify(data)
      );

      if (data.status === 401) {
        return data;
      }

      const decoded = jwtDecode(data.accessToken) as any;

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userId", String(decoded.Id));

      httpClient.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.accessToken}`;

      setAuthState({
        token: data.accessToken,
        userId: decoded.Id,
        authenticated: true,
      });

      return data;
    } 
    catch (error) {
      log.error(
        "useAuth.web.tsx/verify(): Verify Error: " +
          JSON.stringify((error as any).response?.data)
      );
      return { error: true, message: (error as any).response?.data };
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");

      setAuthState({
        token: null,
        userId: null,
        authenticated: false,
      });

      log.info("useAuth.web.tsx/logout(): Logout Successful");

      router.replace("/login");
    } 
    catch (error) {
      log.error(
        "useAuth.web.tsx/logout(): Logout Error: " +
          JSON.stringify((error as any).response?.data)
      );
      return { error: true, message: (error as any).response?.data };
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, verify, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
