import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import httpClient from "@/lib/httpClient";

export function usePushToken(userId?: string) {
  useEffect(() => {
    if (!userId) return;
    
    async function registerForPushNotificationsAsync() {
      console.log("Starting push notification registration");
      
      // Check if we're on a physical device
      if (!Device.isDevice) {
        console.log('❌ Must use physical device for Push Notifications');
        return;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log("Current permission status:", existingStatus);
      
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        console.log("Requesting notification permissions");
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log("Permission request result:", status);
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Failed to get push token permission!');
        return;
      }

      // Get the push token
      try {
        console.log("Getting Expo push token");
        const expoPushToken = await Notifications.getExpoPushTokenAsync({
          projectId: "c21ada22-70d8-4d69-ab5c-29bab66e48a6" // Your EAS project ID from app.json
        });
        
        const token = expoPushToken.data; 
        console.log("✅ Push Token:", token);
        
        // Send token to backend
        try {
          if (token) {
            console.log("Sending token to backend");
            await httpClient.post(`/customer/settoken?customerId=${userId}&deviceToken=${token}`);
            console.log("✅ Token sent to backend successfully");
            
            // Store token locally for debugging
            try {
              await SecureStore.setItemAsync("deviceToken", String(token));
              console.log("✅ Token stored locally successfully");
            } catch (storageErr) {
              console.log("❌ Failed to store token locally:", storageErr);
            }
          }
        } catch (err) {
          console.log("❌ Failed to send push token to backend:", err);
        }
      } catch (error) {
        console.log("❌ Error getting push token:", error);
      }

      // Set up notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
        console.log("✅ Android notification channel created");
      }
    }

    registerForPushNotificationsAsync();
  }, [userId]);
} 