import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "@/constants/Colors";
import {
  AntDesign,
  Entypo,
  Fontisto,
  Ionicons,
  MaterialCommunityIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { button, common, header, size } from "@/constants/Styles";
import httpClient from "@/lib/httpClient";
import { useRazorpay } from "@/hooks/useRazorpay";

export default function CartDetails() {
  const { authState } = useAuth();
  const [cart, setCart] = useState<any>([]);
  const [isRestaurantAvailable, setIsRestaurantAvailable] = useState<boolean>(true);
  const [isFoodItemAvailable, setIsFoodItemAvailable] = useState<boolean>(true);
  const [offer, setOffer] = useState<any>([]);
  const [loyalty, setLoyalty] = useState<any>([]);
  const [user, setUser] = useState<any>({});
  const { initiatePayment } = useRazorpay();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const load = async () => {
    try {
      const response = await httpClient.get(
        `/Cart/Details?customerId=${authState.userId}`
      );
      if (response.data.quantity > 0) {
        setCart(response.data);
      } else {
        router.back();
      }
    } catch (error) {}
  };

  const matchOffer = async (restaurantId: string) => {
    try {
      const response = await httpClient.get(
        `/Reward/Offer/Match?customerId=${authState.userId}&restaurantId=${restaurantId}`
      );
      setOffer(response.data);
    } catch (error) {}
  };

  const loadLoyalty = async (restaurantId: string) => {
    try {
      const response = await httpClient.get(
        `/Reward/Loyalty?customerId=${authState.userId}&restaurantId=${restaurantId}`
      );
      setLoyalty(response.data);
    } catch (error) {}
  };

  const redeemReward = async (rewardId: string, restaurantId: string) => {
    try {
      const response = await httpClient.get(
        `/Reward/Redeem?rewardId=${rewardId}&customerId=${authState.userId}&restaurantId=${restaurantId}`
      );
      load();
    } catch (error) {}
  };

  const forfeitReward = async (voucherId: string, restaurantId: string) => {
    try {
      const response = await httpClient.get(
        `/Reward/Voucher/Forfeit?voucherId=${voucherId}&customerId=${authState.userId}&restaurantId=${restaurantId}`
      );
      load();
    } catch (error) {}
  };

  const processCheckout = async () => {
    try {
      const restaurantAvailability = await httpClient.get(`/restaurant/availability?restaurantId=${cart.restaurantId}`);
      var foodItemAvailability = await httpClient.get(`/cart/fooditem/availability?customerId=${authState.userId}`);

      if (restaurantAvailability.data && foodItemAvailability.data) {
        handleCheckout();
      }
      else {
        setIsRestaurantAvailable(restaurantAvailability.data);
        setIsFoodItemAvailable(foodItemAvailability.data);
        load();
      }
    } 
    catch (error) {}
  };

  const handleCheckout = async () => {
    if (isCheckoutLoading) return;
    setIsCheckoutLoading(true);
    try {
      await initiatePayment({
        restaurantId: cart.restaurantId,
        customerId: Number(authState.userId),
        razorpayKey: `${process.env.EXPO_PUBLIC_RAZORPAY_KEY}`,
        prefill: {
          name:
            user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.phone,
          email: user.email,
          contact: user.phone,
        },
        // You can add more Razorpay options here if needed
      });
    } catch (error) {
      // Optionally handle error
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleAddItem = async (restaurantId: string, foodId: string) => {
    try {
      await httpClient.get(
        `/Cart/Add?customerId=${authState.userId}&restaurantId=${restaurantId}&foodId=${foodId}`
      );
      load();
    } catch (error) {}
  };

  const handleRemoveItem = async (restaurantId: string, foodId: string) => {
    try {
      await httpClient.get(
        `/Cart/Remove?customerId=${authState.userId}&restaurantId=${restaurantId}&foodId=${foodId}`
      );
      load();
    } catch (error) {}
  };

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [])
  );

  useEffect(() => {
    if (cart.preTaxAmount) {
      matchOffer(cart.restaurantId);
      loadLoyalty(cart.restaurantId);
    }
  }, [cart]);

  useEffect(() => {
    const loadUser = async () => {
      if (authState.userId) {
        try {
          const response = await httpClient.get(
            `/customer/details?customerId=${authState.userId}`
          );
          setUser(response.data);
        } catch (error) {}
      }
    };
    loadUser();
  }, [authState.userId]);

  return (
    <View>
      <View style={styles.title}>
        <Text style={common.title}>{cart.restaurantName}</Text>
        <Text style={common.text}>{cart.restaurantLocality}</Text>
      </View>
      <View style={[common.wrapper, size.MB10]}>
        <FlatList
          data={cart.cartItems}
          scrollEnabled={false}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 1,
                backgroundColor: Colors.LighterGrey,
                marginVertical: 10,
              }}
            />
          )}
          renderItem={({ item, index }) => (
            <View>
              <View style={common.row}>
                <Text style={common.defaultText}>{item.foodName}</Text>
                <Text style={common.text}>{item.amount}</Text>
              </View>
              <View style={common.row}>
                <Text style={[common.text, styles.itemPrice]}>
                  {item.price}
                </Text>
                <View style={cartStyles.cartButtonContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      handleRemoveItem(cart.restaurantId, item.foodItemId)
                    }
                  >
                    <Text>
                      <Ionicons
                        name="remove-circle"
                        size={24}
                        color={Colors.Primary}
                      />
                    </Text>
                  </TouchableOpacity>
                  <Text style={[common.defaultText, cartStyles.cartButtonText]}>
                    {item.quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleAddItem(cart.restaurantId, item.foodItemId)
                    }
                  >
                    <Text>
                      <Ionicons
                        name="add-circle"
                        size={24}
                        color={Colors.Primary}
                      />
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      </View>

      {offer.deduction || loyalty.deduction ? (
        <View
          style={{
            marginBottom: 10,
            padding: 10,
            backgroundColor: "#fff",
            borderRadius: 10,
          }}
        >
          {offer.deduction ? (
            <View style={common.row}>
              {offer.type == "discount" ? (
                <MaterialCommunityIcons
                  name="brightness-percent"
                  size={20}
                  color={Colors.Primary}
                />
              ) : (
                <Entypo name="price-tag" size={20} color={Colors.Primary} />
              )}
              <Text
                style={[
                  common.text,
                  { flex: 1, alignItems: "flex-start", paddingLeft: 10 },
                ]}
              >
                Save {offer.deduction} off with {offer.name}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  cart.rewardId === offer.id
                    ? forfeitReward(cart.voucherId, cart.restaurantId)
                    : redeemReward(offer.id, cart.restaurantId)
                }
              >
                <Text style={common.text}>
                  {cart.rewardId === offer.id ? (
                    <AntDesign name="close" size={20} color={Colors.Primary} />
                  ) : (
                    "Apply"
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            ""
          )}

          {offer.deduction && loyalty.deduction ? (
            <View
              style={{
                height: 1,
                backgroundColor: Colors.LighterGrey,
                marginVertical: 10,
              }}
            ></View>
          ) : (
            ""
          )}

          {loyalty.deduction ? (
            <View style={common.row}>
              <Fontisto name="wallet" size={20} color={Colors.Primary} />
              <Text
                style={[
                  common.text,
                  { flex: 1, alignItems: "flex-start", paddingLeft: 10 },
                ]}
              >
                You have earned {loyalty.deduction}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  cart.rewardId === loyalty.id
                    ? forfeitReward(cart.voucherId, cart.restaurantId)
                    : redeemReward(loyalty.id, cart.restaurantId)
                }
              >
                <Text style={common.text}>
                  {cart.rewardId === loyalty.id ? (
                    <AntDesign name="close" size={20} color="black" />
                  ) : (
                    "Apply"
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            ""
          )}
        </View>
      ) : (
        ""
      )}

      <View style={[common.wrapper, size.MB10]}>
        <View style={common.row}>
          <Text style={common.defaultText}>Sub Total</Text>
          <Text style={common.text}>{cart.preTaxAmount}</Text>
        </View>
      </View>
      {cart.voucher ? (
        <View style={[common.wrapper, size.MB10]}>
          <View style={[common.row, size.PB5]}>
            <Text style={common.defaultText}>Deduction</Text>
            <Text style={common.text}>{cart.deductionAmount}</Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={common.text}>{cart.voucher}</Text>
            <Ionicons
              onPress={() => forfeitReward(cart.voucherId, cart.restaurantId)}
              name="trash-outline"
              size={16}
              color={Colors.LightGrey}
            />
          </View>
        </View>
      ) : (
        ""
      )}

      <View style={[common.wrapper, size.MB10]}>
        <View style={[common.row, size.PB5]}>
          <Text style={common.defaultText}>Tax Amount</Text>
          <Text style={common.text}>{cart.taxAmount}</Text>
        </View>
        <View style={[common.row, size.PB5]}>
          <Text style={common.text}>CGST @ 2.5%</Text>
          <Text style={common.text}>{cart.primaryTaxAmount}</Text>
        </View>
        <View style={common.row}>
          <Text style={common.text}>SGST @ 2.5%</Text>
          <Text style={common.text}>{cart.secondaryTaxAmount}</Text>
        </View>
      </View>

      <View style={[common.wrapper, size.MB10]}>
        <View style={common.row}>
          <Text style={common.defaultText}>Grand Total</Text>
          <Text style={common.text}>{cart.dueAmount}</Text>
        </View>
      </View>

      <View style={styles.title}>
        <Text style={common.title}>Note</Text>
      </View>
      <View style={common.wrapper}>
        <Text style={common.defaultText}>
          Please review your cart carefully to avoid any cancellations
        </Text>
      </View>

      {/* Restaurant Closed Notification */}
      {!isRestaurantAvailable && (
        <View style={styles.closedNotification}>
          <View style={styles.closedContent}>
            <Ionicons name="warning" size={36} color={Colors.White} />
            <Text style={styles.closedText}>Restaurant is not accepting orders at the moment. Please check back later!</Text>
          </View>
        </View>
      )}

      {/* Unavailable Items Warning */}
      {!isFoodItemAvailable && (
        <View style={styles.unavailableWarning}>
          <View style={styles.unavailableContent}>
            <Ionicons name="alert-circle" size={36} color={Colors.White} />
            <Text style={styles.unavailableText}>Some items in your cart were unavailable and have been removed. Please review your cart before proceeding.</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[
          button.container,
          isCheckoutLoading && { opacity: 0.6 }, // dimmed look
        ]}
        onPress={processCheckout}
        disabled={isCheckoutLoading}
        activeOpacity={isCheckoutLoading ? 1 : 0.2} // 👈 no press effect if disabled
      >
        <SimpleLineIcons name="basket" size={24} color={Colors.Secondary} />
        <Text style={button.text}>
          {isCheckoutLoading ? "Processing..." : "Checkout"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginVertical: 10,
  },
  itemPrice: {
    marginTop: 7,
  },
  closedNotification: {
    backgroundColor: Colors.LightRed,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 20,
    borderRadius: 10,
  },
  closedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  closedText: {
    color: Colors.White,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'nunito-medium',
    flex: 1,
  },
  unavailableWarning: {
    backgroundColor: Colors.LightAmber,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 20,
    borderRadius: 10,
  },
  unavailableContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  unavailableText: {
    color: Colors.White,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'nunito-medium',
    flex: 1,
  },
});

const cartStyles = StyleSheet.create({
  cartButtonContainer: {
    flexDirection: "row",
    gap: 20,
    backgroundColor: Colors.Secondary,
    marginTop: 5,
    borderRadius: 15,
  },
  cartButtonText: {
    marginTop: 4,
  },
});
