import React from "react";
import { router } from "expo-router";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const products = [
  {
    id: "1",
    name: "Organic Turmeric Powder",
    category: "Spices",
    price: 180,
    type: "Organic",
    seller: "Green Farms",
    verified: true,
  },
  {
    id: "2",
    name: "Organic Honey",
    category: "Honey",
    price: 350,
    type: "Organic",
    seller: "Nature Foods",
    verified: true,
  },
  {
    id: "3",
    name: "Natural Cold Pressed Oil",
    category: "Oils",
    price: 420,
    type: "Natural",
    seller: "Healthy Harvest",
    verified: false,
  },
  {
    id: "4",
    name: "Eco Friendly Bamboo Brush",
    category: "Eco Products",
    price: 120,
    type: "Eco-Friendly",
    seller: "Eco Living",
    verified: false,
  },
];

export default function HomeScreen() {
  const openProduct = (id: string) => {
    router.push({
      pathname: "/product-details",
      params: {
        id: id,
      },
    });
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
        style={styles.filterButton}
        activeOpacity={0.7}
      >
        <Text style={styles.filterText}>
          ✓ Show Verified Organic Only
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
          <Text style={styles.middleIcon}>
            🛒
          </Text>

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
          <Text style={styles.middleIcon}>
            📦
          </Text>

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
          <Text style={styles.middleIcon}>
            💰
          </Text>

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
          <Text style={styles.middleIcon}>
            👤
          </Text>

          <Text style={styles.middleButtonText}>
            PROFILE
          </Text>
        </TouchableOpacity>
      </View>

      {/* PRODUCTS */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => openProduct(item.id)}
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
            </View>
          </TouchableOpacity>
        )}
      />
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
    borderRadius: 9,
    marginBottom: 18,
  },

  filterText: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "600",
  },

  middleButtons: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 14,
    gap: 12,
  },

  middleButton: {
    flex: 1,
    backgroundColor: "#2E7D32",
    paddingVertical: 17,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  middleIcon: {
    fontSize: 29,
    marginBottom: 5,
  },

  middleButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 15,
    padding: 14,
    flexDirection: "row",
    elevation: 2,
  },

  imagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  imageText: {
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "600",
  },

  info: {
    flex: 1,
  },

  productName: {
    fontSize: 16,
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
    color: "#2E7D32",
    marginBottom: 4,
  },

  seller: {
    fontSize: 12,
    color: "#666",
    marginBottom: 7,
  },

  verifiedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },

  verifiedText: {
    color: "#2E7D32",
    fontSize: 11,
    fontWeight: "bold",
  },

  unverifiedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },

  unverifiedText: {
    color: "#777",
    fontSize: 11,
    fontWeight: "600",
  },
});