import React, { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import httpClient from '@/lib/httpClient';

export default function RazorpayWebView() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { order: orderString, receipt } = params;
  const order = orderString ? JSON.parse(orderString as string) : {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const paymentHandled = useRef(false);

  // Block navigation until payment is handled
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (!paymentHandled.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, []);

  useEffect(() => {
    if (!order || !order.key || !order.id) {
      setError('Invalid order details.');
      setLoading(false);
      return;
    }
    // Dynamically load Razorpay script if not present
    const scriptId = 'razorpay-checkout-js';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = openRazorpay;
      script.onerror = () => {
        setError('Failed to load Razorpay SDK.');
        setLoading(false);
      };
      document.body.appendChild(script);
    } else {
      openRazorpay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSuccess(response: any) {
    paymentHandled.current = true;
    try {
      await httpClient.post(
        `/Order/Confirm?orderId=${receipt}&paymentRef=${response.razorpay_payment_id}&paymentSignatureRef=${response.razorpay_signature}`
      );
      router.replace(`/order/${receipt}`);
    } catch (e) {
      setError('Payment succeeded but confirmation failed.');
    }
  }

  async function handleCancel() {
    paymentHandled.current = true;
    try {
      await httpClient.post(
        `/Order/Cancel?orderId=${receipt}`
      );
      router.back();
    } catch {
      router.replace('/store');
    }
  }

  function openRazorpay() {
    setLoading(false);
    if (!(window as any).Razorpay) {
      setError('Razorpay SDK not loaded.');
      return;
    }
    const options = {
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      name: order.name,
      description: order.description,
      order_id: order.id,
      // Add customer ID from order notes
      customer_id: order.notes?.customer_id,
      handler: function (response: any) {
        handleSuccess(response);
      },
      modal: {
        ondismiss: function () {
          console.log('test cancel');
          handleCancel();
        },
      },
      prefill: order.prefill || {},
      notes: order.notes || {},
      theme: { color: '#014D4E' },
      // UPI intent flow for popular UPI apps (officially supported)
      upi: {
        flow: 'intent',
        upi_intent_apps: ['google_pay', 'bhim', 'paytm']
      },
      // Disable netbanking
      method: {
        netbanking: false
      },
      // Enable card saving (officially supported)
      save: 1
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <span>Loading payment gateway...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>
    );
  }
  // Optionally, show nothing or a message while Razorpay modal is open
  return null;
} 