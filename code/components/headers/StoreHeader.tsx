import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import React, { useRef } from "react";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocation } from "@/hooks/useLocation";
import { useAuth } from "@/hooks/useAuth";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { common } from "@/constants/Styles";

type StoreHeaderProps = {
  LocationCheckRef: React.RefObject<{ open: () => void; close: () => void }>;
};

const StoreHeader = ({ LocationCheckRef }: StoreHeaderProps) => {
  const { locationState } = useLocation();
  const { authState } = useAuth();

  const handleProfilePress = () => {
    if (authState.authenticated) {
      router.navigate("/settings");
    } else {
      router.push("/(auth)/login");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => {}}>
        <Image
          style={styles.locator}
          source={{
            uri: `${process.env.EXPO_PUBLIC_STR_URL}/assets/location.png`,
          }}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.titleContainer}
        onPress={() => LocationCheckRef.current?.open()}
      >
        <Text
          style={{ fontFamily: common.defaultHeading, color: Colors.LightGrey }}
        >
          Pickup • Now
        </Text>
        <Text style={{ fontFamily: common.defaultHeading }}>
          {locationState.locality}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => router.navigate("/store/list")}
      >
        <Ionicons name="search" size={20} color={Colors.Primary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={handleProfilePress}
      >
        <Ionicons 
          name={authState.authenticated ? "person" : "log-in"} 
          size={20} 
          color={Colors.Primary} 
        />
      </TouchableOpacity>
    </View>
  );
};

export default StoreHeader;

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        shadowColor: Colors.LightGrey,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
      },
      android: {
        elevation: 5,
      },
    }),
    backgroundColor: Colors.White,
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locator: {
    width: 30,
    height: 30,
    marginTop: 7,
  },
  titleContainer: {
    flex: 1,
    paddingTop: 7,
  },
  searchButton: {
    backgroundColor: Colors.Secondary,
    padding: 10,
    marginTop: 7,
    borderRadius: 50,
  },
  profileButton: {
    backgroundColor: Colors.Secondary,
    padding: 10,
    marginTop: 7,
    borderRadius: 50,
  },
});
