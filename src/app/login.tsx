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

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async () => {
    if (
      !email.trim() ||
      !password.trim()
    ) {
      Alert.alert(
        "Login",
        "Please enter email and password."
      );

      return;
    }

    try {
      setLoading(true);

      const result = await login(
        email.trim(),
        password
      );

      if (!result.success) {
        Alert.alert(
          "Login Failed",
          result.message ||
            "Unable to login."
        );

        return;
      }

      Alert.alert(
        "Login Successful",
        "Welcome to Next360!",
        [
          {
            text: "CONTINUE",
            onPress: () => {
              router.replace("/");
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        "LOGIN SCREEN ERROR:",
        error
      );

      Alert.alert(
        "Login Error",
        "Something went wrong while logging in."
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
              Welcome Back
            </Text>

            <Text style={styles.subtitle}>
              Login to continue shopping
            </Text>
          </View>

          <View style={styles.form}>
            {/* EMAIL */}

            <Text style={styles.label}>
              Email
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!loading}
            />

            {/* PASSWORD */}

            <Text style={styles.label}>
              Password
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            {/* LOGIN BUTTON */}

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading &&
                  styles.disabledButton,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={
                    styles.loginButtonText
                  }
                >
                  LOGIN
                </Text>
              )}
            </TouchableOpacity>

            {/* REGISTER */}

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() =>
                router.push("/register")
              }
              disabled={loading}
            >
              <Text
                style={styles.registerText}
              >
                Don't have an account?{" "}
                <Text
                  style={
                    styles.registerBold
                  }
                >
                  Register
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
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  header: {
    alignItems: "center",
    marginBottom: 35,
  },

  logo: {
    fontSize: 34,
    fontWeight: "800",
    color: "#2e7d32",
    marginBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
  },

  subtitle: {
    fontSize: 15,
    color: "#777",
    marginTop: 8,
  },

  form: {
    width: "100%",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 14,
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

  loginButton: {
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

  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  registerButton: {
    alignItems: "center",
    marginTop: 22,
  },

  registerText: {
    color: "#666",
    fontSize: 14,
  },

  registerBold: {
    color: "#2e7d32",
    fontWeight: "700",
  },
});