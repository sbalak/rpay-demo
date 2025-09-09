import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";
import SplashScreen from "@/components/splash/SplashScreen";

export default function Index() {
  const { authState } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (authState.authenticated !== null && !hasRedirected) {
      setHasRedirected(true); // prevent repeated redirects

      // Delay to let splash screen show up
      setTimeout(() => {
        router.replace(authState.authenticated ? "/store" : "/login");
      }, 1000); // 800ms gives time to show image
    }
  }, [authState.authenticated]);

  return <SplashScreen message={authState.authenticated ? "Logging you in..." : "Redirecting to login.."} />;
}
function setIsReady(arg0: boolean) {
  throw new Error("Function not implemented.");
}
