import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import React from 'react'
import { router } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { common } from '@/constants/Styles'

const CommonHeader = (props: any) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => { router.back(); }}>
        <Ionicons name='arrow-back' style={styles.navigate} color={Colors.Primary} />
      </TouchableOpacity>
      <Text style={[common.title, styles.title]}>{props.options.headerTitle}</Text>
    </View>
  );
};

export default CommonHeader;

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        shadowColor: Colors.LightGrey,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
      },
      android: {
        elevation: 5,
      }
    }),
    backgroundColor: Colors.White,
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  navigate: {
    paddingTop: 10,
    fontSize: 30
  },
  title: {
    paddingLeft: 20,
    paddingTop: 10
  }
});
