import React, { useEffect } from 'react';
import RazorpayWebView from '@/components/razorpay/RazorpayWebView';
import { log } from '@/utils/logger';

export default function index() {
  useEffect(() => {
    log.debug('razorpay/index.tsx/useEffect(): calling web view');
  }, [])
  return <RazorpayWebView />;
} 