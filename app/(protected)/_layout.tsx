import React from "react";
import { Stack } from "expo-router";
import LocationProvider from "@/hooks/useLocation";

export default function _layout() {
  return (
    <LocationProvider>
      <Stack>
        <Stack.Screen name="cart" options={{ headerShown: false }} />
        <Stack.Screen name="order" options={{ headerShown: false }} />
        <Stack.Screen name="rating" options={{ headerShown: false }} />
        <Stack.Screen name="razorpay" options={{ headerShown: false, presentation: 'card', gestureEnabled: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="store" options={{ headerShown: false }} />
        <Stack.Screen name="address" options={{ headerShown: false }} />
      </Stack>
    </LocationProvider>
  );
}
