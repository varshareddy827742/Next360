import { useEffect } from "react";
import { Stack, router, useSegments } from "expo-router";

import { CartProvider } from "../context/CartContext";
import { OrderProvider } from "../context/OrderContext";
import { WalletProvider } from "../context/WalletContext";
import {
  AuthProvider,
  useAuth,
} from "../context/AuthContext";

function AuthGate() {
  const { token, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) {
      return;
    }

    const currentRoute = segments[0];

    const isAuthScreen =
      currentRoute === "login" ||
      currentRoute === "register";

    if (!token && !isAuthScreen) {
      router.replace("/login");
      return;
    }

    if (token && isAuthScreen) {
      router.replace("/");
    }
  }, [token, loading, segments]);

  if (loading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="login"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="register"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="product-details"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="cart"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="checkout"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="order-success"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="orders"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="order-tracking"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="wallet"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="profile"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <WalletProvider>
            <AuthGate />
          </WalletProvider>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}