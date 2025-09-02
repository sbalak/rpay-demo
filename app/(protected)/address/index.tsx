import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import httpClient from "@/lib/httpClient";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { button, common } from "@/constants/Styles";

export default function AddressListScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const { setLocality } = useLocation();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleDeleteAddress = async (addressId: number) => {
    try {
      await httpClient.post(`/Address/Delete?addressId=${addressId}`);
      fetchAddresses();
    } catch (error) {
      console.error("Failed to delete address", error);
      alert("Failed to delete address. Please try again.");
    }
  };

  const fetchAddresses = useCallback(async () => {
    if (!authState.authenticated) return;
    try {
      setLoading(true);
      const res = await httpClient.get(
        `/Address/List?customerId=${authState.userId}`
      );
      setAddresses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    } finally {
      setLoading(false);
    }
  }, [authState.userId]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAddresses().finally(() => setRefreshing(false));
  }, [fetchAddresses]);

  const handleAddressSelect = (item: any) => {
    setLocality({
      latitude: item.latitude,
      longitude: item.longitude,
      city: item.address,
    });
    router.replace("/store");
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.addressItem}>
      <TouchableOpacity
        style={styles.addressContent}
        onPress={() => handleAddressSelect(item)}
      >
        <Ionicons name="location-outline" size={20} color={Colors.LightGrey} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={common.text}>{item.address}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleDeleteAddress(item.id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={20} color="#E74C3C" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.Primary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={
            addresses.length ? undefined : styles.emptyContainer
          }
          ListEmptyComponent={
            <Text style={[common.text, {textAlign: 'center'}]}>
              No addresses found. Tap below to continue with your search...
            </Text>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <TouchableOpacity
        style={button.container}
        onPress={() => router.push("/address/search?save=true")}
      >
        <FontAwesome5 name="search-location" size={24} color={Colors.Secondary} />
        <Text style={button.text}>Search Address</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: Colors.Primary,
  },
  addressItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  addressLabel: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.Primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 20,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addressContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
});
