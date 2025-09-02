import React, { createContext, useContext, useState, useEffect, ReactNode, } from "react";
import httpClient from "@/lib/httpClient";
import { useAuth } from "./useAuth";
import * as Sentry from "@sentry/react-native";

const CartContext = createContext<any>(null);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartValue, setCartValue] = useState([]);
  const { authState } = useAuth();
  const [loading, setLoading] = useState(true);

  const loadCartValue = async () => {
    setLoading(true);
    try {
      if (authState.userId) {
        const res = await httpClient.get(`/cart/stats?customerId=${authState.userId}`);
        setCartValue(res.data);
      }
    } catch (e) {
      console.error("Cart load failed", e);
      Sentry.captureException("Cart load failed: " + JSON.stringify(e));
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (restaurantId: string, foodId: string) => {
    await httpClient.get(`/Cart/Add?customerId=${authState.userId}&restaurantId=${restaurantId}&foodId=${foodId}`);
    loadCartValue();
  };

  const removeItem = async (restaurantId: string, foodId: string) => {
    await httpClient.get(`/Cart/Remove?customerId=${authState.userId}&restaurantId=${restaurantId}&foodId=${foodId}`);
    loadCartValue();
  };

  useEffect(() => {
    if (authState.authenticated) {
      loadCartValue();
    } else {
      setLoading(false);
    }
  }, [authState.authenticated]);

  return (
    <CartContext.Provider value={{ cartValue, loading, addItem, removeItem, refreshCart: loadCartValue }}>
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    Sentry.captureException("useCart must be used within a CartProvider");
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
