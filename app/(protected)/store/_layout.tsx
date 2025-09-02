import React from 'react'
import { Stack } from 'expo-router'
import CommonHeader from '@/components/headers/CommonHeader'

export default function _layout() {
  return (
    <Stack 
      screenOptions={({ route }) => ({
        headerTitle: route.params?.headerTitle
      })} 
    >
      <Stack.Screen name="[id]" options={{ header: (props) => <CommonHeader props={props} {...props} /> }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="list" options={{ header: (props) => <CommonHeader props={props} {...props} /> }} />
    </Stack>
  )
}