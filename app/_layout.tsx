// app/_layout.tsx
import "react-native-get-random-values"; // must be first
import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AuthProvider from "@/hooks/useAuth";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Asset } from "expo-asset";
import { CartProvider } from "@/hooks/useCart";
import * as Notifications from "expo-notifications";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/Colors";
import { Platform } from "react-native";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://c953f01065cd2fa313bb8e3d0d9cf48b@o4509936632266752.ingest.us.sentry.io/4509948001386496',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  //sendDefaultPii: true,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Prevent native splash from auto-hiding until we're ready
SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function Layout() {
  const [fontsLoaded] = useFonts({
    "nunito-medium": require("../assets/fonts/NunitoSansMedium.ttf"),
    "nunito-bold": require("../assets/fonts/NunitoSansBold.ttf"),
    "outfit-bold": require("../assets/fonts/Outfit-Bold.ttf"),
    "outfit-medium": require("../assets/fonts/Outfit-Medium.ttf"),
  });

  const [assetsReady, setAssetsReady] = useState(false);

  useEffect(() => {
    async function prepareAssets() {
      try {
        // Preload splash image or other critical assets
        await Asset.loadAsync([
          require("@/assets/images/logo/logo_transparent.svg"),
        ]);
        setAssetsReady(true);
      } catch (e) {
        console.warn("Error loading assets", e);
        setAssetsReady(true); // Still continue if asset fails
      }
    }

    prepareAssets();
  }, []);

  useEffect(() => {
    async function hideSplashIfReady() {
      if (fontsLoaded && assetsReady) {
        await SplashScreen.hideAsync();
      }
    }

    hideSplashIfReady();
  }, [fontsLoaded, assetsReady]);

  if (!fontsLoaded || !assetsReady) return null;

  return (
    <SafeAreaProvider>
        <StatusBar 
          style="light"
          backgroundColor="#014D4E"
          animated={true}
          translucent={Platform.OS === 'android'}
        />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <CartProvider>
              <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Primary }}>
                <Slot />
              </SafeAreaView>
            </CartProvider>
          </AuthProvider>
        </GestureHandlerRootView>
    </SafeAreaProvider>
  );
});