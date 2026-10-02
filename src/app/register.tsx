import React, { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import { useAuth } from "../context/AuthContext";

export default function RegisterScreen() {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [address, setAddress] =
    useState("");

  const [city, setCity] = useState("");
  const [pincode, setPincode] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegister = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password.trim()
    ) {
      Alert.alert(
        "Registration",
        "Name, email, phone and password are required."
      );

      return;
    }

    try {
      setLoading(true);

      const result = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
      });

      if (!result.success) {
        Alert.alert(
          "Registration Failed",
          result.message ||
            "Unable to create account."
        );

        return;
      }

      Alert.alert(
        "Registration Successful",
        "Your buyer account has been created.",
        [
          {
            text: "LOGIN",
            onPress: () => {
              router.replace("/login");
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        "REGISTRATION ERROR:",
        error
      );

      Alert.alert(
        "Registration Error",
        "Something went wrong while creating your account."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.logo}>
              Next360
            </Text>

            <Text style={styles.title}>
              Create Account
            </Text>

            <Text style={styles.subtitle}>
              Create your buyer account
            </Text>
          </View>

          <View style={styles.form}>
            {/* NAME */}

            <Text style={styles.label}>
              Full Name *
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />

            {/* EMAIL */}

            <Text style={styles.label}>
              Email *
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            {/* PHONE */}

            <Text style={styles.label}>
              Phone *
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor="#888"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!loading}
            />

            {/* PASSWORD */}

            <Text style={styles.label}>
              Password *
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            {/* ADDRESS */}

            <Text style={styles.label}>
              Address
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
              ]}
              placeholder="Enter delivery address"
              placeholderTextColor="#888"
              value={address}
              onChangeText={setAddress}
              multiline
              editable={!loading}
            />

            {/* CITY */}

            <Text style={styles.label}>
              City
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter city"
              placeholderTextColor="#888"
              value={city}
              onChangeText={setCity}
              editable={!loading}
            />

            {/* PINCODE */}

            <Text style={styles.label}>
              Pincode
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter pincode"
              placeholderTextColor="#888"
              value={pincode}
              onChangeText={setPincode}
              keyboardType="number-pad"
              editable={!loading}
            />

            {/* CREATE ACCOUNT */}

            <TouchableOpacity
              style={[
                styles.registerButton,
                loading &&
                  styles.disabledButton,
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={styles.buttonText}
                >
                  CREATE ACCOUNT
                </Text>
              )}
            </TouchableOpacity>

            {/* LOGIN */}

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() =>
                router.replace("/login")
              }
              disabled={loading}
            >
              <Text
                style={styles.loginText}
              >
                Already have an account?{" "}
                <Text
                  style={styles.loginBold}
                >
                  Login
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// =======================================================
// STYLES
// =======================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f8f5",
  },

  container: {
    flex: 1,
  },

  content: {
    padding: 24,
    paddingBottom: 40,
  },

  header: {
    alignItems: "center",
    marginBottom: 25,
  },

  logo: {
    fontSize: 34,
    fontWeight: "800",
    color: "#2e7d32",
    marginBottom: 10,
  },

  title: {
    fontSize: 27,
    fontWeight: "700",
    color: "#222",
  },

  subtitle: {
    fontSize: 15,
    color: "#777",
    marginTop: 7,
  },

  form: {
    width: "100%",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 7,
    marginTop: 13,
  },

  input: {
    height: 52,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#222",
  },

  multilineInput: {
    height: 90,
    paddingTop: 14,
    textAlignVertical: "top",
  },

  registerButton: {
    height: 52,
    backgroundColor: "#2e7d32",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  loginLink: {
    alignItems: "center",
    marginTop: 20,
  },

  loginText: {
    color: "#666",
    fontSize: 14,
  },

  loginBold: {
    color: "#2e7d32",
    fontWeight: "700",
  },
});