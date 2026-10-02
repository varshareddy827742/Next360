import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useCart } from "../context/CartContext";

export default function CartScreen() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    getCartTotal,
  } = useCart();

  const total = getCartTotal();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>My Cart</Text>
        </View>

        {/* EMPTY CART */}
        {cart.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>

            <Text style={styles.emptyTitle}>
              Your cart is empty
            </Text>

            <Text style={styles.emptyText}>
              Add some products to continue shopping.
            </Text>

            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.push("/")}
            >
              <Text style={styles.shopButtonText}>
                START SHOPPING
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* CART ITEMS */}
            {cart.map((item) => (
              <View
                key={item.id}
                style={styles.cartItem}
              >
                {/* PRODUCT IMAGE */}
                <View style={styles.productImage}>
                  <Text style={styles.imageText}>
                    Product
                  </Text>
                </View>

                {/* PRODUCT INFORMATION */}
                <View style={styles.itemInfo}>
                  <Text style={styles.productName}>
                    {item.name}
                  </Text>

                  <Text style={styles.category}>
                    {item.category}
                  </Text>

                  <Text style={styles.price}>
                    ₹{item.price}
                  </Text>

                  {/* QUANTITY */}
                  <View style={styles.quantityRow}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() =>
                        decreaseQuantity(item.id)
                      }
                    >
                      <Text style={styles.quantityButtonText}>
                        −
                      </Text>
                    </TouchableOpacity>

                    <Text style={styles.quantity}>
                      {item.quantity}
                    </Text>

                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() =>
                        increaseQuantity(item.id)
                      }
                    >
                      <Text style={styles.quantityButtonText}>
                        +
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* REMOVE */}
                  <TouchableOpacity
                    onPress={() =>
                      removeFromCart(item.id)
                    }
                  >
                    <Text style={styles.remove}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* ORDER SUMMARY */}
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>
                Order Summary
              </Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Subtotal
                </Text>

                <Text style={styles.summaryValue}>
                  ₹{total}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Delivery
                </Text>

                <Text style={styles.free}>
                  FREE
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>
                  Total
                </Text>

                <Text style={styles.totalValue}>
                  ₹{total}
                </Text>
              </View>

              {/* CHECKOUT */}
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={() =>
                  router.push("/checkout")
                }
              >
                <Text style={styles.checkoutText}>
                  PROCEED TO CHECKOUT
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAF5",
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

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 60,
  },

  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginBottom: 25,
  },

  shopButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
  },

  shopButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },

  cartItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },

  productImage: {
    width: 100,
    height: 100,
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },

  imageText: {
    color: "#2E7D32",
    fontWeight: "bold",
  },

  itemInfo: {
    flex: 1,
  },

  productName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 5,
  },

  category: {
    fontSize: 13,
    color: "#777",
    marginBottom: 5,
  },

  price: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
  },

  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },

  quantityButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },

  quantity: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 15,
  },

  remove: {
    color: "#D32F2F",
    fontSize: 14,
    fontWeight: "600",
  },

  summary: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },

  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 20,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  summaryLabel: {
    fontSize: 16,
    color: "#555",
  },

  summaryValue: {
    fontSize: 16,
    color: "#222",
  },

  free: {
    fontSize: 16,
    color: "#2E7D32",
    fontWeight: "bold",
  },

  divider: {
    height: 1,
    backgroundColor: "#DDDDDD",
    marginVertical: 10,
  },

  totalLabel: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#222",
  },

  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },

  checkoutButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  checkoutText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});