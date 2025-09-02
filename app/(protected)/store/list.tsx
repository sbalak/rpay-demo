import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import httpClient from "@/lib/httpClient";
import { Colors } from "@/constants/Colors";
import RestaurantNearbyCard from "@/components/store/RestaurantNearbyCard";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useLocation } from "@/hooks/useLocation";
import { useAuth } from "@/hooks/useAuth";
import { common } from "@/constants/Styles";
import { FontAwesome, FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import ConfirmModal from "@/components/common/ConfirmModal";

export default function list() {
  const { filter } = useLocalSearchParams<{filter: string}>();
  const { locationState } = useLocation();
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [spread, setSpread] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerTitle: "Restaurants" });
  }, []);

  const loadRecentRestaurants = async (searchText: string, searchSpread: string) => {
    try {
      setIsLoading(true);
      const response = await httpClient.get(
        `/restaurant/list?latitude=${locationState.latitude}&longitude=${locationState.longitude}&page=${currentPage}&pageSize=10&query=${searchText}&spread=${searchSpread}`
      );
      if (response.data.length > 0) {
        setRestaurants((items) => items.concat(response.data));
        setCurrentPage(currentPage + 1);
      }
      setIsLoading(false);
    } catch (error) {
      error;
    }
  };

  const searchRecentRestaurants = async (searchText: string, searchSpread: string) => {
    try {
      setIsLoading(true);
      const response = await httpClient.get(
        `/restaurant/list?latitude=${locationState.latitude}&longitude=${locationState.longitude}&page=1&pageSize=10&query=${searchText}&spread=${searchSpread}`
      );
      setRestaurants(response.data);
      setCurrentPage(2);
      setIsLoading(false);
    } catch (error) {
      error;
    }
  };

  const onEndReached = async () => {
    if (!isLoading) {
      await loadRecentRestaurants(search, spread);
    }
  };

  const listFooterComponent = () => {
    return (
      <Text style={[common.text, styles.footer]}>You've reached the end</Text>
    );
  };

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  const handleAuthConfirm = () => {
    setShowAuthModal(false);
    router.push("/(auth)/login");
  };

  useEffect(() => {
    if (filter !== undefined) {
      setSpread(filter);
      loadRecentRestaurants(search, filter);
    }
    else {
      loadRecentRestaurants(search, '');
    }
  }, []);

  return (
    <View style={common.safeArea}>
      <FlatList
        data={restaurants}
        stickyHeaderIndices={[0]}
        renderItem={({ item, index }) => (
          <View style={common.container}>
            <RestaurantNearbyCard 
              restaurant={item} 
              key={index} 
              onAuthRequired={handleAuthRequired}
              isAuthenticated={authState.authenticated || false}
            />
          </View>
        )}
        keyExtractor={(item, index) => String(index)}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View>
            <View style={searchStyles.searchContainer}>
              <View style={searchStyles.searchTextInputContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  style={searchStyles.searchIcon}
                  color={Colors.Black}
                />
                <TextInput
                  style={searchStyles.searchTextInput}
                  placeholderTextColor={Colors.Black}
                  placeholder="Search"
                  value={search}
                  autoFocus={spread ? false : true}
                  onChangeText={(text: string) => {
                    setSearch(text);
                    searchRecentRestaurants(text, spread);
                  }}
                />
              </View>
            </View>


            <View style={[styles.titleContainer, {backgroundColor: Colors.LighterGrey}]}>
              <View style={{ flexDirection: "row", gap: 5 }}>
                <Ionicons name="location-sharp" size={24} color={Colors.Primary} />
                <Text style={common.title}>Nearby Hotspots</Text>
              </View>
              {
                spread ?
                <TouchableOpacity
                  style={{ flexDirection: "row" }}
                  onPress={() => { setSpread(''); searchRecentRestaurants(search, '') }}
                >
                  <MaterialCommunityIcons name="delete-forever" size={20} color={Colors.Primary} />
                  <Text style={styles.viewAll}>{spread}</Text>
                </TouchableOpacity> :
                ''
              }
              
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image source={{uri: `${process.env.EXPO_PUBLIC_STR_URL}/assets/not-found.png`}} style={{width: 100, height: 100}} />
            <Text style={common.title}>No Restaurants Found</Text>
            <Text style={[common.text, {width:300, textAlign: "center"}]}>Either we're not in your area yet, or all restaurants are currently closed</Text>
          </View>
        }
        ListFooterComponent={restaurants.length > 0 ? listFooterComponent : null}
      />

      <ConfirmModal
        isVisible={showAuthModal}
        title="Login Required"
        message="You need to login to access this feature. Would you like to login now?"
        confirmText="Login"
        cancelText="Cancel"
        onConfirm={handleAuthConfirm}
        onCancel={() => setShowAuthModal(false)}
      />
    </View>
  );
}

const searchStyles = StyleSheet.create({
  searchContainer: {
    backgroundColor: Colors.Secondary
  },
  searchTextInputContainer: {
    paddingHorizontal: 10,
    margin: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.Secondary,
    borderRadius: 10,
    backgroundColor: Colors.LighterGrey,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'nunito-medium',
    height: 40,
  },
  searchIcon: {
    marginRight: 10,
  },
});

const styles = StyleSheet.create({
  titleContainer: {
    backgroundColor: Colors.Secondary,
    padding: 10,
    marginBottom: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  viewAll: {
    fontFamily: common.defaultHeading,
    color: Colors.Primary,
  },
  footer: {
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
