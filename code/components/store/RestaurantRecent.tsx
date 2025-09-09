import { View, Text, StyleSheet, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { Colors } from "@/constants/Colors";
import RestaurantRecentCard from "./RestaurantRecentCard";
import { useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { common } from "@/constants/Styles";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import httpClient from "@/lib/httpClient";
import Skeleton from "@/components/ui/Skeleton";

type RestaurantRecentProps = {
  refreshTrigger: number; // 👈 new prop to detect refresh from parent
};

export default function RestaurantRecent({
  refreshTrigger,
}: RestaurantRecentProps) {
  const { authState } = useAuth();
  const { locationState } = useLocation();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRecentRestaurants = async () => {
    try {
      if (
        locationState.latitude &&
        locationState.longitude &&
        authState.authenticated
      ) {
        setLoading(true);
        // simulate delay for skeleton visibility
        await new Promise((resolve) => setTimeout(resolve, 800));
        const response = await httpClient.get(
          `/restaurant/recentlyvisited?customerId=${authState.userId}&latitude=${locationState.latitude}&longitude=${locationState.longitude}`
        );
        setRestaurants(response.data);
      }
    } catch (error) {
      // handle error if needed
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (authState.authenticated) {
        loadRecentRestaurants();
      } else {
        setLoading(false);
        setRestaurants([]);
      }
    }, [
      locationState.latitude,
      locationState.longitude,
      authState.authenticated,
    ])
  );

  // Reload whenever parent triggers refresh
  useEffect(() => {
    if (authState.authenticated) {
      loadRecentRestaurants();
    } else {
      setLoading(false);
      setRestaurants([]);
    }
  }, [refreshTrigger]);

  // Don't render anything if user is not authenticated
  if (!authState.authenticated) {
    return null;
  }

  const renderSkeletons = () => (
    <FlatList
      horizontal
      data={[...Array(3)]}
      keyExtractor={(_, index) => `skeleton-${index}`}
      renderItem={({ index }) => (
        <View key={index} style={styles.skeletonCard}>
          <Skeleton height={120} width={200} borderRadius={12} />
          <Skeleton height={16} width={150} borderRadius={4} />
        </View>
      )}
      showsHorizontalScrollIndicator={false}
    />
  );

  return (
    <View>
      {loading || restaurants.length > 0 ? (
        <View style={styles.titleContainer}>
          <Ionicons name="star" size={24} color="#FFB300" />
          <Text style={common.title}>Your Recent Visits</Text>
        </View>
      ) : null}

      {loading ? (
        renderSkeletons()
      ) : restaurants.length > 0 ? (
        <FlatList
          data={restaurants}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <RestaurantRecentCard restaurant={item} key={index} />
          )}
          keyExtractor={(item, index) => String(index)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    marginVertical: 10,
    flexDirection: "row",
    gap: 5,
  },
  skeletonCard: {
    marginRight: 12,
  },
});
