import React from "react";
import {
  View,
  StyleSheet,
  Alert,
  Text,
  SafeAreaView,
  Platform,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useLocalSearchParams, useRouter } from "expo-router";
import httpClient from "@/lib/httpClient";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { Colors } from "@/constants/Colors";
import { log } from "@/utils/logger";

export const options = {
  headerShown: false,
};

export default function AddressSearch() {
  const router = useRouter();
  const { setLocality } = useLocation();
  const userId = useAuth().authState.userId;
  const { save } = useLocalSearchParams();

  const saveToServer = async (address: {
    label: any;
    address: any;
    latitude: any;
    longitude: any;
    placeName: any;
  }) => {
    try {
      await httpClient.post(
        `/Address/Create?customerId=${userId}&name=${
          address.placeName
        }&address=${address.address}&latitude=${parseFloat(
          address.latitude
        )}&longitude=${parseFloat(address.longitude)}`
      );
    } 
    catch (error) {
      log.error("address/search.tsx/saveAddress(): Error saving address: " + error);
    }
  };

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder="Type your location here..."
        onPress={async (data, details = null) => {
          if (!details) {
            Alert.alert("Error", "No details found for this place.");
            return;
          }

          log.debug("address/search.tsx/fetchPlaceDetails(): Google Place Details: " + JSON.stringify(details));

          const latitude = String(details.geometry.location.lat);
          const longitude = String(details.geometry.location.lng);
          const cityComponent = details.address_components.find((comp: any) =>
            comp.types.includes("locality")
          );
          const city = cityComponent?.long_name || "Unknown";

          setLocality({
            latitude,
            longitude,
            city,
          });

          if (save === "true") {
            const selectedAddress = {
              latitude,
              longitude,
              city,
              address: details.formatted_address,
              placeName: details.formatted_address,
            };

            await saveToServer(selectedAddress);
          }

          router.replace("/store");
        }}
        fetchDetails
        onFail={(error) => {
          log.error("address/search.tsx/fetchPlaceDetails(): Places API Error: " + error);
          Alert.alert(
            "Error",
            "Failed to load places. Please check your internet connection."
          );
        }}
        query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
          language: "en",
          radius: 30000,
        }}
        requestUrl={{
          useOnPlatform: "web",
          url: `${process.env.EXPO_PUBLIC_API_URL}/Proxy`,
        }}
        styles={{
          container: styles.autocompleteContainer,
          textInput: styles.input,
          listView: styles.listView,
        }}
        enablePoweredByContainer={false}
        minLength={2}
        autoFillOnNotFound={false}
        listEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No results found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.Primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderBottomColor: "#ddd",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  autocompleteContainer: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  listView: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    padding: 4,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
  },
});
