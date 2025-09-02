import { useCallback } from "react";
import httpClient from "@/lib/httpClient";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";

// Types for Razorpay order response and options
export type RazorpayOrderResponse = {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  created_at: number;
  notes: { customer_id: number };
};

export type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  image?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
  };
  // UPI options (officially supported)
  upi?: {
    flow?: 'intent' | 'collect';
    upi_intent_apps?: string[];
  };
  // Card saving (officially supported)
  save?: number;
  [key: string]: any;
};

export function useRazorpay() {
  const router = useRouter();

  const initiatePayment = useCallback(
    async ({
      restaurantId,
      customerId,
      razorpayKey,
      prefill,
      ...restOptions
    }: {
      restaurantId: number;
      customerId: number;
      razorpayKey: string;
      prefill?: RazorpayOptions["prefill"];
      [key: string]: any;
    }) => {
      // 1. Create order on backend
      const { data: order }: { data: RazorpayOrderResponse } =
        await httpClient.post(`/Order/Initiate?restaurantId=${restaurantId}&customerId=${customerId}`);

      // 2. Prepare Razorpay options for WebView
      const webviewOrder = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "Settl",
        description: "Order Payment",
        id: order.id,
        prefill,
        notes: order.notes,
        customer_id: order.notes?.customer_id,
        theme: { color: "#014D4E" },
        // UPI intent flow for popular UPI apps (officially supported)
        upi: {
          flow: 'intent',
          upi_intent_apps: ['google_pay', 'bhim', 'paytm']
        },
        // Enable card saving (officially supported)
        save: 1,
        ...restOptions,
      };

      // 3. Navigate to RazorpayWebView screen/component
      router.push({
        pathname: "/razorpay",
        params: {
          order: JSON.stringify(webviewOrder),
          receipt: order.receipt,
        },
      });
    },
    [router]
  );

  return { initiatePayment };
}
