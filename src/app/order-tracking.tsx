import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import { useAuth } from "../context/AuthContext";

const API_URL = "http://10.131.45.191:5001";

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  seller?: string;
};

type Order = {
  _id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
};

// =====================================================
// BUYER TRACKING STATUSES
// =====================================================

const statuses = [
  "PLACED",
  "SHIPPED",
  "DELIVERED",
];

export default function OrderTrackingScreen() {
  const { orderId } =
    useLocalSearchParams();

  const { token } = useAuth();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  // =====================================================
  // LOAD ORDER FROM BACKEND
  // =====================================================

  const loadOrder = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }

      if (!orderId) {
        Alert.alert(
          "Order Not Found",
          "No order ID was provided."
        );

        setLoading(false);
        return;
      }

      console.log(
        "GETTING ORDER:",
        orderId
      );

      const response = await fetch(
        `${API_URL}/api/orders/${String(
          orderId
        )}`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const data =
        await response.json();

      console.log(
        "ORDER DETAILS STATUS:",
        response.status
      );

      console.log(
        "ORDER DETAILS RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load order."
        );
      }

      if (!data.success || !data.order) {
        throw new Error(
          "The backend did not return valid order information."
        );
      }

      setOrder(data.order);
    } catch (error) {
      console.error(
        "GET ORDER DETAILS ERROR:",
        error
      );

      Alert.alert(
        "Unable to Load Order",
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // RELOAD WHEN SCREEN GETS FOCUS
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      loadOrder();
    }, [token, orderId])
  );

  // =====================================================
  // PULL TO REFRESH
  // =====================================================

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrder();
  };

  // =====================================================
  // STATUS INDEX
  // =====================================================

  const getStatusIndex = () => {
    if (!order) {
      return -1;
    }

    return statuses.indexOf(
      order.orderStatus
    );
  };

  const currentStatusIndex =
    getStatusIndex();

  // =====================================================
  // CANCELLED ORDER
  // =====================================================

  const isCancelled =
    order?.orderStatus ===
    "CANCELLED";

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.loadingContainer}
        >
          <ActivityIndicator
            size="large"
            color="#2E7D32"
          />

          <Text
            style={styles.loadingText}
          >
            Loading order tracking...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // ORDER NOT FOUND
  // =====================================================

  if (!order) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.errorContainer}
        >
          <Text
            style={styles.errorIcon}
          >
            📦
          </Text>

          <Text
            style={styles.errorTitle}
          >
            Order Not Found
          </Text>

          <Text
            style={styles.errorText}
          >
            We could not find this
            order.
          </Text>

          <TouchableOpacity
            style={
              styles.primaryButton
            }
            onPress={() =>
              router.replace("/orders")
            }
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              BACK TO MY ORDERS
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // SCREEN
  // =====================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={
              handleRefresh
            }
          />
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
            Order Tracking
          </Text>

          <View
            style={styles.headerSpace}
          />
        </View>

        {/* ORDER NUMBER */}

        <View style={styles.orderCard}>
          <Text
            style={styles.orderLabel}
          >
            Order Number
          </Text>

          <Text
            style={styles.orderNumber}
          >
            {order.orderNumber}
          </Text>

          <Text
            style={styles.orderDate}
          >
            {new Date(
              order.createdAt
            ).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            )}
          </Text>
        </View>

        {/* CURRENT STATUS */}

        <View
          style={
            isCancelled
              ? styles.cancelledStatusCard
              : styles.currentStatusCard
          }
        >
          <Text
            style={
              styles.currentStatusLabel
            }
          >
            Current Status
          </Text>

          <Text
            style={
              isCancelled
                ? styles.cancelledStatus
                : styles.currentStatus
            }
          >
            {order.orderStatus}
          </Text>
        </View>

        {/* CANCELLED MESSAGE */}

        {isCancelled && (
          <View
            style={styles.cancelledCard}
          >
            <Text
              style={
                styles.cancelledIcon
              }
            >
              ⚠
            </Text>

            <View
              style={
                styles.cancelledContent
              }
            >
              <Text
                style={
                  styles.cancelledTitle
                }
              >
                Order Cancelled
              </Text>

              <Text
                style={
                  styles.cancelledText
                }
              >
                This order has been
                cancelled and will not
                proceed to delivery.
              </Text>
            </View>
          </View>
        )}

        {/* NORMAL TRACKING */}

        {!isCancelled && (
          <View
            style={styles.trackingCard}
          >
            <Text
              style={styles.sectionTitle}
            >
              Delivery Status
            </Text>

            {statuses.map(
              (status, index) => {
                const completed =
                  currentStatusIndex >=
                  index;

                const active =
                  currentStatusIndex ===
                  index;

                return (
                  <View
                    key={status}
                    style={
                      styles.timelineRow
                    }
                  >
                    {/* TIMELINE */}

                    <View
                      style={
                        styles.timelineColumn
                      }
                    >
                      <View
                        style={[
                          styles.timelineCircle,
                          completed &&
                            styles.completedCircle,
                        ]}
                      >
                        {completed ? (
                          <Text
                            style={
                              styles.check
                            }
                          >
                            ✓
                          </Text>
                        ) : (
                          <Text
                            style={
                              styles.circleNumber
                            }
                          >
                            {index + 1}
                          </Text>
                        )}
                      </View>

                      {index <
                        statuses.length -
                          1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            currentStatusIndex >
                              index &&
                              styles.completedLine,
                          ]}
                        />
                      )}
                    </View>

                    {/* STATUS TEXT */}

                    <View
                      style={
                        styles.statusContent
                      }
                    >
                      <Text
                        style={[
                          styles.statusTitle,
                          completed &&
                            styles.completedText,
                        ]}
                      >
                        {status}
                      </Text>

                      <Text
                        style={
                          styles.statusDescription
                        }
                      >
                        {status ===
                          "PLACED" &&
                          "Your order has been placed successfully."}

                        {status ===
                          "SHIPPED" &&
                          "Your order has been shipped by the seller."}

                        {status ===
                          "DELIVERED" &&
                          "Your order has been delivered."}
                      </Text>

                      {active && (
                        <Text
                          style={
                            styles.currentText
                          }
                        >
                          Current status
                        </Text>
                      )}
                    </View>
                  </View>
                );
              }
            )}
          </View>
        )}

        {/* PRODUCTS */}

        <View
          style={styles.productsCard}
        >
          <Text
            style={styles.sectionTitle}
          >
            Order Items
          </Text>

          {order.items.map(
            (item, index) => (
              <View
                key={`${item.productId}-${index}`}
                style={styles.productRow}
              >
                <View
                  style={
                    styles.productInfo
                  }
                >
                  <Text
                    style={
                      styles.productName
                    }
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={
                      styles.productQuantity
                    }
                  >
                    Quantity:{" "}
                    {item.quantity}
                  </Text>
                </View>

                <Text
                  style={
                    styles.productPrice
                  }
                >
                  ₹
                  {(
                    Number(
                      item.price || 0
                    ) *
                    Number(
                      item.quantity || 0
                    )
                  ).toFixed(2)}
                </Text>
              </View>
            )
          )}

          <View
            style={styles.divider}
          />

          <View
            style={styles.totalRow}
          >
            <Text
              style={styles.totalLabel}
            >
              Total
            </Text>

            <Text
              style={styles.totalValue}
            >
              ₹
              {Number(
                order.totalAmount || 0
              ).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* DELIVERY ADDRESS */}

        <View
          style={styles.addressCard}
        >
          <Text
            style={styles.sectionTitle}
          >
            Delivery Address
          </Text>

          <Text
            style={styles.addressName}
          >
            {order.customerName}
          </Text>

          <Text
            style={styles.addressText}
          >
            {order.address}
          </Text>

          <Text
            style={styles.addressText}
          >
            {order.city} -{" "}
            {order.pincode}
          </Text>

          <Text
            style={styles.addressText}
          >
            Phone: {order.phone}
          </Text>
        </View>

        {/* PAYMENT */}

        <View
          style={styles.paymentCard}
        >
          <Text
            style={styles.sectionTitle}
          >
            Payment
          </Text>

          <View
            style={styles.paymentRow}
          >
            <Text
              style={styles.paymentLabel}
            >
              Method
            </Text>

            <Text
              style={styles.paymentValue}
            >
              {order.paymentMethod}
            </Text>
          </View>

          <View
            style={styles.paymentRow}
          >
            <Text
              style={styles.paymentLabel}
            >
              Status
            </Text>

            <Text
              style={styles.paymentValue}
            >
              {order.paymentStatus}
            </Text>
          </View>
        </View>

        {/* BACK BUTTON */}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            router.replace("/orders")
          }
          activeOpacity={0.8}
        >
          <Text
            style={
              styles.primaryButtonText
            }
          >
            BACK TO MY ORDERS
          </Text>
        </TouchableOpacity>

        {/* SHOPPING BUTTON */}

        <TouchableOpacity
          style={
            styles.secondaryButton
          }
          onPress={() =>
            router.replace("/")
          }
          activeOpacity={0.8}
        >
          <Text
            style={
              styles.secondaryButtonText
            }
          >
            CONTINUE SHOPPING
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F5",
  },

  scrollContent: {
    paddingBottom: 35,
  },

  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },

  back: {
    fontSize: 16,
    color: "#2E7D32",
    fontWeight: "600",
  },

  title: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#222",
  },

  headerSpace: {
    width: 45,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#666",
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  errorIcon: {
    fontSize: 55,
    marginBottom: 15,
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },

  errorText: {
    fontSize: 15,
    color: "#777",
    marginTop: 8,
    marginBottom: 25,
  },

  orderCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    padding: 18,
    borderRadius: 14,
    elevation: 2,
  },

  orderLabel: {
    fontSize: 13,
    color: "#777",
  },

  orderNumber: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#222",
    marginTop: 4,
  },

  orderDate: {
    fontSize: 13,
    color: "#777",
    marginTop: 5,
  },

  currentStatusCard: {
    backgroundColor: "#E8F5E9",
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },

  cancelledStatusCard: {
    backgroundColor: "#FFEBEE",
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },

  currentStatusLabel: {
    fontSize: 14,
    color: "#555",
  },

  currentStatus: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 6,
  },

  cancelledStatus: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#C62828",
    marginTop: 6,
  },

  cancelledCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FFCDD2",
    flexDirection: "row",
    alignItems: "flex-start",
    elevation: 1,
  },

  cancelledIcon: {
    fontSize: 25,
    marginRight: 12,
  },

  cancelledContent: {
    flex: 1,
  },

  cancelledTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#C62828",
  },

  cancelledText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginTop: 5,
  },

  trackingCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    padding: 20,
    borderRadius: 14,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 18,
  },

  timelineRow: {
    flexDirection: "row",
    minHeight: 90,
  },

  timelineColumn: {
    width: 42,
    alignItems: "center",
  },

  timelineCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#BDBDBD",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  completedCircle: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },

  check: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  circleNumber: {
    color: "#999",
    fontSize: 13,
    fontWeight: "bold",
  },

  timelineLine: {
    width: 3,
    flex: 1,
    backgroundColor: "#D5D5D5",
    marginVertical: 2,
  },

  completedLine: {
    backgroundColor: "#2E7D32",
  },

  statusContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },

  statusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#777",
  },

  completedText: {
    color: "#2E7D32",
  },

  statusDescription: {
    fontSize: 13,
    color: "#777",
    lineHeight: 19,
    marginTop: 5,
  },

  currentText: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "bold",
    marginTop: 5,
  },

  productsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    borderRadius: 14,
    elevation: 2,
  },

  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },

  productInfo: {
    flex: 1,
    paddingRight: 10,
  },

  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  productQuantity: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },

  productPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 12,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
  },

  totalValue: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#2E7D32",
  },

  addressCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    borderRadius: 14,
    elevation: 2,
  },

  addressName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },

  addressText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 21,
  },

  paymentCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    borderRadius: 14,
    elevation: 2,
  },

  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  paymentLabel: {
    fontSize: 14,
    color: "#777",
  },

  paymentValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },

  primaryButton: {
    backgroundColor: "#2E7D32",
    marginHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  secondaryButton: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2E7D32",
  },

  secondaryButtonText: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "bold",
  },
});