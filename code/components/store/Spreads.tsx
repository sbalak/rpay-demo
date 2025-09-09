import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { router, useFocusEffect } from 'expo-router';
import { common } from '@/constants/Styles';
import { Colors } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import httpClient from '@/lib/httpClient';
import { log } from '@/utils/logger';

export default function Spreads() {
    const { authState } = useAuth();
    const { locationState } = useLocation(  );
    const [spreads, setSpreads] = useState<any>([]);
  
    const loadSpreads = async() => {
      try {
        if (locationState.latitude && locationState.longitude) {
            const response = await httpClient.get(`/restaurant/spreads`);
            setSpreads(response.data);
        }
      }
      catch(error) {
        log.error("Spreads.tsx/loadSpreads(): Error loading spreads: " + error);
      } 
    }
  
    useFocusEffect(
      React.useCallback(() => {
        loadSpreads();
      }, [locationState.latitude, locationState.longitude])
    );
  
    return (
      spreads.length > 0 ? 
      <View>
        <View style={styles.titleContainer}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={Colors.Primary} />
            <Text style={common.title}>What's on your mind?</Text>
        </View>
        <FlatList data={spreads} 
                horizontal={true} 
                showsHorizontalScrollIndicator={false} 
                renderItem={({item, index})=>(
                    <View style={{}}>
                    <TouchableOpacity style={{paddingRight: 10}} onPress={() => router.navigate(`/store/list?filter=${item.name}`)}>
                        <Image source={{uri:`${process.env.EXPO_PUBLIC_STR_URL}${item?.photo}`}} style={{height:80, width:80, marginBottom:5, backgroundColor: Colors.White, borderRadius:20}} />
                        <Text style={[common.text, {textAlign: 'center'}]}>{item.name}</Text>
                    </TouchableOpacity>
                    </View>
                )}
                keyExtractor={(item, index) => String(index)}
        />
      </View>
      : null
    )
  }
  
const styles = StyleSheet.create({
    titleContainer: {
      marginVertical: 10,
      display: 'flex',
      flexDirection: 'row', gap: 5
    }
  })