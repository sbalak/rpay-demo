import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  useState,
  useEffect,
} from "react";
import * as IntentLauncher from "expo-intent-launcher";
import { AppState } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Linking,
  Platform,
} from "react-native";
import { useLocation } from "@/hooks/useLocation";
import * as Location from "expo-location";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { router, useFocusEffect } from "expo-router";
import httpClient from "@/lib/httpClient";
import { useAuth } from "@/hooks/useAuth";
import { button, common } from "@/constants/Styles";

type LocationCheckRef = { open: () => void; close: () => void };
type LocationCheckProps = { onClose?: () => void; onOpen?: () => void };

const LocationCheck = forwardRef<LocationCheckRef, LocationCheckProps>(
  ({ onClose, onOpen }, ref) => {
    const { setLocality, locationState } = useLocation();
    const { authState } = useAuth();
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] =
      useState<boolean>(false);
    const isCheckingRef = useRef(false);

    const fetchSavedAddresses = useCallback(async () => {
      if (!authState.authenticated || !authState.userId) {
        return;
      }

      try {
        setIsLoadingAddresses(true);
        console.log("fetching addresses");
        const response = await httpClient.get(
          `/Address/List?customerId=${authState.userId}`
        );

        // Assuming API returns an array of addresses
        setSavedAddresses(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching saved addresses:", error);
      } finally {
        setIsLoadingAddresses(false);
      }
    }, [authState.authenticated, authState.userId]);

    useEffect(() => {
      if (authState.authenticated) {
        fetchSavedAddresses();
      } else {
        setSavedAddresses([]);
      }
    }, [authState.authenticated, authState.userId, fetchSavedAddresses]);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const [locationPermission, setLocationPermission] = useState<
      "granted" | "denied" | "undetermined"
    >("undetermined");
    const [gpsEnabled, setGpsEnabled] = useState<boolean | null>(null);

    const checkLocationStatus = useCallback(async () => {
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status);
        const enabled = await Location.hasServicesEnabledAsync();
        setGpsEnabled(enabled);

        if (
          status === "granted" &&
          enabled &&
          (!locationState.latitude || !locationState.longitude)
        ) {
          setLocality();
        }
      } catch (error) {
        console.error("Error checking location status:", error);
      } finally {
        isCheckingRef.current = false;
      }
    }, [setLocality]);

    useEffect(() => {
      const subscription = AppState.addEventListener(
        "change",
        (nextAppState) => {
          if (nextAppState === "active") {
            console.log(
              "[LocationCheck] App resumed. Re-checking location status..."
            );
            checkLocationStatus();
          }
        }
      );

      return () => subscription.remove();
    }, [checkLocationStatus]);

    const handleContinuePress = async () => {
      if (Platform.OS === "web") {
        try {
          const position = await Location.getCurrentPositionAsync({});
          console.log("Web location:", position);
          setLocality({
            latitude: String(position.coords.latitude),
            longitude: String(position.coords.longitude),
            city: "Detected",
          });
        } catch (error) {
          console.error("Web location error:", error);
          alert("Please enable location permission in your browser.");
        }
        return;
      }

      // existing mobile logic
      if (locationPermission !== "granted") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status);

        if (status !== "granted") {
          await Linking.openSettings();
        }

        await checkLocationStatus();
      } else if (gpsEnabled === false) {
        if (Platform.OS === "android") {
          await IntentLauncher.startActivityAsync(
            IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS
          );
        } else {
          // await Linking.openURL("app-settings:");
          await Linking.openSettings();
        }
      }
    };

    useFocusEffect(
      useCallback(() => {
        checkLocationStatus();
      }, [checkLocationStatus])
    );

    const handleSheetChanges = useCallback((index: number) => {}, []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={1}
          opacity={0.1}
          animatedIndex={{ value: 1 }}
        />
      ),
      []
    );

    // expose open/close functions to parent
    useImperativeHandle(ref, () => ({
      open: () => {
        bottomSheetModalRef.current?.present();
        if (onOpen) onOpen();
      },
      close: () => {
        bottomSheetModalRef.current?.dismiss();
        if (onClose) onClose();
      },
    }));

    // In LocationCheck
    const openSearchSheet = (forSaving: boolean) => {
      router.push({
        pathname: "/address/search",
        params: { save: forSaving ? "true" : "false" },
      });
    };

    const renderStatusMessage = () => {
      if (locationPermission === "undetermined") {
        return (
          <>
            <Text style={styles.title}>Checking permissions...</Text>
            <Text style={styles.subtitle}>
              Please wait while we check your location settings
            </Text>
          </>
        );
      }

      if (locationPermission !== "granted") {
        return (
          <>
            <Text style={[common.title, { textAlign: "center" }]}>
              Location permission is off
            </Text>
            <Text style={styles.subtitle}>
              Please enable location permission for better experience
            </Text>
          </>
        );
      }

      if (gpsEnabled === false) {
        return (
          <>
            <Text style={[common.title, { textAlign: "center" }]}>
              Your device location is off
            </Text>
            <Text style={[common.text, { textAlign: "center" }]}>
              Please turn on GPS to select your current location
            </Text>
          </>
        );
      }

      return (
        <>
          <Text style={[common.title, { textAlign: "center" }]}>
            Location services are ready!
          </Text>
          <Text style={[common.text, { textAlign: "center" }]}>
            Current Location (Using GPS)
          </Text>
        </>
      );
    };

    return (
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          onChange={handleSheetChanges}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ display: "none" }}
          index={0}
          onDismiss={onClose}
        >
          <BottomSheetView style={styles.bottomSheet}>
            {/*<View style={styles.dragIndicator} />*/}
            <View style={styles.iconContainer}>
              <Ionicons
                name="location-sharp"
                size={48}
                color={Colors.Primary}
              />
            </View>

            {renderStatusMessage()}

            {(locationPermission !== "granted" || gpsEnabled === false) && (
              <TouchableOpacity
                style={button.container}
                onPress={handleContinuePress}
              >
                <MaterialIcons
                  name="location-off"
                  size={24}
                  color={Colors.Secondary}
                />
                <Text style={button.text}>Allow Location</Text>
              </TouchableOpacity>
            )}

            {locationPermission === "granted" && gpsEnabled && (
              <View style={styles.currentLocationContainer}>
                <TouchableOpacity
                  style={[styles.currentLocationRow]}
                  onPress={() => {
                    setLocality();
                    bottomSheetModalRef.current?.dismiss();
                  }}
                >
                  <MaterialIcons
                    name="my-location"
                    size={20}
                    color={Colors.Primary}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[common.subTitle, { color: Colors.Primary }]}>
                      Current Location
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.LightGrey}
                  />
                </TouchableOpacity>
              </View>
            )}

            {authState.authenticated === true && authState.userId && (
              <View style={{ flex: 1 }}>
                <View style={styles.addressHeader}>
                  <View style={{ flexDirection: "row" }}>
                    <MaterialIcons
                      name="history"
                      size={22}
                      color={Colors.Primary}
                    />
                    <Text
                      style={[
                        common.subTitle,
                        { paddingLeft: 10, color: Colors.Primary },
                      ]}
                    >
                      Past Searches
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{ flexDirection: "row" }}
                    onPress={() => router.push("/address")}
                  >
                    <Text style={styles.viewAll}>more</Text>
                    <Ionicons
                      name="arrow-forward-outline"
                      size={24}
                      color={Colors.Primary}
                    />
                  </TouchableOpacity>
                </View>

                {isLoadingAddresses ? (
                  <Text style={{ textAlign: "center", marginVertical: 8 }}>
                    Loading addresses...
                  </Text>
                ) : (
                  <FlatList
                    data={savedAddresses.slice(0, 3)}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={
                      <Text style={common.text}>
                        No addresses found. You can search for a new address
                        below.
                      </Text>
                    }
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.addressItem}
                        onPress={() => {
                          setLocality({
                            latitude: item.latitude,
                            longitude: item.longitude,
                            city: item.address,
                          });
                          bottomSheetModalRef.current?.dismiss();
                        }}
                      >
                        <Ionicons
                          name="location-outline"
                          size={20}
                          color={Colors.LightGrey}
                        />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          {/* <Text style={styles.addressLabel}>{item.label}</Text> */}
                          <Text style={common.text}>{item.address}</Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={Colors.LightGrey}
                        />
                      </TouchableOpacity>
                    )}
                    style={styles.addressList}
                  />
                )}
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={styles.addAddressRow}
                    onPress={() => openSearchSheet(true)}
                  >
                    <FontAwesome5
                      name="search-location"
                      size={22}
                      style={styles.addIcon}
                      color={Colors.Primary}
                    />
                    <Text style={[common.subTitle, { color: Colors.Primary }]}>
                      Search Address
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    );
  }
);

export default LocationCheck;

const styles = StyleSheet.create({
  bottomSheet: {
    paddingHorizontal: 10,
  },
  /*dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },*/
  iconContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: Colors.Primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 4,
  },
  addressHeaderText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  viewAll: {
    fontFamily: common.defaultHeading,
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
    fontSize: 15,
  },
  // searchBar: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   borderWidth: 1,
  //   borderColor: "#eee",
  //   borderRadius: 8,
  //   paddingHorizontal: 12,
  //   paddingVertical: 8,
  //   marginTop: 5,
  //   backgroundColor: "#f9f9f9",
  // },
  // searchPlaceholder: {
  //   color: "#999",
  //   fontSize: 16,
  //   flex: 1,
  // },
  addressList: {
    flexGrow: 0,
    maxHeight: 250, // Or whatever makes sense for your BottomSheet
    marginBottom: 8,
  },
  // searchBar: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   borderWidth: 1,
  //   borderColor: "#eee",
  //   borderRadius: 8,
  //   paddingHorizontal: 12,
  //   paddingVertical: 8,
  //   backgroundColor: "#f9f9f9",
  //   marginTop: 15,
  //   height: 40,
  // },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  addAddressButton: {
    backgroundColor: Colors.Primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonsContainer: {
    marginTop: 12,
  },

  addAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  addIcon: {
    marginRight: 10,
  },

  addAddressText: {
    fontSize: 16,
    color: Colors.Primary,
    fontWeight: "bold",
  },

  searchBar: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
  },

  searchPlaceholder: {
    color: "#888",
    fontSize: 16,
    flex: 1,
  },
  currentLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  currentLocationContainer: {
    marginTop: 12,
  },
});
