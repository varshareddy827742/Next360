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

export default function OrdersScreen() {
  const { token } = useAuth();

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  // =====================================================
  // LOAD BUYER ORDERS
  // =====================================================

  const loadOrders = async () => {
    try {
      if (!token) {
        setOrders([]);
        setLoading(false);
        return;
      }

      console.log("GETTING MY ORDERS...");

      const response = await fetch(
        `${API_URL}/api/orders`,
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
        "MY ORDERS STATUS:",
        response.status
      );

      console.log(
        "MY ORDERS RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load orders."
        );
      }

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );
    } catch (error) {
      console.error(
        "GET MY ORDERS ERROR:",
        error
      );

      Alert.alert(
        "Unable to Load Orders",
        error instanceof Error
          ? error.message
          : "Something went wrong while loading your orders."
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
      loadOrders();
    }, [token])
  );

  // =====================================================
  // PULL TO REFRESH
  // =====================================================

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  // =====================================================
  // TRACK ORDER
  // =====================================================

  const handleTrackOrder = (
    order: Order
  ) => {
    router.push({
      pathname: "/order-tracking",

      params: {
        orderId: order._id,
      },
    });
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    dateString: string
  ) => {
    if (!dateString) {
      return "";
    }

    const date =
      new Date(dateString);

    if (
      Number.isNaN(date.getTime())
    ) {
      return "";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (
    status: string
  ) => {
    switch (status) {
      case "SHIPPED":
        return styles.shippedBadge;

      case "DELIVERED":
        return styles.deliveredBadge;

      case "CANCELLED":
        return styles.cancelledBadge;

      case "PLACED":
      default:
        return styles.placedBadge;
    }
  };

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
            Loading your orders...
          </Text>
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
          orders.length === 0
            ? styles.emptyScroll
            : styles.scrollContent
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
            My Orders
          </Text>

          <View
            style={styles.headerSpace}
          />
        </View>

        {/* EMPTY ORDERS */}

        {orders.length === 0 ? (
          <View
            style={styles.emptyContainer}
          >
            <Text
              style={styles.emptyIcon}
            >
              📦
            </Text>

            <Text
              style={styles.emptyTitle}
            >
              No Orders Yet
            </Text>

            <Text
              style={styles.emptyText}
            >
              Your placed orders will
              appear here.
            </Text>

            <TouchableOpacity
              style={styles.shopButton}
              onPress={() =>
                router.replace("/")
              }
              activeOpacity={0.8}
            >
              <Text
                style={
                  styles.shopButtonText
                }
              >
                START SHOPPING
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text
              style={styles.countText}
            >
              {orders.length}{" "}
              {orders.length === 1
                ? "order"
                : "orders"}
            </Text>

            {orders.map((order) => (
              <View
                key={order._id}
                style={styles.orderCard}
              >
                {/* ORDER HEADER */}

                <View
                  style={styles.orderHeader}
                >
                  <View>
                    <Text
                      style={
                        styles.orderNumber
                      }
                    >
                      {order.orderNumber}
                    </Text>

                    <Text
                      style={styles.date}
                    >
                      {formatDate(
                        order.createdAt
                      )}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      getStatusStyle(
                        order.orderStatus
                      ),
                    ]}
                  >
                    <Text
                      style={
                        styles.statusText
                      }
                    >
                      {order.orderStatus}
                    </Text>
                  </View>
                </View>

                {/* PRODUCTS */}

                <View
                  style={
                    styles.itemsContainer
                  }
                >
                  {order.items.map(
                    (item, index) => (
                      <View
                        key={`${order._id}-${index}`}
                        style={
                          styles.itemRow
                        }
                      >
                        <View
                          style={
                            styles.itemInfo
                          }
                        >
                          <Text
                            style={
                              styles.itemName
                            }
                            numberOfLines={
                              2
                            }
                          >
                            {item.name}
                          </Text>

                          <Text
                            style={
                              styles.itemQuantity
                            }
                          >
                            Qty:{" "}
                            {item.quantity}
                          </Text>
                        </View>

                        <Text
                          style={
                            styles.itemPrice
                          }
                        >
                          ₹
                          {(
                            item.price *
                            item.quantity
                          ).toFixed(2)}
                        </Text>
                      </View>
                    )
                  )}
                </View>

                {/* SUMMARY */}

                <View
                  style={styles.divider}
                />

                <View
                  style={styles.summaryRow}
                >
                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    Payment
                  </Text>

                  <Text
                    style={
                      styles.summaryValue
                    }
                  >
                    {order.paymentMethod}
                  </Text>
                </View>

                <View
                  style={styles.summaryRow}
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

                {/* TRACK BUTTON */}

                <TouchableOpacity
                  style={
                    styles.trackButton
                  }
                  onPress={() =>
                    handleTrackOrder(
                      order
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Text
                    style={
                      styles.trackButtonText
                    }
                  >
                    TRACK ORDER
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
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
    paddingBottom: 30,
  },

  emptyScroll: {
    flexGrow: 1,
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
    fontSize: 22,
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

  countText: {
    fontSize: 15,
    color: "#666",
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
  },

  orderCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 18,
    borderRadius: 14,
    elevation: 2,
  },

  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  orderNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },

  date: {
    fontSize: 13,
    color: "#777",
    marginTop: 5,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  placedBadge: {
    backgroundColor: "#FFF3CD",
  },

  shippedBadge: {
    backgroundColor: "#E3F2FD",
  },

  deliveredBadge: {
    backgroundColor: "#E8F5E9",
  },

  cancelledBadge: {
    backgroundColor: "#FFEBEE",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#555",
  },

  itemsContainer: {
    marginTop: 18,
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },

  itemInfo: {
    flex: 1,
    paddingRight: 10,
  },

  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  itemQuantity: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },

  itemPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 12,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 9,
  },

  summaryLabel: {
    fontSize: 14,
    color: "#777",
  },

  summaryValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
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

  trackButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 12,
  },

  trackButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 55,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },

  emptyText: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 25,
  },

  shopButton: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 9,
  },

  shopButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});