import { Text, TouchableOpacity, StyleSheet, View } from 'react-native'
import React, { forwardRef, useImperativeHandle, useRef, useCallback, useState } from 'react'
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { common } from '@/constants/Styles';
import { Fontisto, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import httpClient from '@/lib/httpClient';
import { useAuth } from '@/hooks/useAuth';
import { log } from '@/utils/logger';

type ConfirmDeleteSheetRef = { open: () => void; close: () => void };
type ConfirmDeleteSheetProps = { onClose?: () => void };

const ConfirmDeleteSheet = forwardRef<ConfirmDeleteSheetRef, ConfirmDeleteSheetProps>(({ onClose }, ref) => {
    const { authState } = useAuth();
    const { logout } = useAuth();
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const handleSheetChanges = useCallback((index: number) => {}, []);

    const renderBackdrop = useCallback((props: any) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={1} opacity={0.1} animatedIndex={{ value: 1 }} />
    ), []);

    const handleDeletion = async () => {
        try {
            await httpClient.post(`/auth/delete?customerId=${authState.userId}`);
            await logout();
        }
        catch (error) {
            log.error("ConfirmDeleteSheet.tsx/deleteAccount(): Error deleting account: " + error);
        }
    }

    // expose open/close functions to parent
    useImperativeHandle(ref, () => ({
        open: () => bottomSheetModalRef.current?.present(),
        close: () => bottomSheetModalRef.current?.dismiss(),
    }));
    
    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            onChange={handleSheetChanges}
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={{ display: "none" }}
            index={0}
            onDismiss={onClose}
        >
            <BottomSheetView style={styles.bottomSheet}>
                 <View style={styles.iconContainer}>
                     <Ionicons name="warning" size={40} color={Colors.Red} />
                 </View>
                 <Text style={[common.title, styles.title]}>Sad to see you go</Text>
                 <Text style={[common.text, styles.message]}>You will lose your past details, would you still like to proceed?</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => bottomSheetModalRef.current?.dismiss()}>
                         <Ionicons name="close-circle-outline" size={18} color={Colors.Green} />
                         <Text style={[common.subTitle, { color: Colors.Green, marginLeft: 8 }]}>No, Thank You</Text>
                     </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeletion}>
                         <Fontisto name="trash" size={18} color={Colors.White} />
                         <Text style={[common.subTitle, { color: Colors.White, marginLeft: 8 }]}>Continue</Text>
                     </TouchableOpacity>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
});

export default ConfirmDeleteSheet;

const styles = StyleSheet.create({
         bottomSheet: {
         height: 250,
         padding: 20
     },
         title: {
         marginBottom: 10,
         textAlign: 'center'
     },
     iconContainer: {
         alignItems: 'center',
         marginBottom: 15
     },
    message: {
        marginBottom: 20,
        textAlign: 'center'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15
    },
         cancelButton: {
         flex: 1,
         height: 45,
         borderRadius: 10,
         backgroundColor: Colors.White,
         borderWidth: 1,
         borderColor: Colors.Green,
         flexDirection: 'row',
         alignItems: 'center',
         justifyContent: 'center'
     },
         deleteButton: {
         flex: 1,
         height: 45,
         borderRadius: 10,
         backgroundColor: Colors.Red,
         flexDirection: 'row',
         alignItems: 'center',
         justifyContent: 'center'
     }
});