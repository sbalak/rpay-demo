import { StyleSheet, Text } from 'react-native'
import React, { useCallback } from 'react'
import axios from 'axios';
import { useFocusEffect } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from '@gorhom/bottom-sheet';
import { useAuth } from '@/hooks/useAuth';
import { Rating } from 'react-native-ratings';
import { common } from '@/constants/Styles';
import httpClient from '@/lib/httpClient';

type RatingPromptProps = { onOpen?: () => void; onClose?: () => void };

export default function RatingPrompt({ onOpen, onClose }: RatingPromptProps) {
    const { authState } = useAuth();
    const [ratingPrompt, setRatingPrompt] = useState<any>({});
    const [rating, setRating] = useState(0);
    const ratingRef = useRef<BottomSheetModal>(null);
  
    const promptRating = async() => {
      try {
        const response = await httpClient.get(`/rating/prompt?customerId=${authState.userId}`);
        if (response.data.orderId > 0) {
          setRatingPrompt(response.data);
          ratingRef.current?.present();
          if (onOpen) onOpen();
        }
      }
      catch(error) {
      } 
    }
  
    const updateRating = async() => {
      try {
        if (ratingPrompt.orderId) {
          await httpClient.post(`/rating/create?orderId=${ratingPrompt.orderId}&rating=${rating}`);
          setRatingPrompt({});
          ratingRef.current?.dismiss();
          if (onClose) onClose();
        }
      }
      catch(error) {
      } 
    }
  
    const handleSheetChanges = useCallback((index: number) => {
    }, []);
  
    const renderBackdrop = useCallback((props: any) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={1} opacity={0.1} animatedIndex={{ value: 1 }} />
    ), [])
  
    useEffect(() => {
      updateRating();
    }, [rating]);
  
    useFocusEffect(
      React.useCallback(() => {
        if (authState.authenticated) {
          promptRating();
        }
      }, [])
    );
  
  return (
    <BottomSheetModalProvider>
      <BottomSheetModal ref={ratingRef} onChange={handleSheetChanges} backdropComponent={renderBackdrop} handleIndicatorStyle={{ display: "none" }}
        onDismiss={onClose}
      >
        <BottomSheetView style={styles.bottomSheet}>
          <Text style={common.text}>How was your recent order at</Text>
          <Text style={common.title}>{ratingPrompt.restaurantName}</Text>
          <Rating
            jumpValue={0.5}
            onFinishRating={setRating}
            style={styles.star}
            imageSize={32}
            fractions={1}
            startingValue={rating}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  )
}

const styles = StyleSheet.create({
    bottomSheet: {
        flex: 1, 
        alignItems: 'center', 
        padding:10
    },
    star : {
        paddingBottom: 20
    }
});