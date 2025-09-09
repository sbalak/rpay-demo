import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { OtpInput } from "react-native-otp-entry";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { common } from "@/constants/Styles";
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { log } from "@/utils/logger";

const verify = () => {
  const { username } = useLocalSearchParams();
  const [key, setKey] = useState(1);
  const [expired, setExpired] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const { verify } = useAuth();

  const handleVerify = async (code: string) => {
    try {
      const result = await verify(username.toString(), code);

      if (!result.accessToken && !result.refreshToken) {
        setVerificationFailed(true);
      } else {
        // ✅ Navigate immediately after successful login
        router.replace("/store"); // or whatever the intended post-login screen is
      }
    } catch (error) {
      setVerificationFailed(true);
    }
  };

  const handleResend = async () => {
    try {
      setKey((prevKey) => prevKey + 1);
      setExpired(false);
    }
    catch (error) {
      log.error("verify.tsx/resendOTP(): Error resending OTP: " + error);
    }
  };

  const renderTime = ({ remainingTime }: { remainingTime: number }) => {
    if (remainingTime === 0) {
      return <Text style={styles.countdownText}>Too late...</Text>;
    }

    return <Text style={styles.countdownText}>{remainingTime}</Text>;
  };

  return (
    <View style={styles.container}>
      <View style={brand.container}>
        <Image
          style={{ height: 80, width: 200 }}
          source={{
            uri: `${process.env.EXPO_PUBLIC_STR_URL}/brand/settl/logo_white.png`,
          }}
        />
      </View>
      <Text style={[common.text, styles.text]}>
        We have sent a verification code to +91 {username}
      </Text>
      {verificationFailed ? (
        <Text style={[common.text, styles.text, { marginTop: 10 }]}>
          Incorrect OTP, please try again
        </Text>
      ) : (
        ""
      )}
      <OtpInput
        numberOfDigits={6}
        focusColor={Colors.Primary}
        focusStickBlinkingDuration={500}
        onTextChange={(text) => {
          setVerificationFailed(false);
        }}
        onFilled={(text) => {
          handleVerify(text);
        }}
        textInputProps={{
          accessibilityLabel: "One-Time Password",
        }}
        theme={{
          containerStyle: otp.container,
          pinCodeTextStyle: otp.pinCodeText,
        }}
        disabled={expired}
      />
      <View
        style={{
          justifyContent: "center",
          alignContent: "center",
          flexDirection: "row",
          marginBottom: 30,
        }}
      >
      <CountdownCircleTimer
        key={key}
        isPlaying
        duration={60}
        colors="#014D4E"
        onComplete={() => {
          setExpired(true)
        }}
      >
        {renderTime}
      </CountdownCircleTimer>
        
      </View>
      {expired ? (
        <View>
          <TouchableOpacity onPress={() => handleResend()}>
            <Text style={[common.text, styles.text]}>
              Didn't get OTP? Resend SMS
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <TouchableOpacity disabled>
            <Text style={[common.text, styles.text]}>
              Please enter your OTP to continue
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={goback.container}>
        <TouchableOpacity style={goback.button} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.White} />
          <Text style={[common.defaultText, goback.buttonText]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default verify;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  text: {
    textAlign: "center",
  },
  countdownText: {
    fontFamily: common.defaultHeading,
    fontSize: 24,
    color: Colors.Primary,
  },
});

const brand = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: Colors.White,
    paddingHorizontal: 10,
    paddingVertical: 30,
  },
});

const otp = StyleSheet.create({
  container: {
    padding: 40,
  },
  pinCodeText: {
    fontFamily: common.defaultTitle,
    color: Colors.Primary,
  },
});

const goback = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    marginTop: 30,
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
