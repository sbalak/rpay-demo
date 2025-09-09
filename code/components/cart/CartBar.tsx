import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { common } from "@/constants/Styles";

export default function CartBar({ quantity }: { quantity: number }) {
  const router = useRouter();

  if (!quantity || quantity <= 0) return null;

  return (
    <TouchableOpacity
      style={styles.cartBarContainer}
      onPress={() => router.navigate("/cart")}
      activeOpacity={0.9}
    >
      <Text style={[common.text, styles.cartBarText]}>
        {quantity} item{quantity > 1 ? "s" : ""} added
      </Text>
      <View style={styles.iconWrapper}>
        <Text style={[common.text, styles.viewCartText]}>View Cart</Text>
        <Ionicons
          name="arrow-forward-circle"
          size={26}
          color={Colors.Secondary}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cartBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.Primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    zIndex: 1000,
    elevation: 10, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  cartBarText: {
    color: Colors.Secondary,
  },
  viewCartText: {
    color: Colors.Secondary,
    marginRight: 6,
  },
  iconWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
});
