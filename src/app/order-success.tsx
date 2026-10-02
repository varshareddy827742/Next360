import React from "react";

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";

export default function OrderSuccessScreen() {
  const params = useLocalSearchParams();

  const orderNumber =
    typeof params.orderNumber === "string"
      ? params.orderNumber
      : "Order placed";

  const total =
    typeof params.total === "string"
      ? params.total
      : "";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* SUCCESS ICON */}
        <View style={styles.successCircle}>
          <Text style={styles.check}>✓</Text>
        </View>

        <Text style={styles.title}>
          Order Placed Successfully!
        </Text>

        <Text style={styles.message}>
          Thank you for shopping with Next360.
          {"\n"}
          Your order has been placed successfully.
        </Text>

        {/* ORDER DETAILS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Order Details
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>
              Order Number
            </Text>

            <Text style={styles.value}>
              {orderNumber}
            </Text>
          </View>

          {total ? (
            <View style={styles.row}>
              <Text style={styles.label}>
                Total
              </Text>

              <Text style={styles.total}>
                ₹{total}
              </Text>
            </View>
          ) : null}

          <View style={styles.row}>
            <Text style={styles.label}>
              Order Status
            </Text>

            <Text style={styles.status}>
              PLACED
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Payment
            </Text>

            <Text style={styles.value}>
              Confirmed
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Delivery
            </Text>

            <Text style={styles.value}>
              To your address
            </Text>
          </View>
        </View>

        {/* ONLY ONE VIEW MY ORDERS BUTTON */}
        <TouchableOpacity
          style={styles.ordersButton}
          activeOpacity={0.8}
          onPress={() => router.replace("/orders")}
        >
          <Text style={styles.ordersButtonText}>
            VIEW MY ORDERS
          </Text>
        </TouchableOpacity>

        {/* HOME */}
        <TouchableOpacity
          style={styles.homeButton}
          activeOpacity={0.8}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.homeButtonText}>
            CONTINUE SHOPPING
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAF5",
  },

  content: {
    padding: 24,
    alignItems: "center",
    paddingBottom: 40,
  },

  successCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 35,
    marginBottom: 28,
  },

  check: {
    color: "#FFFFFF",
    fontSize: 82,
    fontWeight: "bold",
    lineHeight: 90,
  },

  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#176B2C",
    textAlign: "center",
  },

  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 25,
    marginTop: 14,
    marginBottom: 25,
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 17,
  },

  label: {
    fontSize: 15,
    color: "#666",
    flex: 1,
  },

  value: {
    fontSize: 15,
    color: "#222",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },

  total: {
    fontSize: 17,
    color: "#2E7D32",
    fontWeight: "bold",
  },

  status: {
    fontSize: 15,
    color: "#2E7D32",
    fontWeight: "bold",
  },

  ordersButton: {
    width: "100%",
    backgroundColor: "#2E7D32",
    paddingVertical: 17,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 25,
  },

  ordersButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  homeButton: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2E7D32",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },

  homeButtonText: {
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "bold",
  },
});