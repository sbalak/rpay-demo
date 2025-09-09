// components/SplashScreen.tsx
import { Colors } from "@/constants/Colors";
import React from "react";
import { View, Text, Image, StyleSheet, Platform } from "react-native";

const SplashScreen = ({ message }: { message: string }) => {
  return (
    <View style={styles.container}>
      {
        Platform.OS === "web" ?
        <Image
          source={require("../../assets/images/logo/logo_transparent.svg")}
          resizeMode="contain"
          style={styles.logo}
        /> :
        <Image 
          source={{
            uri: `${process.env.EXPO_PUBLIC_STR_URL}/brand/settl/logo_primary.png`,
          }}
          resizeMode="contain"
          style={styles.logo}
        />
      }
      
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Primary,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
  },
});
