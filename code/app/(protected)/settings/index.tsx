import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { Colors } from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { common } from "@/constants/Styles";
import httpClient from "@/lib/httpClient";
import { getAppVersion } from "@/utils/appVersion";
import { log } from "@/utils/logger";

export default function index() {
  const { authState, logout } = useAuth();
  const navigation = useNavigation();
  const [user, setUser] = useState([]);

  useEffect(() => {
    navigation.setOptions({ headerTitle: "Settings" });
  }, []);

  const loadUser = async () => {
    try {
      const response = await httpClient.get(
        `/customer/details?customerId=${authState.userId}`
      );
      setUser(response.data);
    } 
    catch (error) {
      log.error("settings/index.tsx/loadUser(): Error loading user details: " + error);
    }
  };
  const handleLogout = async () => {
    try {
      await logout();
    } 
    catch (error) {
      log.error("settings/index.tsx/handleLogout(): Error during logout: " + error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadUser();
    }, [])
  );

  return (
    <View style={common.safeArea}>
      <ScrollView style={common.container}>
        <View style={styles.titleContainer}>
          <Text style={common.title}>Your Profile</Text>
        </View>
        <View style={profile.container}>
          <Ionicons name="person-circle" size={80} color={Colors.Primary} />
          <View style={profile.info}>
            <Text style={profile.title}>
              {!user.firstName || !user.lastName
                ? user.phone
                : user.firstName + " " + user.lastName}
            </Text>
          </View>
        </View>
        <View style={{ marginVertical: 10, backgroundColor: "#fff", borderRadius: 10 }}>
          <TouchableOpacity style={{ padding: 15, gap: 15, flexDirection: "row" }} onPress={() => router.navigate("/settings/profile")} >
            <Ionicons name="person-circle-outline" size={20} color={Colors.LightGrey} />
            <Text style={common.text}>Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.LightGrey} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <View style={[styles.divider, { marginHorizontal: 15}]}></View>
          <TouchableOpacity style={{ padding: 15, gap: 15, flexDirection: "row" }} onPress={() => router.replace("/order")} >
            <Ionicons name="briefcase-outline" size={20} color={Colors.LightGrey} />
            <Text style={common.text}>Orders</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.LightGrey} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <View style={[styles.divider, { marginHorizontal: 15}]}></View>
          <TouchableOpacity style={{ padding: 15, gap: 15, flexDirection: "row"}} onPress={() => router.replace("/address")} >
            <Ionicons name="location-outline" size={20} color={Colors.LightGrey} />
            <Text style={common.text}>Saved Addresses</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.LightGrey} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <View style={[styles.divider, { marginHorizontal: 15}]}></View>
          <TouchableOpacity style={{ padding: 15, gap: 15, flexDirection: "row" }} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.LightGrey} />
            <Text style={common.text}>Logout</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.LightGrey} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>
        
        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={common.text}>{getAppVersion()}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    display: "flex",
    flexDirection: "row",
    paddingVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.LighterGrey,
  },
  versionContainer: {
    padding: 10,
    alignItems: 'center',
  }
});

const profile = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    flexDirection: "row",
  },
  info: {
    marginTop: 27.5,
    marginLeft: 10,
  },
  title: {
    fontFamily: common.defaultHeading,
    fontSize: 18,
  },
});
