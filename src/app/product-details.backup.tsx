import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useCart } from "../context/CartContext";

const API_URL = "http://10.131.45.191:5001";

type Product = {
  _id: string;
  id?: string;
  name: string;
  category: string;
  price: number;
  type: "Organic" | "Natural" | "Eco-Friendly";
  seller: string;
  sellerId?: string | null;
  verified: boolean;
  description?: string;
  certificate?: string;
  stock: number;
  images?: string[];
};

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Loading product:", id);

      const response = await fetch(
        `${API_URL}/api/products/${id}`
      );

      console.log("Product API status:", response.status);

      const data = await response.json();

      console.log(
        "PRODUCT DETAILS RESPONSE:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load product"
        );
      }

      setProduct(data.product);
    } catch (err: any) {
      console.error(
        "PRODUCT DETAILS ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load product details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    console.log("ADD TO CART BUTTON PRESSED");

    if (!product) {
      Alert.alert(
        "Error",
        "Product information is unavailable."
      );
      return;
    }

    if (product.stock <= 0) {
      Alert.alert(
        "Out of Stock",
        "This product is currently out of stock."
      );
      return;
    }

    try {
      setAddingToCart(true);

      /*
       * IMPORTANT:
       * CartContext requires stock.
       */
      const cartProduct = {
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        type: product.type,
        seller: product.seller,
        sellerId: product.sellerId || null,
        verified: product.verified,
        description: product.description || "",
        stock: product.stock,
      };

      console.log(
        "PRODUCT:",
        cartProduct
      );

      addToCart(cartProduct);

      console.log(
        "PRODUCT ADDED TO CART"
      );

      Alert.alert(
        "Added to Cart",
        `${product.name} has been added to your cart.`,
        [
          {
            text: "Continue Shopping",
            style: "cancel",
          },
          {
            text: "View Cart",
            onPress: () =>
              router.push("/cart"),
          },
        ]
      );
    } catch (err) {
      console.error(
        "ADD TO CART ERROR:",
        err
      );

      Alert.alert(
        "Error",
        "Unable to add product to cart."
      );
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
          />

          <Text style={styles.loadingText}>
            Loading product...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorIcon}>
            ⚠️
          </Text>

          <Text style={styles.errorTitle}>
            Product Not Found
          </Text>

          <Text style={styles.errorText}>
            {error ||
              "Unable to load this product."}
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>
              GO BACK
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadProduct}
          >
            <Text style={styles.retryButtonText}>
              RETRY
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOutOfStock =
    product.stock <= 0;

  const isLowStock =
    product.stock > 0 &&
    product.stock <= 5;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
          >
            <Text style={styles.back}>
              ← Back
            </Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Product Details
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push("/cart")
            }
          >
            <Text style={styles.cartIcon}>
              🛒
            </Text>
          </TouchableOpacity>
        </View>

        {/* PRODUCT IMAGE */}
        <View style={styles.imageBox}>
          <Text style={styles.imageIcon}>
            🌿
          </Text>

          <Text style={styles.imageText}>
            {product.name}
          </Text>
        </View>

        {/* PRODUCT INFORMATION */}
        <View style={styles.productBox}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.typeBadge,
                product.type ===
                  "Organic" &&
                  styles.organicBadge,
                product.type ===
                  "Natural" &&
                  styles.naturalBadge,
                product.type ===
                  "Eco-Friendly" &&
                  styles.ecoBadge,
              ]}
            >
              <Text style={styles.badgeText}>
                {product.type}
              </Text>
            </View>

            {product.verified && (
              <View
                style={styles.verifiedBadge}
              >
                <Text
                  style={
                    styles.verifiedText
                  }
                >
                  ✓ Verified
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.productName}>
            {product.name}
          </Text>

          <Text style={styles.category}>
            {product.category}
          </Text>

          <Text style={styles.price}>
            ₹{product.price}
          </Text>

          {/* STOCK */}
          <View style={styles.stockBox}>
            <Text style={styles.stockLabel}>
              Stock
            </Text>

            <Text
              style={[
                styles.stockValue,
                isOutOfStock &&
                  styles.outOfStock,
                isLowStock &&
                  styles.lowStock,
              ]}
            >
              {isOutOfStock
                ? "Out of Stock"
                : `${product.stock} available`}
            </Text>
          </View>

          {isLowStock && (
            <Text style={styles.warningText}>
              ⚠ Only {product.stock} left
            </Text>
          )}
        </View>

        {/* DESCRIPTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Product Description
          </Text>

          <Text style={styles.description}>
            {product.description ||
              "No description available for this product."}
          </Text>
        </View>

        {/* SELLER INFORMATION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Seller Information
          </Text>

          <View style={styles.sellerBox}>
            <Text
              style={styles.sellerName}
            >
              {product.seller}
            </Text>

            <Text style={styles.sellerText}>
              ✓ Verified Seller
            </Text>
          </View>
        </View>

        {/* CERTIFICATION */}
        {product.type === "Organic" &&
          product.verified && (
            <View style={styles.section}>
              <Text
                style={styles.sectionTitle}
              >
                Certification
              </Text>

              <View
                style={
                  styles.certificateBox
                }
              >
                <Text
                  style={
                    styles.certificateTitle
                  }
                >
                  ✓ NPOP Certified
                </Text>

                <Text
                  style={
                    styles.certificateText
                  }
                >
                  Organic certification
                  verified by Next360.
                </Text>

                {product.certificate ? (
                  <Text
                    style={
                      styles.certificateNumber
                    }
                  >
                    Certificate:{" "}
                    {product.certificate}
                  </Text>
                ) : null}
              </View>
            </View>
          )}

        {/* PRODUCT ID */}
        <View style={styles.idBox}>
          <Text style={styles.idLabel}>
            Product ID
          </Text>

          <Text style={styles.idValue}>
            {product._id}
          </Text>
        </View>

        {/* ADD TO CART */}
        <TouchableOpacity
          style={[
            styles.addButton,
            (isOutOfStock ||
              addingToCart) &&
              styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={
            isOutOfStock ||
            addingToCart
          }
        >
          <Text style={styles.addButtonText}>
            {addingToCart
              ? "ADDING..."
              : isOutOfStock
              ? "OUT OF STOCK"
              : "ADD TO CART"}
          </Text>
        </TouchableOpacity>

        {/* BUY NOW / CART */}
        {!isOutOfStock && (
          <TouchableOpacity
            style={styles.viewCartButton}
            onPress={() =>
              router.push("/cart")
            }
          >
            <Text
              style={
                styles.viewCartButtonText
              }
            >
              VIEW MY CART
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8f5",
  },

  scrollContent: {
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },

  errorIcon: {
    fontSize: 45,
    marginBottom: 15,
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
  },

  errorText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },

  back: {
    fontSize: 16,
    color: "#2e7d32",
    fontWeight: "600",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },

  cartIcon: {
    fontSize: 22,
  },

  imageBox: {
    height: 240,
    margin: 16,
    borderRadius: 18,
    backgroundColor: "#e8f5e9",
    justifyContent: "center",
    alignItems: "center",
  },

  imageIcon: {
    fontSize: 65,
    marginBottom: 15,
  },

  imageText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4d6b4f",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  productBox: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
  },

  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },

  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  organicBadge: {
    backgroundColor: "#dff2df",
  },

  naturalBadge: {
    backgroundColor: "#e3f2fd",
  },

  ecoBadge: {
    backgroundColor: "#fff3cd",
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2e7d32",
  },

  verifiedBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  verifiedText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2e7d32",
  },

  productName: {
    fontSize: 25,
    fontWeight: "800",
    color: "#222",
    marginBottom: 6,
  },

  category: {
    fontSize: 15,
    color: "#777",
    marginBottom: 12,
  },

  price: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2e7d32",
    marginBottom: 15,
  },

  stockBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 15,
  },

  stockLabel: {
    fontSize: 15,
    color: "#666",
    fontWeight: "600",
  },

  stockValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2e7d32",
  },

  lowStock: {
    color: "#ef6c00",
  },

  outOfStock: {
    color: "#c62828",
  },

  warningText: {
    marginTop: 10,
    color: "#ef6c00",
    fontSize: 14,
    fontWeight: "600",
  },

  section: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 14,
    padding: 20,
    borderRadius: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 14,
  },

  description: {
    fontSize: 15,
    lineHeight: 23,
    color: "#555",
  },

  sellerBox: {
    backgroundColor: "#f7f8f5",
    padding: 15,
    borderRadius: 12,
  },

  sellerName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },

  sellerText: {
    fontSize: 14,
    color: "#2e7d32",
    fontWeight: "600",
  },

  certificateBox: {
    backgroundColor: "#f1f8e9",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#c8e6c9",
  },

  certificateTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2e7d32",
    marginBottom: 8,
  },

  certificateText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 21,
  },

  certificateNumber: {
    marginTop: 10,
    fontSize: 13,
    color: "#555",
    fontWeight: "600",
  },

  idBox: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 15,
    backgroundColor: "#eeeeee",
    borderRadius: 10,
  },

  idLabel: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
  },

  idValue: {
    fontSize: 12,
    color: "#555",
  },

  addButton: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: "#2e7d32",
    paddingVertical: 17,
    borderRadius: 12,
    alignItems: "center",
  },

  disabledButton: {
    backgroundColor: "#aaaaaa",
  },

  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },

  viewCartButton: {
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: "#2e7d32",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  viewCartButtonText: {
    color: "#2e7d32",
    fontSize: 15,
    fontWeight: "800",
  },

  backButton: {
    backgroundColor: "#2e7d32",
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 10,
    marginBottom: 12,
  },

  backButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  retryButton: {
    borderWidth: 1,
    borderColor: "#2e7d32",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryButtonText: {
    color: "#2e7d32",
    fontWeight: "700",
  },
});