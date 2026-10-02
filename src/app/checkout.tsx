import React, { useState } from "react";

import {
  ActivityIndicator,
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
import { useAuth } from "../context/AuthContext";

const API_URL = "http://10.131.45.191:5001";

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

  const { token, user } = useAuth();

  const [name, setName] = useState(
    user?.name || ""
  );

  const [phone, setPhone] = useState(
    user?.phone || ""
  );

  const [address, setAddress] = useState(
    user?.address || ""
  );

  const [city, setCity] = useState(
    user?.city || ""
  );

  const [pincode, setPincode] = useState(
    user?.pincode || ""
  );

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>(
      "Cash on Delivery"
    );

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const total = getCartTotal();

  const handlePlaceOrder = async () => {
    if (placingOrder) {
      return;
    }

    if (!token) {
      Alert.alert(
        "Login Required",
        "Please login before placing an order.",
        [
          {
            text: "LOGIN",
            onPress: () =>
              router.replace("/login"),
          },
          {
            text: "CANCEL",
            style: "cancel",
          },
        ]
      );

      return;
    }

    if (cart.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Your cart is empty."
      );

      return;
    }

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

    setPlacingOrder(true);

    try {
      /*
       * Convert the mobile payment label
       * into the backend payment method.
       */
      const backendPaymentMethod =
        paymentMethod === "Cash on Delivery"
          ? "COD"
          : paymentMethod === "UPI"
          ? "UPI"
          : "WALLET";

      /*
       * Convert cart items into the format
       * expected by the backend.
       */
      const orderItems = cart.map(
        (item) => ({
          productId: item.id,
          quantity: item.quantity,
        })
      );

      /*
       * STEP 1
       *
       * Create the order.
       */
      const orderResponse =
        await fetch(
          `${API_URL}/api/orders`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              customerName:
                name.trim(),

              phone:
                phone.trim(),

              address:
                address.trim(),

              city:
                city.trim(),

              pincode:
                pincode.trim(),

              items: orderItems,

              paymentMethod:
                backendPaymentMethod,
            }),
          }
        );

      const orderData =
        await orderResponse.json();

      /*
       * Order creation failed.
       */
      if (!orderResponse.ok) {
        Alert.alert(
          "Order Failed",
          orderData.message ||
            "Unable to place your order."
        );

        return;
      }

      /*
       * Validate backend response.
       */
      if (
        !orderData.success ||
        !orderData.order
      ) {
        Alert.alert(
          "Order Failed",
          "The backend did not return a valid order."
        );

        return;
      }

      const createdOrder =
        orderData.order;

      /*
       * STEP 2
       *
       * Process the payment.
       *
       * COD:
       * Payment remains PENDING.
       *
       * UPI:
       * Backend performs demo UPI payment.
       *
       * WALLET:
       * Backend checks balance,
       * deducts wallet money,
       * creates a debit transaction,
       * and marks payment as PAID.
       */
      console.log(
  "========== PAYMENT REQUEST =========="
);

console.log(
  "Payment Method:",
  backendPaymentMethod
);

console.log(
  "Order ID:",
  createdOrder._id
);

console.log(
  "Order Total:",
  createdOrder.totalAmount
);

const paymentResponse =
  await fetch(
    `${API_URL}/api/payments`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              orderId:
                createdOrder._id,

              paymentMethod:
                backendPaymentMethod,
            }),
          }
        );

      const paymentData =
        await paymentResponse.json();
        console.log(
  "========== PAYMENT RESPONSE =========="
);

console.log(
  "Payment HTTP Status:",
  paymentResponse.status
);

console.log(
  "Payment Response:",
  paymentData
);

      /*
       * Payment failed.
       */
      if (!paymentResponse.ok) {
        console.error(
          "PAYMENT FAILED:",
          paymentData
        );

        Alert.alert(
          "Payment Failed",
          paymentData.message ||
            "Unable to process payment."
        );

        /*
         * IMPORTANT:
         *
         * Do NOT clear the cart here.
         *
         * The cart remains available so
         * the user can retry payment.
         */
        return;
      }

      /*
       * Validate payment response.
       */
      if (
        !paymentData.success ||
        !paymentData.payment
      ) {
        Alert.alert(
          "Payment Failed",
          "The payment server did not return a valid response."
        );

        return;
      }

      /*
       * STEP 3
       *
       * Everything succeeded.
       *
       * Now clear the cart.
       */
      clearCart();

      /*
       * STEP 4
       *
       * Navigate to Order Success.
       */
      router.push({
        pathname:
          "/order-success",

        params: {
          orderNumber:
            createdOrder.orderNumber,

          total: String(
            createdOrder.totalAmount
          ),
        },
      });
    } catch (error) {
      console.error(
        "CHECKOUT ERROR:",
        error
      );

      Alert.alert(
        "Checkout Error",
        error instanceof Error
          ? error.message
          : "Unable to complete checkout."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              router.back()
            }
            activeOpacity={0.7}
          >
            <Text style={styles.back}>
              ← Back
            </Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            Checkout
          </Text>

          <Text style={styles.subtitle}>
            Complete your order
          </Text>
        </View>

        {/* DELIVERY ADDRESS */}

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Delivery Address
          </Text>

          <Text style={styles.label}>
            Full Name
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter full name"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>
            Phone Number
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.label}>
            Address
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.multilineInput,
            ]}
            placeholder="Enter delivery address"
            multiline
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.label}>
            City
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter city"
            value={city}
            onChangeText={setCity}
          />

          <Text style={styles.label}>
            Pincode
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter pincode"
            keyboardType="number-pad"
            value={pincode}
            onChangeText={setPincode}
          />
        </View>

        {/* PAYMENT METHOD */}

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Payment Method
          </Text>

          {/* COD */}

          <TouchableOpacity
            style={[
              styles.paymentOption,

              paymentMethod ===
                "Cash on Delivery" &&
                styles.selectedPaymentOption,
            ]}
            onPress={() =>
              setPaymentMethod(
                "Cash on Delivery"
              )
            }
            activeOpacity={0.7}
          >
            <View
              style={styles.paymentLeft}
            >
              <Text
                style={styles.paymentIcon}
              >
                💵
              </Text>

              <View>
                <Text
                  style={styles.paymentText}
                >
                  Cash on Delivery
                </Text>

                <Text
                  style={
                    styles.paymentDescription
                  }
                >
                  Pay when your order arrives
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.radio,

                paymentMethod ===
                  "Cash on Delivery" &&
                  styles.radioSelected,
              ]}
            >
              {paymentMethod ===
                "Cash on Delivery" && (
                <View
                  style={
                    styles.radioInner
                  }
                />
              )}
            </View>
          </TouchableOpacity>

          {/* UPI */}

          <TouchableOpacity
            style={[
              styles.paymentOption,

              paymentMethod === "UPI" &&
                styles.selectedPaymentOption,
            ]}
            onPress={() =>
              setPaymentMethod("UPI")
            }
            activeOpacity={0.7}
          >
            <View
              style={styles.paymentLeft}
            >
              <Text
                style={styles.paymentIcon}
              >
                📱
              </Text>

              <View>
                <Text
                  style={styles.paymentText}
                >
                  UPI
                </Text>

                <Text
                  style={
                    styles.paymentDescription
                  }
                >
                  Pay using UPI
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.radio,

                paymentMethod ===
                  "UPI" &&
                  styles.radioSelected,
              ]}
            >
              {paymentMethod ===
                "UPI" && (
                <View
                  style={
                    styles.radioInner
                  }
                />
              )}
            </View>
          </TouchableOpacity>

          {/* WALLET */}

          <TouchableOpacity
            style={[
              styles.paymentOption,

              paymentMethod === "Wallet" &&
                styles.selectedPaymentOption,
            ]}
            onPress={() =>
              setPaymentMethod(
                "Wallet"
              )
            }
            activeOpacity={0.7}
          >
            <View
              style={styles.paymentLeft}
            >
              <Text
                style={styles.paymentIcon}
              >
                💳
              </Text>

              <View>
                <Text
                  style={styles.paymentText}
                >
                  Next360 Wallet
                </Text>

                <Text
                  style={
                    styles.paymentDescription
                  }
                >
                  Use your Next360 wallet
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.radio,

                paymentMethod ===
                  "Wallet" &&
                  styles.radioSelected,
              ]}
            >
              {paymentMethod ===
                "Wallet" && (
                <View
                  style={
                    styles.radioInner
                  }
                />
              )}
            </View>
          </TouchableOpacity>

          {/* WALLET INFORMATION */}

          {paymentMethod ===
            "Wallet" && (
            <View
              style={
                styles.walletInfo
              }
            >
              <Text
                style={
                  styles.walletInfoTitle
                }
              >
                Wallet Payment
              </Text>

              <Text
                style={
                  styles.walletInfoText
                }
              >
                Your wallet balance will
                be checked and deducted
                securely by the Next360
                backend.
              </Text>
            </View>
          )}

          {/* UPI INFORMATION */}

          {paymentMethod === "UPI" && (
            <View
              style={styles.walletInfo}
            >
              <Text
                style={
                  styles.walletInfoTitle
                }
              >
                UPI Payment
              </Text>

              <Text
                style={
                  styles.walletInfoText
                }
              >
                This is currently a demo
                UPI payment flow.
              </Text>
            </View>
          )}
        </View>

        {/* ORDER SUMMARY */}

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Order Summary
          </Text>

          {cart.map((item) => (
            <View
              key={item.id}
              style={
                styles.summaryItem
              }
            >
              <View
                style={
                  styles.summaryItemInfo
                }
              >
                <Text
                  style={
                    styles.summaryItemName
                  }
                >
                  {item.name}
                </Text>

                <Text
                  style={
                    styles.summaryItemQuantity
                  }
                >
                  Qty: {item.quantity}
                </Text>
              </View>

              <Text
                style={
                  styles.summaryItemPrice
                }
              >
                ₹
                {(
                  item.price *
                  item.quantity
                ).toFixed(2)}
              </Text>
            </View>
          ))}

          <View
            style={styles.totalRow}
          >
            <Text
              style={styles.totalLabel}
            >
              Total
            </Text>

            <Text
              style={styles.totalAmount}
            >
              ₹{total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* PLACE ORDER */}

        <TouchableOpacity
          style={[
            styles.placeOrderButton,

            placingOrder &&
              styles.disabledButton,
          ]}
          onPress={
            handlePlaceOrder
          }
          disabled={placingOrder}
          activeOpacity={0.8}
        >
          {placingOrder ? (
            <>
              <ActivityIndicator
                color="#FFFFFF"
                size="small"
              />

              <Text
                style={[
                  styles.placeOrderText,
                  {
                    marginTop: 6,
                  },
                ]}
              >
                PROCESSING...
              </Text>
            </>
          ) : (
            <Text
              style={
                styles.placeOrderText
              }
            >
              PLACE ORDER
            </Text>
          )}
        </TouchableOpacity>

        <Text
          style={styles.secureNote}
        >
          🔒 Your payment is processed
          securely by Next360.
        </Text>
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
    paddingBottom: 40,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
  },

  back: {
    fontSize: 16,
    color: "#2E7D32",
    marginBottom: 15,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1B5E20",
  },

  subtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },

  section: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 18,
    borderRadius: 14,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 7,
    marginTop: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },

  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },

  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    padding: 13,
    marginBottom: 10,
  },

  selectedPaymentOption: {
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
    fontWeight: "bold",
    color: "#333",
  },

  paymentDescription: {
    fontSize: 12,
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

  walletInfo: {
    backgroundColor: "#F1F8E9",
    borderRadius: 9,
    padding: 12,
    marginTop: 4,
  },

  walletInfoTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#2E7D32",
  },

  walletInfoText: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
    lineHeight: 17,
  },

  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  summaryItemInfo: {
    flex: 1,
    paddingRight: 10,
  },

  summaryItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  summaryItemQuantity: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },

  summaryItemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#DDDDDD",
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  totalAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1B5E20",
  },

  placeOrderButton: {
    backgroundColor: "#2E7D32",
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.7,
  },

  placeOrderText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  secureNote: {
    textAlign: "center",
    fontSize: 11,
    color: "#888",
    marginTop: 10,
    marginHorizontal: 20,
  },
});