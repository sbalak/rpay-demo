import * as Device from "expo-device";
import { Platform } from "react-native";

export const getDeviceId = (): string =>
  Platform.OS === "web" ? "web" : Device.modelName ?? "unknown-device";
