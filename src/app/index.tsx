import React, { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "http://10.131.45.191:5001";

type Product = {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  price: number;
  type: "Organic" | "Natural" | "Eco-Friendly";
  seller: string;
  verified: boolean;
  description?: string;
  certificate?: string;
  stock?: number;
  images?: string[];
};

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/products`);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      console.log("PRODUCT API RESPONSE:", data);

      if (Array.isArray(data)) {
        setProducts(data);
      } else if (Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("PRODUCT LOAD ERROR:", err);
      setError("Unable to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!verifiedOnly) {
      return products;
    }

    return products.filter(
      (product) =>
        product.type === "Organic" && product.verified === true
    );
  }, [products, verifiedOnly]);

  const openProduct = (id: string) => {
    router.push({
      pathname: "/product-details",
      params: {
        id,
      },
    });
  };

  const getProductId = (item: Product) => {
    return item._id || item.id || "";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>Next360</Text>

        <Text style={styles.subtitle}>
          Shop Natural. Shop Trusted.
        </Text>
      </View>

      {/* PAGE TITLE */}
      <Text style={styles.title}>
        Organic Products
      </Text>

      {/* VERIFIED FILTER */}
      <TouchableOpacity
        style={[
          styles.filterButton,
          verifiedOnly && styles.filterButtonActive,
        ]}
        activeOpacity={0.7}
        onPress={() => setVerifiedOnly((current) => !current)}
      >
        <Text style={styles.filterText}>
          {verifiedOnly
            ? "✓ Showing Verified Organic Only"
            : "✓ Show Verified Organic Only"}
        </Text>
      </TouchableOpacity>

      {/* CART AND ORDERS */}
      <View style={styles.middleButtons}>
        {/* MY CART */}
        <TouchableOpacity
          style={styles.middleButton}
          activeOpacity={0.7}
          onPress={() => {
            console.log("CART BUTTON PRESSED");
            router.push("/cart");
          }}
        >
          <Text style={styles.middleIcon}>🛒</Text>

          <Text style={styles.middleButtonText}>
            MY CART
          </Text>
        </TouchableOpacity>

        {/* MY ORDERS */}
        <TouchableOpacity
          style={styles.middleButton}
          activeOpacity={0.7}
          onPress={() => {
            console.log("ORDERS BUTTON PRESSED");
            router.push("/orders");
          }}
        >
          <Text style={styles.middleIcon}>📦</Text>

          <Text style={styles.middleButtonText}>
            MY ORDERS
          </Text>
        </TouchableOpacity>
      </View>

      {/* WALLET AND PROFILE */}
      <View style={styles.middleButtons}>
        {/* WALLET */}
        <TouchableOpacity
          style={styles.middleButton}
          activeOpacity={0.7}
          onPress={() => {
            console.log("WALLET BUTTON PRESSED");
            router.push("/wallet");
          }}
        >
          <Text style={styles.middleIcon}>💰</Text>

          <Text style={styles.middleButtonText}>
            WALLET
          </Text>
        </TouchableOpacity>

        {/* PROFILE */}
        <TouchableOpacity
          style={styles.middleButton}
          activeOpacity={0.7}
          onPress={() => {
            console.log("PROFILE BUTTON PRESSED");
            router.push("/profile");
          }}
        >
          <Text style={styles.middleIcon}>👤</Text>

          <Text style={styles.middleButtonText}>
            PROFILE
          </Text>
        </TouchableOpacity>
      </View>

      {/* LOADING */}
      {loading && (
        <View style={styles.centerMessage}>
          <ActivityIndicator size="large" color="#1B5E20" />

          <Text style={styles.messageText}>
            Loading products...
          </Text>
        </View>
      )}

      {/* ERROR */}
      {!loading && error !== "" && (
        <View style={styles.centerMessage}>
          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadProducts}
          >
            <Text style={styles.retryText}>
              TRY AGAIN
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* EMPTY */}
      {!loading &&
        error === "" &&
        filteredProducts.length === 0 && (
          <View style={styles.centerMessage}>
            <Text style={styles.messageText}>
              No products available.
            </Text>
          </View>
        )}

      {/* PRODUCTS */}
      {!loading && error === "" && (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item, index) =>
            getProductId(item) || String(index)
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          onRefresh={loadProducts}
          refreshing={loading}
          renderItem={({ item }) => {
            const productId = getProductId(item);

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  if (productId) {
                    openProduct(productId);
                  }
                }}
                activeOpacity={0.7}
              >
                {/* PRODUCT IMAGE */}
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imageText}>
                    Product
                  </Text>
                </View>

                {/* PRODUCT INFORMATION */}
                <View style={styles.info}>
                  <Text style={styles.productName}>
                    {item.name}
                  </Text>

                  <Text style={styles.category}>
                    {item.category}
                  </Text>

                  <Text style={styles.price}>
                    ₹{item.price}
                  </Text>

                  <Text style={styles.seller}>
                    Seller: {item.seller}
                  </Text>

                  {item.verified ? (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>
                        ✓ Verified Organic
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.unverifiedBadge}>
                      <Text style={styles.unverifiedText}>
                        {item.type} • Unverified
                      </Text>
                    </View>
                  )}

                  {typeof item.stock === "number" && (
                    <Text style={styles.stock}>
                      Stock: {item.stock}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAF5",
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },

  logo: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1B5E20",
  },

  subtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 3,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 16,
    marginTop: 5,
    marginBottom: 12,
  },

  filterButton: {
    marginHorizontal: 16,
    backgroundColor: "#E8F5E9",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 12,
  },

  filterButtonActive: {
    backgroundColor: "#C8E6C9",
  },

  filterText: {
    color: "#1B5E20",
    fontWeight: "600",
    textAlign: "center",
  },

  middleButtons: {
    flexDirection: "row",
    marginHorizontal: 16,
    gap: 10,
    marginBottom: 10,
  },

  middleButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  middleIcon: {
    fontSize: 22,
    marginBottom: 4,
  },

  middleButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },

  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 14,
    padding: 12,
    flexDirection: "row",
    elevation: 2,
  },

  imagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  imageText: {
    color: "#1B5E20",
    fontWeight: "600",
  },

  info: {
    flex: 1,
    justifyContent: "center",
  },

  productName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },

  category: {
    fontSize: 13,
    color: "#777",
    marginBottom: 4,
  },

  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 4,
  },

  seller: {
    fontSize: 12,
    color: "#555",
    marginBottom: 6,
  },

  verifiedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  verifiedText: {
    color: "#1B5E20",
    fontSize: 11,
    fontWeight: "bold",
  },

  unverifiedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  unverifiedText: {
    color: "#666",
    fontSize: 11,
    fontWeight: "600",
  },

  stock: {
    marginTop: 5,
    fontSize: 11,
    color: "#777",
  },

  centerMessage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  messageText: {
    marginTop: 12,
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },

  errorText: {
    fontSize: 15,
    color: "#B71C1C",
    textAlign: "center",
    marginBottom: 15,
  },

  retryButton: {
    backgroundColor: "#1B5E20",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});