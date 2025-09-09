import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { button, common, size } from '@/constants/Styles';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { FontAwesome, Ionicons, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import { Rating } from 'react-native-ratings';
import { Colors } from '@/constants/Colors';
import httpClient from '@/lib/httpClient';
import { log } from '@/utils/logger';

export default function rating() { 
  const { id } = useLocalSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>({});
  const [rating, setRating] = useState(0);
  const [orderItems, setOrderItems] = useState<any>([]);
  
  const loadOrder = async() => {
    try {
      const response = await httpClient.get(`/rating/order?orderId=${id}`);
      setOrderDetails(response.data);
    }
    catch(error) {
      log.error("rating/[id].tsx/loadOrder(): Error loading order for rating: " + error);
    } 
  }

  const handleCreateRating = async() => {
    try {
      await httpClient.post(`/rating/upsert?orderId=${id}&rating=${rating}`, `[${orderItems}]`);
      router.replace('/store');
    }
    catch (error) {
      log.error("rating/[id].tsx/createRating(): Error creating rating: " + error);
    }
  }

  const handleAddLike = (orderItemId: string) => {
    try {
      setOrderItems([...orderItems, orderItemId]);
    }
    catch (error) {
      log.error("rating/[id].tsx/addLike(): Error adding like to item: " + error);
    }
  }

  const handleRemoveLike = (orderItemId: string) => {
    try {
      setOrderItems(orderItems.filter((item: string) => item !== orderItemId));
    }
    catch (error) {
      log.error("rating/[id].tsx/removeLike(): Error removing like from item: " + error);
    }
  };
  
  const checkLike = (orderItemId: string) => {
    try {      
      var orderItem = orderItems.find((item: string) => item === orderItemId);
      return orderItem;
    }
    catch (error) {
      log.error("rating/[id].tsx/checkLikeStatus(): Error checking like status: " + error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadOrder();
    }, [])
  );

  return (
    <View style={[common.safeArea, ]}>
      <ScrollView style={[common.container, size.MV10, {backgroundColor: 'white'}]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={34} color="black" /> 
        </TouchableOpacity>
        <View style={size.MV10}>          
          <Text style={[common.text, size.MB10, {textAlign: 'center'}]}>Rate your recent order at</Text>
          <Text style={[common.title, {textAlign: 'center'}]}>{orderDetails.restaurantName}</Text>
        </View>
        <Rating
          jumpValue={0.5}
          onFinishRating={setRating}
          style={{ marginVertical: 20, alignSelf: 'center' }}
          imageSize={32}
          fractions={1}
          startingValue={rating}
        />
        {orderDetails?.rateItems?.map((item: any) => (
          <View style={[common.row, {paddingHorizontal: 20, paddingBottom: 20}]} key={item.orderItemId}>          
            <Text style={[common.text, size.MB10]}>{item.itemName}</Text>  
            {
              checkLike(item.orderItemId) ?
              (
                <TouchableOpacity onPress={() => {handleRemoveLike(item.orderItemId)}}>
                  <FontAwesome name="heart" size={24} color={Colors.Primary} />
                </TouchableOpacity>
              ) :
              (
                <TouchableOpacity onPress={() => {handleAddLike(item.orderItemId)}}>
                  <FontAwesome name="heart-o" size={24} color={Colors.Primary} />
                </TouchableOpacity>
              ) 
            } 
          </View>   
        ))}
        {
          rating > 0 ?
            (
              <TouchableOpacity
                style={button.container}
                onPress={() => {handleCreateRating()}}
              >
                <Ionicons name="checkmark-sharp" size={24} color={Colors.Secondary} />
                <Text style={button.text}>Submit Rating</Text>
              </TouchableOpacity>
            ) :
            ''
        }
      </ScrollView>
    </View>
  )
}