import React, { useEffect } from 'react';
import RazorpayWebView from '@/components/razorpay/RazorpayWebView';

export default function index() {
  useEffect(() => {
    console.log('calling web view');
  }, [])
  return <RazorpayWebView />;
} 