import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import httpClient from "@/lib/httpClient";
import { log } from "@/utils/logger";

export function usePushToken(userId?: string) {
  useEffect(() => {
    if (!userId) return;
    
    async function registerForPushNotificationsAsync() {
      log.info("usePushToken.tsx/registerForPushNotificationsAsync(): Starting push notification registration");
      
      // Check if we're on a physical device
      if (!Device.isDevice) {
        log.warn('usePushToken.tsx/registerForPushNotificationsAsync(): ❌ Must use physical device for Push Notifications');
        return;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      log.debug("usePushToken.tsx/registerForPushNotificationsAsync(): Current permission status: " + existingStatus);
      
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        log.debug("usePushToken.tsx/registerForPushNotificationsAsync(): Requesting notification permissions");
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        log.debug("usePushToken.tsx/registerForPushNotificationsAsync(): Permission request result: " + status);
      }
      
      if (finalStatus !== 'granted') {
        log.error('usePushToken.tsx/registerForPushNotificationsAsync(): ❌ Failed to get push token permission!');
        return;
      }

      // Get the push token
      try {
        log.debug("usePushToken.tsx/registerForPushNotificationsAsync(): Getting Expo push token");
        const expoPushToken = await Notifications.getExpoPushTokenAsync({
          projectId: "c21ada22-70d8-4d69-ab5c-29bab66e48a6" // Your EAS project ID from app.json
        });
        
        const token = expoPushToken.data; 
        log.info("usePushToken.tsx/registerForPushNotificationsAsync(): ✅ Push Token: " + token);
        
        // Send token to backend
        try {
          if (token) {
            log.debug("usePushToken.tsx/registerForPushNotificationsAsync(): Sending token to backend");
            await httpClient.post(`/customer/settoken?customerId=${userId}&deviceToken=${token}`);
            log.info("usePushToken.tsx/registerForPushNotificationsAsync(): ✅ Token sent to backend successfully");
            
            // Store token locally for debugging
            try {
              await SecureStore.setItemAsync("deviceToken", String(token));
              log.debug("usePushToken.tsx/registerForPushNotificationsAsync(): ✅ Token stored locally successfully");
            } catch (storageErr) {
              log.error("usePushToken.tsx/registerForPushNotificationsAsync(): ❌ Failed to store token locally: " + storageErr);
            }
          }
        } 
        catch (err) {
          log.error("usePushToken.tsx/registerForPushNotificationsAsync(): ❌ Failed to send push token to backend: " + err);
        }
      } 
      catch (error) {
        log.error("usePushToken.tsx/registerForPushNotificationsAsync(): ❌ Error getting push token: " + error);
      }

      // Set up notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
        log.info("usePushToken.tsx/registerForPushNotificationsAsync(): ✅ Android notification channel created");
      }
    }

    registerForPushNotificationsAsync();
  }, [userId]);
} 