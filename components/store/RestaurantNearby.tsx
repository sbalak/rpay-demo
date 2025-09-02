import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Colors } from "@/constants/Colors";
import RestaurantNearbyCard from "./RestaurantNearbyCard";
import httpClient from "@/lib/httpClient";
import { router, useFocusEffect } from "expo-router";
import { useLocation } from "@/hooks/useLocation";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { common } from "@/constants/Styles";
import Skeleton from "@/components/ui/Skeleton"; // 👈 import your Skeleton

type RestaurantNearbyProps = {
  refreshTrigger: number; // 👈 new prop to detect refresh from parent
};

export default function RestaurantNearby({
  refreshTrigger,
}: RestaurantNearbyProps) {
  const { locationState } = useLocation();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNearbyRestaurants = async () => {
    try {
      if (locationState.latitude && locationState.longitude) {
        setLoading(true); // start loading
        const response = await httpClient.get(
          `/restaurant/list?latitude=${locationState.latitude}&longitude=${locationState.longitude}`
        );
        setRestaurants(response.data);
      }
    } catch (error) {
      // optionally handle errors here
    } finally {
      setLoading(false); // end loading
    }
  };

  // Reload whenever parent triggers refresh
  useEffect(() => {
    loadNearbyRestaurants();
  }, [refreshTrigger]);

  useFocusEffect(
    React.useCallback(() => {
      loadNearbyRestaurants();
    }, [locationState.latitude, locationState.longitude])
  );

  // Skeleton placeholder rendering
  const renderSkeletons = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <View key={index} style={{ marginBottom: 16 }}>
        <Skeleton height={140} borderRadius={8} />
      </View>
    ));
  };

  return (
    <View>
      <View style={styles.titleContainer}>
        <View style={{ flexDirection: "row", gap: 5 }}>
          <Ionicons name="location-sharp" size={24} color={Colors.Primary} />
          <Text style={common.title}>Nearby Hotspots</Text>
        </View>
        <TouchableOpacity
          style={{ flexDirection: "row" }}
          onPress={() => router.navigate("/store/list")}
        >
          <Text style={styles.viewAll}>more</Text>
          <Ionicons
            name="arrow-forward-outline"
            size={24}
            color={Colors.Primary}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        renderSkeletons()
      ) : restaurants.length > 0 ? (
        <>
          <FlatList
            data={restaurants}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <RestaurantNearbyCard restaurant={item} key={index} />
            )}
            keyExtractor={(item, index) => String(index)}
          />
          <TouchableOpacity onPress={() => router.navigate("/store/list")}>
            <Text style={styles.footer}>view more</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Image
            source={{
              uri: `${process.env.EXPO_PUBLIC_STR_URL}/assets/not-found.png`,
            }}
            style={{ width: 100, height: 100 }}
          />
          <Text style={common.title}>No Restaurants Found</Text>
          <Text style={[common.text, { width: 300, textAlign: "center" }]}>
            Either we're not in your area yet, or all restaurants are currently
            closed
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    marginVertical: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  viewAll: {
    fontFamily: common.defaultHeading,
    color: Colors.Primary,
  },
  footer: {
    fontFamily: common.defaultHeading,
    color: Colors.Primary,
    textAlign: "center",
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
    paddingVertical: 40,
  },
});
