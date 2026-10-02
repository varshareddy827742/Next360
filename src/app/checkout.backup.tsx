import React, { useState } from "react";

import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { useWallet } from "../context/WalletContext";

type PaymentMethod =
  | "Cash on Delivery"
  | "UPI"
  | "Wallet";

export default function CheckoutScreen() {
  const {
    cart,
    getCartTotal,
    clearCart,
  } = useCart();

  const { addOrder } = useOrders();

  const {
    balance,
    deductMoney,
  } = useWallet();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Cash on Delivery");

  const total = getCartTotal();

  const handlePlaceOrder = () => {
    // Check delivery details
    if (
      !name.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !pincode.trim()
    ) {
      Alert.alert(
        "Missing Details",
        "Please fill all delivery details."
      );
      return;
    }

    // Check cart
    if (cart.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Your cart is empty."
      );
      return;
    }

    // Check wallet balance
    if (paymentMethod === "Wallet") {
      if (balance < total) {
        Alert.alert(
          "Insufficient Wallet Balance",
          `Your wallet balance is ₹${balance.toFixed(
            2
          )}, but the order total is ₹${total.toFixed(
            2
          )}. Please add money to your wallet.`
        );

        return;
      }
    }

    const orderId = `NX360${Date.now()
      .toString()
      .slice(-6)}`;

    // Deduct wallet balance BEFORE creating order
    if (paymentMethod === "Wallet") {
      const paymentSuccessful = deductMoney(
        total,
        orderId
      );

      if (!paymentSuccessful) {
        Alert.alert(
          "Payment Failed",
          "Unable to deduct the amount from your wallet."
        );

        return;
      }
    }

    const newOrder = {
      id: orderId,

      date: new Date().toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),

      status: "PLACED" as const,

      total: total,

      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    addOrder(newOrder);

    clearCart();

    router.push("/order-success");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            Checkout
          </Text>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Delivery Address
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <TextInput
            style={[
              styles.input,
              styles.addressInput,
            ]}
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            multiline
          />

          <TextInput
            style={styles.input}
            placeholder="City"
            value={city}
            onChangeText={setCity}
          />

          <TextInput
            style={styles.input}
            placeholder="Pincode"
            keyboardType="number-pad"
            value={pincode}
            onChangeText={setPincode}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Payment Method
          </Text>

          {/* Cash on Delivery */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "Cash on Delivery" &&
                styles.selectedPayment,
            ]}
            onPress={() =>
              setPaymentMethod("Cash on Delivery")
            }
            activeOpacity={0.7}
          >
            <View style={styles.paymentLeft}>
              <Text style={styles.paymentIcon}>
                💵
              </Text>

              <View>
                <Text style={styles.paymentText}>
                  Cash on Delivery
                </Text>

                <Text style={styles.paymentDescription}>
                  Pay when your order arrives
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.radio,
                paymentMethod === "Cash on Delivery" &&
                  styles.radioSelected,
              ]}
            >
              {paymentMethod === "Cash on Delivery" && (
                <View style={styles.radioInner} />
              )}
            </View>
          </TouchableOpacity>

          {/* UPI */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "UPI" &&
                styles.selectedPayment,
            ]}
            onPress={() =>
              setPaymentMethod("UPI")
            }
            activeOpacity={0.7}
          >
            <View style={styles.paymentLeft}>
              <Text style={styles.paymentIcon}>
                📱
              </Text>

              <View>
                <Text style={styles.paymentText}>
                  UPI
                </Text>

                <Text style={styles.paymentDescription}>
                  Pay using UPI
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.radio,
                paymentMethod === "UPI" &&
                  styles.radioSelected,
              ]}
            >
              {paymentMethod === "UPI" && (
                <View style={styles.radioInner} />
              )}
            </View>
          </TouchableOpacity>

          {/* Wallet */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "Wallet" &&
                styles.selectedPayment,
            ]}
            onPress={() =>
              setPaymentMethod("Wallet")
            }
            activeOpacity={0.7}
          >
            <View style={styles.paymentLeft}>
              <Text style={styles.paymentIcon}>
                💰
              </Text>

              <View>
                <Text style={styles.paymentText}>
                  Next360 Wallet
                </Text>

                <Text style={styles.paymentDescription}>
                  Balance: ₹{balance.toFixed(2)}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.radio,
                paymentMethod === "Wallet" &&
                  styles.radioSelected,
              ]}
            >
              {paymentMethod === "Wallet" && (
                <View style={styles.radioInner} />
              )}
            </View>
          </TouchableOpacity>

          {/* Wallet warning */}
          {paymentMethod === "Wallet" &&
            balance < total && (
              <View style={styles.warningBox}>
                <Text style={styles.warningTitle}>
                  ⚠ Insufficient Wallet Balance
                </Text>

                <Text style={styles.warningText}>
                  You need ₹
                  {(total - balance).toFixed(2)} more
                  in your wallet.
                </Text>

                <TouchableOpacity
                  style={styles.addMoneyButton}
                  onPress={() =>
                    router.push("/wallet")
                  }
                  activeOpacity={0.7}
                >
                  <Text
                    style={styles.addMoneyButtonText}
                  >
                    ADD MONEY TO WALLET
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          {/* UPI Demo Note */}
          {paymentMethod === "UPI" && (
            <View style={styles.upiNote}>
              <Text style={styles.upiNoteTitle}>
                📱 UPI Payment
              </Text>

              <Text style={styles.upiNoteText}>
                This is currently a demo UPI payment
                flow. Real UPI gateway integration will
                be added later.
              </Text>
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Order Summary
          </Text>

          {cart.length === 0 ? (
            <Text style={styles.emptyText}>
              Your cart is empty.
            </Text>
          ) : (
            cart.map((item) => (
              <View
                key={item.id}
                style={styles.productRow}
              >
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>
                    {item.name}
                  </Text>

                  <Text style={styles.quantityText}>
                    Quantity: {item.quantity}
                  </Text>
                </View>

                <Text style={styles.productPrice}>
                  ₹{item.price * item.quantity}
                </Text>
              </View>
            ))
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalText}>
              Total
            </Text>

            <Text style={styles.totalPrice}>
              ₹{total}
            </Text>
          </View>
        </View>

        {/* Place Order */}
        <TouchableOpacity
          style={[
            styles.orderButton,
            paymentMethod === "Wallet" &&
              balance < total &&
              styles.disabledButton,
          ]}
          activeOpacity={0.7}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.orderButtonText}>
            PLACE ORDER
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

  scrollContent: {
    paddingBottom: 30,
  },

  header: {
    padding: 20,
    paddingTop: 25,
  },

  back: {
    fontSize: 16,
    color: "#2E7D32",
    marginBottom: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B5E20",
  },

  section: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 18,
    borderRadius: 12,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },

  addressInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 9,
    padding: 14,
    marginBottom: 10,
  },

  selectedPayment: {
    borderColor: "#2E7D32",
    backgroundColor: "#E8F5E9",
  },

  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  paymentIcon: {
    fontSize: 25,
    marginRight: 12,
  },

  paymentText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },

  paymentDescription: {
    fontSize: 11,
    color: "#777",
    marginTop: 3,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#AAAAAA",
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    borderColor: "#2E7D32",
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2E7D32",
  },

  warningBox: {
    backgroundColor: "#FFF3E0",
    borderWidth: 1,
    borderColor: "#FFCC80",
    borderRadius: 9,
    padding: 13,
    marginTop: 3,
  },

  warningTitle: {
    color: "#E65100",
    fontSize: 13,
    fontWeight: "bold",
  },

  warningText: {
    color: "#795548",
    fontSize: 12,
    marginTop: 5,
  },

  addMoneyButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    borderRadius: 7,
    alignItems: "center",
    marginTop: 10,
  },

  addMoneyButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  upiNote: {
    backgroundColor: "#E8F5E9",
    borderRadius: 9,
    padding: 13,
    marginTop: 2,
  },

  upiNoteTitle: {
    color: "#1B5E20",
    fontSize: 13,
    fontWeight: "bold",
  },

  upiNoteText: {
    color: "#555",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },

  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  productInfo: {
    flex: 1,
    marginRight: 10,
  },

  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  quantityText: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },

  productPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 5,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  totalText: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#222",
  },

  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },

  emptyText: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    paddingVertical: 15,
  },

  orderButton: {
    backgroundColor: "#2E7D32",
    marginHorizontal: 16,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  disabledButton: {
    backgroundColor: "#A5A5A5",
  },

  orderButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});