import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { common } from "@/constants/Styles";
import { Rating } from "react-native-ratings";

export default function OrderCard({ order }: { order: any }) {
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={common.subTitle}>{order.restaurantName}</Text>
        <Text
          style={[
            common.text,
            {
              textTransform: "capitalize",
              marginRight: 1,
              color: Colors.White,
              paddingHorizontal: 5,
              paddingVertical: 2.5,
              borderRadius: 5,
              backgroundColor: Colors.Primary,
            },
          ]}
        >
          {order.status}
        </Text>
      </View>
      <Text style={common.text}>{order.restaurantLocality}</Text>
      <FlatList
        data={order.orderItems}
        style={{ paddingVertical: 10 }}
        scrollEnabled={false}
        renderItem={({ item, index }) => (
          <View style={{ flexDirection: "row" }}>
            <Image
              style={styles.foodType}
              source={{
                uri: `${process.env.EXPO_PUBLIC_STR_URL}/assets/veg.png`,
              }}
            />
            <Text style={common.text}>
              {item.foodName} (x{item.quantity})
            </Text>
          </View>
        )}
      />
      <View style={styles.amountRow}>
        <Text style={[common.text, { paddingTop: 2.5 }]}>
          {order.dueAmount}
        </Text>
        <TouchableOpacity
          onPress={() => router.navigate(`/order/${order.orderId}`)}
        >
          <Ionicons
            name="arrow-forward-circle"
            size={24}
            color={Colors.Primary}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.divider}></View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={common.text}>{order.dateCreated}</Text>
        {order.rating > 0 ? (
          <Rating
            readonly
            startingValue={order.rating}
            imageSize={19}
            style={{ alignSelf: "flex-end" }}
          />
        ) : order.status === "delivered" ? (
          <TouchableOpacity
            onPress={() => router.navigate(`/rating/${order.orderId}`)}
            style={{ flexDirection: "row" }}
          >
            <Text style={common.text}>Rate Order</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.White,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  foodType: {
    height: 20,
    width: 20,
    marginRight: 5,
  },
  amountRow: {
    display: "flex",
    gap: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  divider: {
    height: 1,
    marginVertical: 10,
    backgroundColor: Colors.LighterGrey,
  },
});
