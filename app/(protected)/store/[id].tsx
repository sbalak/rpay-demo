import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  SectionList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  router,
} from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import httpClient from "@/lib/httpClient";
import CartBar from "@/components/cart/CartBar";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useCart } from "@/hooks/useCart";
import { Colors } from "@/constants/Colors";
import { common } from "@/constants/Styles";

const { width } = Dimensions.get("window");
const ITEM_MIN_WIDTH = 160;
const ITEM_GAP = 12;
const NUM_COLUMNS = Math.floor(width / (ITEM_MIN_WIDTH + ITEM_GAP));
const CARD_WIDTH = (width - ITEM_GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;
const IMAGE_HEIGHT = CARD_WIDTH;

export default function StoreDetails() {
  const { authState } = useAuth();
  const { locationState } = useLocation();
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();

  const [restaurant, setRestaurant] = useState<any>({});
  const [restaurantMenu, setRestaurantMenu] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRestaurantSwitchModal, setShowRestaurantSwitchModal] =
    useState(false);
  const [pendingAddItem, setPendingAddItem] = useState<{
    restaurantId: string;
    foodId: string;
  } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { cartValue, refreshCart } = useCart();

  const loadRestaurantDetails = async () => {
    try {
      const response = await httpClient.get(
        `/restaurant/details?restaurantId=${id}&latitude=${locationState.latitude}&longitude=${locationState.longitude}`
      );
      setRestaurant(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadRestaurantMenu = async (searchText: string) => {
    try {
      const endpoint =
        `/restaurant/fooditems?customerId=${authState.authenticated ? authState.userId : ''}&restaurantId=${id}` +
        (searchText ? `&searchText=${searchText}` : "");
      const response = await httpClient.get(endpoint);
      // Transform the response for section-level grid rendering
      const transformedData = response.data.map((section: any) => ({
        title: section.title,
        data: [{}], // Dummy item to trigger section rendering
        originalData: section.data, // Actual grid items to be rendered by FlatList
      }));

      setRestaurantMenu(transformedData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddItem = async (restaurantId: string, foodId: string) => {
    if (!authState.authenticated) {
      setShowAuthModal(true);
      return;
    }

    try {
      await httpClient.get(
        `/Cart/Add?customerId=${authState.userId}&restaurantId=${restaurantId}&foodId=${foodId}`
      );
      loadRestaurantDetails();
      loadRestaurantMenu("");
      refreshCart();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveItem = async (restaurantId: string, foodId: string) => {
    if (!authState.authenticated) {
      setShowAuthModal(true);
      return;
    }

    try {
      await httpClient.get(
        `/Cart/Remove?customerId=${authState.userId}&restaurantId=${restaurantId}&foodId=${foodId}`
      );
      loadRestaurantDetails();
      loadRestaurantMenu("");
      refreshCart();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCartReplaceAndAddItem = async () => {
    if (!pendingAddItem) return;
    try {
      await httpClient.get(`/Cart/Clear?customerId=${authState.userId}`);
      await handleAddItem(pendingAddItem.restaurantId, pendingAddItem.foodId);
      setPendingAddItem(null);
      setShowRestaurantSwitchModal(false);
    } catch (error) {
      console.error("Error replacing cart", error);
    }
  };

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  const handleAuthConfirm = () => {
    setShowAuthModal(false);
    router.push("/(auth)/login");
  };

  useEffect(() => {
    navigation.setOptions({ headerTitle: restaurant.name });
  }, [restaurant.name]);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      loadRestaurantDetails();
      loadRestaurantMenu("");
      if (authState.authenticated) {
        refreshCart();
      }
    }, [authState.authenticated])
  );

  const renderSectionGrid = ({ section }: { section: any }) => {
    // console.log("Rendering section:", section);

    return (
      <FlatList
        data={section.originalData}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={NUM_COLUMNS}
        scrollEnabled={false} // Prevent nested scrolling issues
        renderItem={({ item, index }: { item: any; index: number }) => renderItem({ item, index })}
      />
    );
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const columnIndex = index % NUM_COLUMNS;

    return (
      <View
        style={[
          styles.card,
          {
            width: CARD_WIDTH,
            marginLeft: columnIndex === 0 ? ITEM_GAP : ITEM_GAP / 2,
            marginRight:
              columnIndex === NUM_COLUMNS - 1 ? ITEM_GAP : ITEM_GAP / 2,
          },
        ]}
      >
        <Image
          source={{
            uri: item.photo
              ? `${process.env.EXPO_PUBLIC_CDN_URL}${item.photo}`
              : `${process.env.EXPO_PUBLIC_STR_URL}/assets/placeholder.png`,
          }}
          style={[styles.image, { height: IMAGE_HEIGHT, opacity: restaurant.isAvailable ? 1 : 0.2 }]}
        />
        <Text style={[common.subTitle, styles.name]}>
          <Image
            style={{ height: 14, width: 14 }}
            source={{
              uri: `${process.env.EXPO_PUBLIC_STR_URL}/assets/${item.type}.png`,
            }}
          />{" "}
          {item.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={common.text}>₹{item.price}</Text>
          {authState.authenticated && item.quantity > 0 ? (
            <View style={styles.counterRow}>
              <TouchableOpacity
                onPress={() => restaurant.isAvailable && handleRemoveItem(restaurant.id, item.id)}
                disabled={!restaurant.isAvailable}
              >
                <Ionicons name="remove" size={18} color={Colors.Primary} />
              </TouchableOpacity>
              <Text style={styles.counterQty}>{item.quantity}</Text>
              <TouchableOpacity
                onPress={() => {
                  if (!restaurant.isAvailable) return;
                  if (
                    cartValue.quantity > 0 &&
                    cartValue.restaurantId !== restaurant.id
                  ) {
                    setPendingAddItem({
                      restaurantId: restaurant.id,
                      foodId: item.id,
                    });
                    setShowRestaurantSwitchModal(true);
                  } else {
                    handleAddItem(restaurant.id, item.id);
                  }
                }}
                disabled={!restaurant.isAvailable}
              >
                <Ionicons name="add" size={18} color={Colors.Primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButtonCompact}
              onPress={() => {
                if (!restaurant.isAvailable) return;
                if (!authState.authenticated) {
                  handleAuthRequired();
                  return;
                }
                if (
                  cartValue.quantity > 0 &&
                  cartValue.restaurantId !== restaurant.id
                ) {
                  setPendingAddItem({
                    restaurantId: restaurant.id,
                    foodId: item.id,
                  });
                  setShowRestaurantSwitchModal(true);
                } else {
                  handleAddItem(restaurant.id, item.id);
                }
              }}
              disabled={!restaurant.isAvailable}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={common.safeArea}>
      <View style={{ backgroundColor: Colors.Secondary }}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={Colors.Black} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={Colors.Black}
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              loadRestaurantMenu(text);
            }}
          />
        </View>
      </View>

      {/* Restaurant Closed Notification */}
      {!loading && !restaurant.isAvailable && (
        <View style={styles.closedNotification}>
          <View style={styles.closedContent}>
            <Ionicons name="warning" size={36} color={Colors.White} />
            <Text style={styles.closedText}>Restaurant is not accepting orders at the moment. Please check back later!</Text>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={Colors.Primary} />
      ) : (
        <SectionList
          sections={restaurantMenu}
          keyExtractor={(item, index) => `${item.id}+${index}`}
          renderItem={renderSectionGrid}
          onRefresh={() => {
            setRefreshing(true);
            loadRestaurantDetails();
            loadRestaurantMenu("");
            if (authState.authenticated) {
              refreshCart();
            }
          }}
          contentContainerStyle={{
            paddingBottom: authState.authenticated && cartValue.quantity > 0 ? 60 : 20,
          }}
          refreshing={refreshing}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={[common.title, styles.sectionTitle]}>{title}</Text>
          )}
          stickySectionHeadersEnabled={true}
          ListHeaderComponent={() => (
            <View style={styles.header}>
              <Text style={common.text}><Ionicons name="star" size={14} color="#FFB300" /> {restaurant.rating > 0 ? restaurant.rating : '--'} ({restaurant.ratingCount > 0 ? restaurant.ratingCount : '--'}) • {restaurant.cuisine}</Text>
              <Text style={common.text}><Ionicons name="location-outline" size={14} color={Colors.Primary} /> {restaurant.locality} • {restaurant.distance} kms</Text>
            </View>
          )}
        />
      )}

      { authState.authenticated && <CartBar quantity={cartValue.quantity} /> }

      <ConfirmModal
        isVisible={showRestaurantSwitchModal}
        title="Replace Cart?"
        message="Your cart contains items from another restaurant. Clear and add this item?"
        confirmText="Yes, Replace"
        cancelText="Cancel"
        onConfirm={handleCartReplaceAndAddItem}
        onCancel={() => setShowRestaurantSwitchModal(false)}
      />

      <ConfirmModal
        isVisible={showAuthModal}
        title="Login Required"
        message="You need to login to add items to cart and access other features. Would you like to login now?"
        confirmText="Login"
        cancelText="Cancel"
        onConfirm={handleAuthConfirm}
        onCancel={() => setShowAuthModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.LighterGrey,
    margin: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    height: 40
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontFamily: 'nunito-medium',
    fontSize: 14,
  },
  gridContainer: {
    paddingHorizontal: 10,
    paddingBottom: 100,
  },
  card: {
    margin: ITEM_GAP / 2,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: "100%",
    resizeMode: "cover",
  },
  name: {
    marginTop: 8,
    marginHorizontal: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 8,
    marginTop: 6,
  },
  price: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.LightGrey,
  },
  addButtonCompact: {
    backgroundColor: Colors.White,
    borderColor: Colors.Primary,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: Colors.Primary,
    fontSize: 13,
    fontWeight: "700",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.Primary,
    borderRadius: 20,
    backgroundColor: Colors.White,
  },
  counterQty: {
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 6,
  },
  sectionTitle: {
    padding: 10,
    backgroundColor: Colors.LighterGrey,
    color: Colors.Primary,
  },
  header: {
    backgroundColor: Colors.White,
    padding: 10,
  },
  restaurantMeta: {
    marginVertical: 2,
  },
  closedNotification: {
    backgroundColor: Colors.LightRed,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
});
