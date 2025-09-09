import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { common } from '@/constants/Styles';
import { Ionicons } from '@expo/vector-icons';

interface RestaurantNearbyCardProps {
  restaurant: any;
  onAuthRequired?: () => void;
  isAuthenticated?: boolean;
}

export default function RestaurantNearbyCard({ restaurant, onAuthRequired, isAuthenticated }: RestaurantNearbyCardProps) {
  return (    
    <TouchableOpacity style={styles.restaurantContainer} onPress={() => router.navigate(`/store/${restaurant.id}`)}>
        <Image source={{ uri: restaurant.photo ? `${process.env.EXPO_PUBLIC_CDN_URL}${restaurant.photo}` : `${process.env.EXPO_PUBLIC_STR_URL}/assets/placeholder.png` }} style={styles.restaurantImage} />
        <View style={styles.restaurantInfo}>
            <Text style={common.subTitle}>{restaurant.name}</Text>
            <Text style={common.text}><Ionicons name="star" size={14} color="#FFB300" /> {restaurant.rating > 0 ? restaurant.rating : '--'} ({restaurant.ratingCount > 0 ? restaurant.ratingCount : '--'}) • {restaurant.cuisine}</Text>
            <Text style={common.text}><Ionicons name="location-outline" size={14} color={Colors.Primary} /> {restaurant.locality} • {restaurant.distance} kms</Text>
            <View style={{ flexDirection: 'row' }}>
                <Ionicons name="timer-outline" size={14} color={Colors.LightGrey} style={{ paddingTop: 2, paddingRight: 5 }} /> 
                <Text style={common.text}>Pickup in {restaurant.preparationTime} mins</Text>
            </View>
        </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    restaurantContainer: {
        backgroundColor: Colors.White,
        marginBottom: 10,
        padding: 10,
        borderRadius: 15,
        flexDirection: 'row',
    },
    restaurantImage: {
        width: 125,
        height: 125,
        borderRadius: 15
    },
    restaurantInfo: {
        marginTop: 7,
        marginLeft: 10,
        width: 240,
    }
});