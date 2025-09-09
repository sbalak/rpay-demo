import { View, ScrollView, RefreshControl, Platform } from "react-native";
import React, { useState, useRef, useCallback } from "react";
import RestaurantNearby from "@/components/store/RestaurantNearby";
import RestaurantRecent from "@/components/store/RestaurantRecent";
import { common, size } from "@/constants/Styles";
import Spreads from "@/components/store/Spreads";
import RatingPrompt from "@/components/rating/RatingPrompt";
import CartBar from "@/components/cart/CartBar";
import { useCart } from "@/hooks/useCart";
import { useFocusEffect } from "expo-router";
import StoreHeader from "@/components/headers/StoreHeader";
import LocationCheck from "@/components/location/LocationCheck";
import { useAuth } from "@/hooks/useAuth";

export default function Store() {
  const { authState } = useAuth();
  const { cartValue, refreshCart } = useCart();

  const [cartLoading, setCartLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Track open state for both modals
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (authState.authenticated) {
        setCartLoading(true);
        refreshCart().finally(() => setCartLoading(false));
      }
    }, [authState.authenticated])
  );

  const locationCheckRef = useRef<{ open: () => void; close: () => void }>(
    null
  );

  const handlePullToRefresh = async () => {
    setRefreshing(true);
    try {
      if (authState.authenticated) {
        // refresh cart
        await refreshCart();
      }
      // trigger refresh on other components
      setRefreshTrigger((prev) => prev + 1);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={common.safeArea}>
      <StoreHeader LocationCheckRef={locationCheckRef} />
      <ScrollView
        style={common.container}
        refreshControl={
          Platform.OS !== "web" ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handlePullToRefresh}
              tintColor="gray"
              colors={["#014D4E"]}
            />
          ) : undefined
        }
      >
        <Spreads />
        <RestaurantRecent refreshTrigger={refreshTrigger} />
        <RestaurantNearby refreshTrigger={refreshTrigger} />
        {authState.authenticated && cartValue.quantity > 0 && (
          <View style={size.PB50} />
        )}
      </ScrollView>

      {authState.authenticated && (
        <RatingPrompt
          onOpen={() => setIsRatingModalOpen(true)}
          onClose={() => setIsRatingModalOpen(false)}
        />
      )}

      <LocationCheck
        ref={locationCheckRef}
        onOpen={() => setIsLocationModalOpen(true)}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {authState.authenticated &&
        !cartLoading &&
        !isLocationModalOpen &&
        !isRatingModalOpen && <CartBar quantity={cartValue.quantity} />}
    </View>
  );
}
