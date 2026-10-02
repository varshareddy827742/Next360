import React, {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { useCart } from "../context/CartContext";

// ==========================================
// BACKEND URL
// ==========================================

const API_URL =
  "http://10.131.45.191:5001";

// ==========================================
// PRODUCT TYPE
// ==========================================

type Product = {
  id: string;

  _id?: string;

  name: string;

  category: string;

  price: number;

  type:
    | "Organic"
    | "Natural"
    | "Eco-Friendly";

  seller: string;

  sellerId?: string | null;

  verified: boolean;

  description?: string;

  certificate?: string;

  stock: number;

  images?: string[];
};

// ==========================================
// PRODUCT DETAILS SCREEN
// ==========================================

export default function ProductDetailsScreen() {
  const params =
    useLocalSearchParams();

  // ========================================
  // GET PRODUCT ID FROM ROUTE
  // ========================================

  const productId = Array.isArray(
    params.id
  )
    ? params.id[0]
    : params.id;

  // ========================================
  // CART
  // ========================================

  const { addToCart } = useCart();

  // ========================================
  // STATE
  // ========================================

  const [
    product,
    setProduct,
  ] = useState<Product | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // ========================================
  // LOAD PRODUCT
  // ========================================

  useEffect(() => {
    if (productId) {
      loadProduct();
    } else {
      setLoading(false);

      setError(
        "Product ID is missing."
      );
    }
  }, [productId]);

  // ========================================
  // GET PRODUCT FROM BACKEND
  // ========================================

  const loadProduct = async () => {
    try {
      setLoading(true);

      setError("");

      console.log(
        "Loading product:",
        productId
      );

      const response =
        await fetch(
          `${API_URL}/api/products/${productId}`
        );

      console.log(
        "Product API status:",
        response.status
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        "PRODUCT DETAILS RESPONSE:",
        data
      );

      // ====================================
      // HANDLE POSSIBLE API RESPONSE SHAPES
      // ====================================

      let apiProduct = null;

      if (data.product) {
        apiProduct =
          data.product;
      } else if (data.data) {
        apiProduct =
          data.data;
      } else if (data._id) {
        apiProduct = data;
      }

      if (!apiProduct) {
        throw new Error(
          "Product was not found."
        );
      }

      // ====================================
      // NORMALIZE PRODUCT
      // ====================================

      const normalizedProduct: Product = {
        id: String(
          apiProduct._id ||
            apiProduct.id
        ),

        _id: apiProduct._id,

        name: apiProduct.name,

        category:
          apiProduct.category,

        price: Number(
          apiProduct.price
        ),

        type: apiProduct.type,

        seller:
          apiProduct.seller,

        sellerId:
          apiProduct.sellerId ||
          null,

        verified: Boolean(
          apiProduct.verified
        ),

        description:
          apiProduct.description ||
          "",

        certificate:
          apiProduct.certificate ||
          "",

        stock:
          typeof apiProduct.stock ===
          "number"
            ? apiProduct.stock
            : 0,

        images:
          Array.isArray(
            apiProduct.images
          )
            ? apiProduct.images
            : [],
      };

      setProduct(
        normalizedProduct
      );
    } catch (err) {
      console.error(
        "PRODUCT DETAILS LOAD ERROR:",
        err
      );

      setProduct(null);

      setError(
        "Unable to load this product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // ADD TO CART
  // ========================================

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    if (
      typeof product.stock ===
        "number" &&
      product.stock <= 0
    ) {
      return;
    }

    console.log(
      "ADD TO CART BUTTON PRESSED"
    );

    console.log(
      "PRODUCT:",
      product
    );

    const added =
      addToCart(product);

    if (added) {
      console.log(
        "PRODUCT ADDED TO CART"
      );

      router.push("/cart");
    } else {
      console.log(
        "PRODUCT WAS NOT ADDED TO CART"
      );
    }
  };

  // ========================================
  // LOADING SCREEN
  // ========================================

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={styles.back}
          >
            ← Back
          </Text>
        </TouchableOpacity>

        <View
          style={styles.centerBox}
        >
          <ActivityIndicator
            size="large"
            color="#2E7D32"
          />

          <Text
            style={styles.loadingText}
          >
            Loading product...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ========================================
  // ERROR SCREEN
  // ========================================

  if (
    error ||
    !product
  ) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={styles.back}
          >
            ← Back
          </Text>
        </TouchableOpacity>

        <View
          style={styles.errorBox}
        >
          <Text
            style={styles.errorText}
          >
            {error ||
              "Product not found"}
          </Text>

          <TouchableOpacity
            style={
              styles.retryButton
            }
            onPress={
              loadProduct
            }
          >
            <Text
              style={
                styles.retryText
              }
            >
              TRY AGAIN
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ========================================
  // STOCK
  // ========================================

  const outOfStock =
    typeof product.stock ===
      "number" &&
    product.stock <= 0;

  // ========================================
  // MAIN SCREEN
  // ========================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* BACK BUTTON */}

        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={styles.back}
          >
            ← Back
          </Text>
        </TouchableOpacity>

        {/* PRODUCT IMAGE */}

        <View
          style={styles.imageBox}
        >
          <Text
            style={
              styles.imageText
            }
          >
            Product Image
          </Text>
        </View>

        <View
          style={styles.content}
        >
          {/* PRODUCT NAME */}

          <Text
            style={
              styles.productName
            }
          >
            {product.name}
          </Text>

          {/* CATEGORY */}

          <Text
            style={styles.category}
          >
            {product.category}
          </Text>

          {/* VERIFICATION */}

          {product.verified &&
          product.type ===
            "Organic" ? (
            <View
              style={
                styles.verifiedBadge
              }
            >
              <Text
                style={
                  styles.verifiedText
                }
              >
                ✓ Verified Organic
              </Text>
            </View>
          ) : (
            <View
              style={
                styles.unverifiedBadge
              }
            >
              <Text
                style={
                  styles.unverifiedText
                }
              >
                {product.type}

                {product.type ===
                "Organic"
                  ? " • Unverified"
                  : ""}
              </Text>
            </View>
          )}

          {/* PRICE */}

          <Text
            style={styles.price}
          >
            ₹{product.price}
          </Text>

          {/* STOCK */}

          <View
            style={styles.stockBox}
          >
            <Text
              style={
                styles.stockText
              }
            >
              {outOfStock
                ? "Out of Stock"
                : `Stock Available: ${product.stock}`}
            </Text>
          </View>

          {/* DESCRIPTION */}

          <Text
            style={
              styles.sectionTitle
            }
          >
            Description
          </Text>

          <Text
            style={
              styles.description
            }
          >
            {product.description ||
              "No description available for this product."}
          </Text>

          {/* SELLER */}

          <Text
            style={
              styles.sectionTitle
            }
          >
            Seller Information
          </Text>

          <View
            style={styles.sellerBox}
          >
            <Text
              style={
                styles.sellerName
              }
            >
              {product.seller}
            </Text>

            <Text
              style={
                styles.sellerText
              }
            >
              {product.verified
                ? "Verified Seller"
                : "Seller"}
            </Text>
          </View>

          {/* CERTIFICATION */}

          {product.type ===
            "Organic" &&
            product.verified && (
              <>
                <Text
                  style={
                    styles.sectionTitle
                  }
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
                    verified by Next360
                    admin.
                  </Text>

                  {product.certificate ? (
                    <Text
                      style={
                        styles.certificateNumber
                      }
                    >
                      Certificate:{" "}
                      {
                        product.certificate
                      }
                    </Text>
                  ) : null}

                  <TouchableOpacity
                    style={
                      styles.viewCertificate
                    }
                    activeOpacity={
                      0.7
                    }
                  >
                    <Text
                      style={
                        styles.viewCertificateText
                      }
                    >
                      View Certificate
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

          {/* ADD TO CART */}

          <TouchableOpacity
            style={[
              styles.cartButton,
              outOfStock &&
                styles.cartButtonDisabled,
            ]}
            onPress={
              handleAddToCart
            }
            activeOpacity={0.7}
            disabled={
              outOfStock
            }
          >
            <Text
              style={
                styles.cartButtonText
              }
            >
              {outOfStock
                ? "OUT OF STOCK"
                : "ADD TO CART"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F7FAF5",
    },

    back: {
      fontSize: 18,
      fontWeight: "600",
      margin: 20,
      color: "#2E7D32",
    },

    imageBox: {
      height: 280,
      marginHorizontal: 20,
      borderRadius: 20,
      backgroundColor:
        "#E8EFE5",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    imageText: {
      fontSize: 18,
      color: "#666",
    },

    content: {
      padding: 20,
    },

    productName: {
      fontSize: 27,
      fontWeight: "bold",
      marginBottom: 6,
      color: "#222",
    },

    category: {
      fontSize: 15,
      color: "#777",
      marginBottom: 12,
    },

    verifiedBadge: {
      backgroundColor:
        "#DFF2DF",
      padding: 8,
      borderRadius: 8,
      alignSelf:
        "flex-start",
    },

    verifiedText: {
      fontWeight: "bold",
      fontSize: 13,
      color: "#2E7D32",
    },

    unverifiedBadge: {
      backgroundColor:
        "#EEEEEE",
      padding: 8,
      borderRadius: 8,
      alignSelf:
        "flex-start",
    },

    unverifiedText: {
      fontWeight: "600",
      fontSize: 13,
      color: "#555",
    },

    price: {
      fontSize: 26,
      fontWeight: "bold",
      marginTop: 15,
      color: "#2E7D32",
    },

    stockBox: {
      marginTop: 10,
      alignSelf:
        "flex-start",
      backgroundColor:
        "#FFFFFF",
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 8,
    },

    stockText: {
      fontSize: 13,
      color: "#555",
      fontWeight: "600",
    },

    sectionTitle: {
      fontSize: 19,
      fontWeight: "bold",
      marginTop: 25,
      marginBottom: 8,
      color: "#222",
    },

    description: {
      fontSize: 15,
      lineHeight: 23,
      color: "#555",
    },

    sellerBox: {
      backgroundColor:
        "#FFFFFF",
      padding: 15,
      borderRadius: 12,
    },

    sellerName: {
      fontSize: 17,
      fontWeight: "bold",
      color: "#222",
    },

    sellerText: {
      color: "#555",
      marginTop: 5,
    },

    certificateBox: {
      backgroundColor:
        "#FFFFFF",
      padding: 15,
      borderRadius: 12,
    },

    certificateTitle: {
      fontSize: 17,
      fontWeight: "bold",
      color: "#2E7D32",
    },

    certificateText: {
      color: "#555",
      marginTop: 8,
      lineHeight: 21,
    },

    certificateNumber: {
      color: "#333",
      marginTop: 8,
      fontWeight: "600",
    },

    viewCertificate: {
      marginTop: 12,
      alignSelf:
        "flex-start",
      backgroundColor:
        "#E8F5E9",
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 8,
    },

    viewCertificateText: {
      color: "#2E7D32",
      fontWeight: "bold",
    },

    cartButton: {
      backgroundColor:
        "#2E7D32",
      paddingVertical: 16,
      borderRadius: 12,
      marginTop: 30,
      marginBottom: 30,
      alignItems:
        "center",
    },

    cartButtonDisabled: {
      backgroundColor:
        "#999",
    },

    cartButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "bold",
    },

    centerBox: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    loadingText: {
      marginTop: 12,
      fontSize: 15,
      color: "#666",
    },

    errorBox: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 30,
    },

    errorText: {
      fontSize: 16,
      color: "#B71C1C",
      textAlign:
        "center",
      marginBottom: 18,
    },

    retryButton: {
      backgroundColor:
        "#2E7D32",
      paddingHorizontal: 20,
      paddingVertical: 11,
      borderRadius: 8,
    },

    retryText: {
      color: "#FFFFFF",
      fontWeight: "bold",
    },
  });