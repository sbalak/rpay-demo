import { FlatList, StyleSheet, View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import OrderCard from "@/components/order/OrderCard";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import httpClient from "@/lib/httpClient";
import { Colors } from "@/constants/Colors";
import { common } from "@/constants/Styles";
import { log } from "@/utils/logger";

export default function Index() {
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      if (authState.authenticated) {
        loadOrders();
      }
    }, [authState.userId])
  );

  const loadOrders = async () => {
    if (!authState.authenticated) return;

    try {
      setIsLoading(true);
      const response = await httpClient.get(
        `/order/list?customerId=${authState.userId}&page=${currentPage}&pageSize=10`
      );
      log.debug("order/index.tsx/loadOrders(): Order list response: " + JSON.stringify(response.data));
      if (response.data.length > 0) {
        if (currentPage === 1) {
          setOrders(response.data);
        } else {
          setOrders((items) => items.concat(response.data));
        }
        setCurrentPage(currentPage + 1);
      }
      setIsLoading(false);
    } 
    catch (error) {
      log.error("order/index.tsx/loadOrders(): Error loading orders: " + error);
    }
  };

  const onEndReached = async () => {
    if (!isLoading) {
      await loadOrders();
    }
  };

  const listFooterComponent = () => {
    return (
      <Text style={[common.text, styles.footer]}>You've reached the end</Text>
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      loadOrders();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({ headerTitle: "Order History" });
  }, []);

  return (
    <View style={common.safeArea}>
      <FlatList
        data={orders}
        style={common.container}
        renderItem={({ item, index }) => <OrderCard order={item} key={index} />}
        keyExtractor={(item, index) => String(index)}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View style={styles.titleContainer}>
            <Text style={common.title}>Past Orders</Text>
          </View>
        }
        ListFooterComponent={listFooterComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    paddingVertical: 10,
  },
  footer: {
    textAlign: "center",
    marginBottom: 20,
  },
});
