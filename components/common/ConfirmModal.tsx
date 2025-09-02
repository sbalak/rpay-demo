import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Modal from "react-native-modal";
import { Colors } from "@/constants/Colors";

interface ConfirmModalProps {
  isVisible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isVisible,
  title = "Confirm",
  message,
  confirmText = "Yes",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onCancel}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropOpacity={0.4}
      useNativeDriver
    >
      <View style={styles.modalContainer}>
        {title && <Text style={styles.title}>{title}</Text>}
        <Text style={styles.message}>{message}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.cancel}>{cancelText}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirm}>
            <Text style={styles.confirm}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.Primary,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 20,
  },
  cancel: {
    color: Colors.Primary,
    fontSize: 16,
  },
  confirm: {
    color: Colors.Primary,
    fontSize: 16,
    fontWeight: "bold",
  },
});
