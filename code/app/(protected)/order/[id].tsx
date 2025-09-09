import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { Colors } from "@/constants/Colors";
import { common, header, size } from "@/constants/Styles";
import { Ionicons } from "@expo/vector-icons";
import httpClient from "@/lib/httpClient";
import Bill from "@/components/order/Bill";
import { log } from "@/utils/logger";

export const navigationOptions = {
  headerShown: false,
};

export default function OrderDetails() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerTitle: "Order Details" });
  }, []);

  const [order, setOrder] = useState<any>([]);

  const load = async () => {
    try {
      const response = await httpClient.get(`/order/details?id=${id}`);
      log.debug("order/[id].tsx/load(): Order details response: " + JSON.stringify(response.data));
      setOrder(response.data);
    } 
    catch (error) {
      log.error("order/[id].tsx/load(): Error loading order details: " + error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [])
  );

  return (
    <View style={common.safeArea}>
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          color={Colors.Primary}
          onPress={() => router.replace("/store")}
          style={styles.backIcon}
        />
        <Text style={[common.title, styles.title]}>Order Details</Text>
      </View>
      <ScrollView style={common.container}>
        <View style={[common.wrapper, size.MT10]}>
          <View style={styles.statusRow}>
            <Text style={[common.title, { textTransform: "capitalize" }]}>
              {order.status}
            </Text>
            <Bill order={order} />
          </View>
          {/* <Text style={common.text}>Your order has been delivered</Text> */}
        </View>

        <View style={[common.wrapper, size.MT10]}>
          <View style={styles.row}>
            <Text style={[common.defaultText, column.C1]}>Order ID</Text>
            <Text style={common.text}>{order.orderId}</Text>
          </View>
          <Text style={[common.title, size.MT10]}>{order.restaurantName}</Text>

          <View style={common.divider}></View>

          <View style={styles.row}>
            <Text style={[common.defaultText, column.C1A]}>Item</Text>
            <Text style={[common.defaultText, column.C1B]}>Qty.</Text>
            <Text style={[common.defaultText, column.C2]}>Price</Text>
          </View>

          <View style={common.divider}></View>

          <FlatList
            data={order.orderItems}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <View style={styles.row}>
                <Text style={[common.defaultText, column.C1A]}>
                  {item.foodName}
                </Text>
                <Text style={[common.text, column.C1B]}>x {item.quantity}</Text>
                <Text style={[common.text, column.C2]}>{item.amount}</Text>
              </View>
            )}
          />

          <View style={common.divider}></View>

          <View style={styles.row}>
            <Text style={[common.defaultText, column.C1]}>Sub Total</Text>
            <Text style={[common.text, column.C2]}>{order.preTaxAmount}</Text>
          </View>
          {order.deductionAmount !== '₹ 0.00' ? (
            <View style={styles.row}>
              <Text style={[common.defaultText, column.C1]}>Deduction</Text>
              <Text style={[common.text, column.C2]}>
                {order.deductionAmount}
              </Text>
            </View>
          ) : (
            ""
          )}

          <View style={common.divider}></View>

          <View style={styles.row}>
            <Text style={[common.defaultText, column.C1]}>Taxable Amount</Text>
            <Text style={[common.text, column.C2]}>{order.taxableAmount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[common.defaultText, column.C1]}>Tax Amount</Text>
            <Text style={[common.text, column.C2]}>{order.taxAmount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[common.text, column.C1]}>CGST @ 2.5%</Text>
            <Text style={[common.text, column.C2]}>
              {order.primaryTaxAmount}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[common.text, column.C1]}>SGST @ 2.5%</Text>
            <Text style={[common.text, column.C2]}>
              {order.secondaryTaxAmount}
            </Text>
          </View>
          <View style={common.divider}></View>
          <View style={styles.row}>
            <Text style={[common.defaultText, column.C1]}>Grand Total</Text>
            <Text style={[common.text, column.C2]}>{order.dueAmount}</Text>
          </View>
        </View>

        {order.paymentStatus === 'success' ? (
          <>
            <View style={header.container}>
              <View style={header.title}>
                <Text style={common.title}>Payment Details</Text>
              </View>
            </View>
            <View style={common.wrapper}>
              <View style={styles.row}>
                <Text style={[common.defaultText, column.C1A]}>Paid Via</Text>
                <Text style={common.text}>{order.paymentMethod}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[common.defaultText, column.C1A]}>Amount Paid</Text>
                <Text style={common.text}>{order.dueAmount}</Text>
              </View>
              {
                order.paymentRef ? (
                  <View style={styles.row}>
                    <Text style={[common.defaultText, column.C1A]}>Transaction ID</Text>
                    <Text style={common.text}>{order.paymentRef}</Text>
                  </View>
                ) : ''
              }          
              <View style={styles.row}>
                <Text style={[common.defaultText, column.C1A]}>Status</Text>
                <Text style={[common.defaultText, styles.success]}>{order.paymentStatus}</Text>
              </View>
            </View>
          </>
        ) : null }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingBottom: 5,
  },
  success: {
    color: Colors.White,
    paddingHorizontal: 5,
    paddingVertical: 2.5,
    borderRadius: 5,
    backgroundColor: "green",
  },
  header: {
    ...Platform.select({
      ios: {
        shadowColor: Colors.LightGrey,
        shadowOffset: {width: 1, height: 1},
        shadowOpacity: 0.2,
      },
      android: {
        elevation: 5,
      }
    }),
    backgroundColor: Colors.White,
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  backIcon: {
    paddingTop: 10,
    fontSize: 30
  },
  title: {
    paddingLeft:20,
    paddingTop: 10
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

const column = StyleSheet.create({
  C1: {
    width: 260,
  },
  C1A: {
    width: 190,
  },
  C1B: {
    width: 70,
  },
  C2: {
    width: 110,
  },
});
