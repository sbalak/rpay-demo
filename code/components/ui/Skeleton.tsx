// components/ui/Skeleton.tsx
import React from "react";
import { View, StyleSheet, ViewStyle, DimensionValue } from "react-native";

interface SkeletonProps {
  height?: number;
  width?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

const Skeleton = ({
  height = 16,
  width = "100%",
  borderRadius = 4,
  style,
}: SkeletonProps) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          height,
          width,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#e0e0e0",
    opacity: 0.5,
    marginVertical: 4,
  },
});

export default Skeleton;
