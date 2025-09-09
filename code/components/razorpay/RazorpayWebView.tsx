import React, { useEffect, useRef } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import httpClient from "@/lib/httpClient";
import { common } from "@/constants/Styles";
import { log } from "@/utils/logger";

export default function RazorpayWebView() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const canExit = useRef(false);

  // Get order and receipt from navigation params
  const { order: orderString, receipt } = params;
  const order = orderString ? JSON.parse(orderString as string) : {};

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!canExit.current) {
        e.preventDefault();
      }
    });
    return unsubscribe;
  }, [navigation]);

  // Construct the HTML for Razorpay Checkout
  const injectedJavaScript = `
    var options = {
      key: '${order.key}',
      amount: '${order.amount}',
      currency: '${order.currency}',
      name: '${order.name}',
      description: '${order.description}',
      order_id: '${order.id}',
      // Add customer ID from order notes
      customer_id: '${order.notes?.customer_id}',
      webview_intent: true,
      handler: function (response){
        window.ReactNativeWebView.postMessage(JSON.stringify({ success: true, ...response }));
      },
      modal: {
        ondismiss: function(){
          window.ReactNativeWebView.postMessage(JSON.stringify({ success: false, cancelled: true }));
        }
      },
      prefill: ${JSON.stringify(order.prefill || {})},
      notes: ${JSON.stringify(order.notes || {})},
      theme: { color: '#014D4E' },
      // UPI intent flow for popular UPI apps (officially supported)
      upi: {
        flow: 'intent',
        upi_intent_apps: ['google_pay', 'bhim', 'paytm']
      },
      // Disable netbanking for Android
      method: {
        netbanking: false
      },
      // Enable card saving (officially supported)
      save: 1
    };
    var rzp = new Razorpay(options);
    rzp.open();
  `;

  const htmlContent = `
    <html>
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body>
        <script>
          ${injectedJavaScript}
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[common.safeArea, { flex: 1 }]}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#014D4E" />
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          log.warn('RazorpayWebView.tsx/onError(): WebView error: ' + JSON.stringify(nativeEvent));
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          log.warn('RazorpayWebView.tsx/onHttpError(): WebView HTTP error: ' + JSON.stringify(nativeEvent));
        }}
        onMessage={async (event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            log.debug('RazorpayWebView.tsx/onMessage(): Razorpay response: ' + JSON.stringify(data));
            
            if (data.success) {
              canExit.current = true;
              try {
                await httpClient.post(`/Order/Confirm?orderRef=${data.razorpay_order_id}&paymentRef=${data.razorpay_payment_id}&paymentSignatureRef=${data.razorpay_signature}`);
                router.replace(`/order/${receipt}`);
              } catch (error) {
                log.error('RazorpayWebView.tsx/onMessage(): Error confirming order: ' + error);
                router.replace(`/order/${receipt}?error=payment_verification_failed`);
              }
            } else if (data.cancelled) {
              canExit.current = true;
              try {
                await httpClient.post(`/Order/Cancel?orderId=${receipt}`);
                router.back();
              } catch (error) {
                log.error('RazorpayWebView.tsx/onMessage(): Error cancelling order: ' + error);
                router.replace("/store?order_cancelled=true");
              }
            } else {
              canExit.current = true;
              router.back();
            }
          } catch (error) {
            log.error('RazorpayWebView.tsx/onMessage(): Error processing payment response: ' + error);
            canExit.current = true;
            router.replace("/store");
          }
        }}
      />
    </View>
  );
}