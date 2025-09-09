import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  Linking,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
} from "react-native";
import React, { useCallback, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link, router, useFocusEffect } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { common } from "@/constants/Styles";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [validPhone, setValidPhone] = useState(false);
  const { login } = useAuth();

  const terms = "https://settlnow.com/terms";
  const privacy = "https://settlnow.com/privacy";

  useFocusEffect(
    useCallback(() => {
      // Reset loading when screen is focused
      setLoading(false);
    }, [])
  );

  const pressTerms = () => {
    Linking.openURL(terms).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  const pressPrivacy = () => {
    Linking.openURL(privacy).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  const handleLogin = async () => {
    try {
      if (!username || username.length < 10) {
        Alert.alert("Error!", "Please enter your phone number");
      }
      else {
        setLoading(true);
        const result = await login(username);
        if (result) {
          router.navigate(`/verify?username=${username}`);
        }
        else {
          Alert.alert(
            "Error!",
            "Unauthorized, please check your username and password."
          );
        }
      }
    }
    catch (error) {
      Alert.alert("Error!", "Something went wrong, please try again later.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Platform.OS !== 'web' ? Keyboard.dismiss : undefined}
        >
          <View style={brand.container}>
            <TouchableOpacity
              style={brand.skipButton}
              onPress={() => router.push("/(protected)/store")}
            >
              <Text style={brand.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            <Image
              style={{ height: 80, width: 200 }}
              source={{
                uri: `${process.env.EXPO_PUBLIC_STR_URL}/brand/settl/logo_primary.png`,
              }}
            />
          </View>
          <View style={signin.container}>
            <Text style={signin.title}>India's First Food App for Pick-Up</Text>
            <View style={signin.subTitleContainer}>
              <View style={signin.subTitleDivider} />
              <View>
                <Text style={signin.subTitleText}>Log in or sign up</Text>
              </View>
              <View style={signin.subTitleDivider} />
            </View>
            <View style={signin.inputSection}>
              <View style={signin.countryInput}>
                <Image
                  style={signin.countryInputImage}
                  source={{
                    uri: `${process.env.EXPO_PUBLIC_STR_URL}/assets/flag.png`,
                  }}
                />
              </View>
              <View style={signin.textInput}>
                <TextInput
                  style={signin.textInputBox}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.LighterGrey}
                  placeholder="9999999999"
                  value={username}
                  onChangeText={(text: string) => {
                    const regex = new RegExp(/^[123456789]\d{9}$/);
                    const isValid = regex.test(text);

                    if (text.includes(".") || text.includes(",")) {
                      text = text.replace(".", "");
                      text = text.replace(",", "");
                    }

                    if (text.length > 10) {
                      return;
                    }

                    if (isValid) {
                      setUsername(text);
                      if (text.length === 10 && isValid) {
                        setValidPhone(true);
                        Keyboard.dismiss();
                      }
                    } else {
                      setUsername(text);
                      setValidPhone(false);
                    }
                  }}
                />
              </View>
            </View>
          </View>
          <View style={logon.container}>
            <TouchableOpacity
              style={[logon.button, loading && { opacity: 0.5 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Ionicons name="log-in-outline" size={24} color={Colors.White} />
              <Text style={[common.defaultText, logon.buttonText]}>
                Continue with OTP
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              alignItems: "center",
              paddingHorizontal: 10,
              paddingVertical: 10,
              marginBottom: 20,
            }}
          >
            <Text style={[common.text, { fontSize: 12 }]}>
              By continuing, you agree to our
            </Text>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity onPress={pressTerms}>
                <Text
                  style={[
                    common.text,
                    { fontSize: 12, textDecorationLine: "underline" },
                  ]}
                >
                  Terms & Conditions
                </Text>
              </TouchableOpacity>
              <Text> </Text>
              <TouchableOpacity onPress={pressPrivacy}>
                <Text
                  style={[
                    common.text,
                    { fontSize: 12, textDecorationLine: "underline" },
                  ]}
                >
                  Privacy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  scrollContainer: {
    flexGrow: 1,
  },
});

const brand = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: Colors.Primary,
    paddingHorizontal: 10,
    paddingVertical: 80,
    position: "relative",
  },
  skipButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: Colors.Primary,
    borderWidth: 1,
    borderColor: Colors.Secondary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 1,
  },
  skipButtonText: {
    color: Colors.Secondary,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: 'nunito-medium',
  },
});

const signin = StyleSheet.create({
  container: {
    backgroundColor: Colors.White,
    padding: 10,
    paddingBottom: 20,
  },
  title: {
    fontFamily: common.defaultTitle,
    fontSize: 24,
    textAlign: "center",
    marginVertical: 25,
  },
  subTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 20,
  },
  subTitleText: {
    fontFamily: common.defaultHeading,
    width: 140,
    textAlign: "center",
    color: Colors.LightGrey,
  },
  subTitleDivider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.Secondary,
  },
  inputSection: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 10,
  },
  countryInput: {
    width: "15%",
    borderColor: Colors.Secondary,
    borderWidth: 1,
    borderRadius: 10,
    marginRight: 19,
  },
  countryInputImage: {
    height: 30,
    width: 41,
    marginTop: 9,
    marginLeft: 7,
    borderRadius: 5,
  },
  textInput: {
    width: "80%",
    height: 50,
    borderColor: Colors.Secondary,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  textInputBox: {
    width: "100%",
    fontSize: 22,
  },
});

const logon = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  button: {
    marginBottom: 20,
    height: 50,
    width: "100%",
    borderRadius: 10,
    backgroundColor: Colors.Black,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: Colors.White,
    fontSize: 18,
    marginLeft: 10,
  },
});
