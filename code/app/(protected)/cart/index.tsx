import { ScrollView, View } from 'react-native'
import React, { useEffect } from 'react'
import CartDetails from '@/components/cart/CartDetails'
import { useNavigation } from '@react-navigation/native';
import { common } from '@/constants/Styles';

export default function index() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerTitle: 'Cart' });
  }, []);
  
    return (
    <View style={common.safeArea}>
      <ScrollView style={common.container}>
        <CartDetails />
      </ScrollView>
    </View>   
  )
}