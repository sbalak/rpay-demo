import { Text, ScrollView, StyleSheet, View, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { router, useFocusEffect, useNavigation } from 'expo-router';
import { common, size } from '@/constants/Styles';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import httpClient from '@/lib/httpClient';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import ConfirmDeleteSheet from '@/components/delete/ConfirmDeleteSheet';

export default function profile() {
  const { authState } = useAuth();
  const navigation = useNavigation();
  const [user, setUser] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  useEffect(() => {
    navigation.setOptions({ headerTitle: 'Edit Profile' });
  }, []); 
  
  const confirmDeleteSheetRef = useRef<{
    open: () => void;
    close: () => void;
  }>(null);
  

  const openConfirmDeleteSheet = () => {
    confirmDeleteSheetRef.current?.open();
  };

  const handleConfirmDeleteRefreshStatus = () => { };

  const loadUser = async() => {
    try {
      const response = await httpClient.get(`/customer/details?customerId=${authState.userId}`);
      setUser(response.data);
      setFirstName(response.data.firstName);
      setLastName(response.data.lastName);
    }
    catch(error) {
    } 
  }

  const handleUpdate = async () => {
    try {
      if (!firstName || !lastName) {
        Alert.alert('Error!', "Please enter your first & last name");
      }
      else{
        const response = await httpClient.post(`/customer/update?customerId=${authState.userId}&firstName=${firstName}&lastName=${lastName}`);
        router.back();
      }      
    } catch (error) {
      Alert.alert('Error!', "Something went wrong, please try again later.");
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      loadUser();
    }, [])
  );
  return (
    <View style={common.safeArea}>
      <ScrollView style={common.container}>
        <View style={styles.titleContainer}>
          <Text style={common.title}>Edit Profile</Text>
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.inputSection}>
            <Text style={styles.textInputLabel}>First Name</Text>
            <View style={styles.textInput}>
            <TextInput 
                style={[common.text, styles.textInputBox]} 
                placeholderTextColor={Colors.LighterGrey} 
                placeholder='Last Name' 
                defaultValue={user.firstName} 
                onChangeText={(text: string) => {
                  if (text.length > 0) {
                    setFirstName(text);
                  }
                }}
              />
            </View>
          </View>
          <View style={styles.inputSection}>
            <Text style={styles.textInputLabel}>Last Name</Text>
            <View style={styles.textInput}>
              <TextInput 
                style={[common.text, styles.textInputBox]} 
                placeholderTextColor={Colors.LighterGrey} 
                placeholder='Last Name' 
                defaultValue={user.lastName} 
                onChangeText={(text: string) => {
                  if (text.length > 0) {
                    setLastName(text);
                  }
                }}
              />
            </View>
          </View>
          <View style={styles.inputSection}>
            <Text style={styles.textInputLabel}>Phone</Text>
            <View style={styles.textInput}>
              <TextInput style={[common.text, styles.textInputBox]} editable={false} value={user.phone} />
            </View>
          </View>
        </View>
        <View>  
          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Ionicons name="log-in-outline" size={24} color={Colors.Secondary} /> 
            <Text style={[common.defaultText, styles.buttonText]}>Update Profile</Text>
          </TouchableOpacity>
        </View>
        <View style={common.wrapper}>
          <Text style={[common.title, size.MB10]}>Delete Account?</Text>
          <Text style={common.text}>Deleting your account will remove all your orders, vouchers and other data from the system. </Text>
          <TouchableOpacity onPress={openConfirmDeleteSheet} style={{ width: "100%" }}>
            <Text style={[common.subTitle, {marginTop: 10, textAlign: 'right', color: Colors.Primary}]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomSheetModalProvider>
        <ConfirmDeleteSheet
          ref={confirmDeleteSheetRef}
          onClose={handleConfirmDeleteRefreshStatus}
        />
      </BottomSheetModalProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    paddingVertical: 10
  },  
  detailsContainer: { 
    backgroundColor: Colors.White, 
    padding: 10, 
    borderRadius: 10,
  },
  inputSection: {
    display: 'flex',
    flexDirection: 'row', 
    marginBottom: 10
  },
  textInputLabel: {
    fontFamily: common.defaultHeading,
    width: "30%",
    fontSize: 16,
    borderColor: Colors.Secondary,
    paddingTop: 10, 
    marginRight: 15
  },
  textInput: {
    width: "65%", 
    height: 40, 
    borderColor: Colors.Secondary, 
    borderWidth: 1, 
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 2,
    alignItems: 'center', 
    justifyContent: 'center'
  },
  textInputBox: {
    width: "100%",
    fontSize: 16
  },
  button: {
    marginVertical: 20,
    height: 50,
    width: "100%",
    borderRadius: 10,
    backgroundColor: Colors.Primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: Colors.Secondary,
    fontSize: 18,
    marginLeft: 10
  }
})