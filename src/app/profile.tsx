import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const [showAddress, setShowAddress] =
    useState(false);

  const [showPayment, setShowPayment] =
    useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
          >
            <Text style={styles.back}>
              ← Back
            </Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            My Profile
          </Text>
        </View>

        {/* PROFILE ICON */}
        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileIconText}>
              👤
            </Text>
          </View>

          <Text style={styles.profileName}>
            {name || "Your Name"}
          </Text>

          <Text style={styles.profileEmail}>
            {email || "Add your email"}
          </Text>
        </View>

        {/* PERSONAL DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Personal Details
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
            style={styles.input}
            placeholder="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.7}
            onPress={() => {
              alert(
                "Personal details saved."
              );
            }}
          >
            <Text style={styles.saveButtonText}>
              SAVE DETAILS
            </Text>
          </TouchableOpacity>
        </View>

        {/* ADDRESS */}
        <TouchableOpacity
          style={styles.menuItem}
          activeOpacity={0.7}
          onPress={() =>
            setShowAddress(!showAddress)
          }
        >
          <Text style={styles.menuIcon}>
            🏠
          </Text>

          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>
              Delivery Address
            </Text>

            <Text style={styles.menuSubtitle}>
              Add or update your delivery address
            </Text>
          </View>

          <Text style={styles.arrow}>
            {showAddress ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>

        {showAddress && (
          <View style={styles.expandSection}>
            <TextInput
              style={styles.input}
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

            <TouchableOpacity
              style={styles.saveButton}
              activeOpacity={0.7}
              onPress={() => {
                alert(
                  "Delivery address saved."
                );
              }}
            >
              <Text
                style={styles.saveButtonText}
              >
                SAVE ADDRESS
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PAYMENT METHODS */}
        <TouchableOpacity
          style={styles.menuItem}
          activeOpacity={0.7}
          onPress={() =>
            setShowPayment(!showPayment)
          }
        >
          <Text style={styles.menuIcon}>
            💳
          </Text>

          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>
              Payment Methods
            </Text>

            <Text style={styles.menuSubtitle}>
              Manage debit and credit cards
            </Text>
          </View>

          <Text style={styles.arrow}>
            {showPayment ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>

        {showPayment && (
          <View style={styles.expandSection}>
            <TouchableOpacity
              style={styles.paymentCard}
              activeOpacity={0.7}
              onPress={() => {
                alert(
                  "Card management will be connected to the secure payment system later."
                );
              }}
            >
              <Text style={styles.paymentIcon}>
                💳
              </Text>

              <View>
                <Text
                  style={styles.paymentTitle}
                >
                  Add Credit / Debit Card
                </Text>

                <Text
                  style={styles.paymentSubtitle}
                >
                  Secure card management
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.paymentCard}
              activeOpacity={0.7}
              onPress={() => {
                alert(
                  "UPI and bank account management will be connected later."
                );
              }}
            >
              <Text style={styles.paymentIcon}>
                🏦
              </Text>

              <View>
                <Text
                  style={styles.paymentTitle}
                >
                  Bank / UPI Account
                </Text>

                <Text
                  style={styles.paymentSubtitle}
                >
                  Manage payment accounts
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* WALLET SHORTCUT */}
        <TouchableOpacity
          style={styles.menuItem}
          activeOpacity={0.7}
          onPress={() => router.push("/wallet")}
        >
          <Text style={styles.menuIcon}>
            💰
          </Text>

          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>
              My Wallet
            </Text>

            <Text style={styles.menuSubtitle}>
              Add money and view transactions
            </Text>
          </View>

          <Text style={styles.arrow}>
            →
          </Text>
        </TouchableOpacity>

        {/* MY ORDERS */}
        <TouchableOpacity
          style={styles.menuItem}
          activeOpacity={0.7}
          onPress={() => router.push("/orders")}
        >
          <Text style={styles.menuIcon}>
            📦
          </Text>

          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>
              My Orders
            </Text>

            <Text style={styles.menuSubtitle}>
              View your orders and tracking
            </Text>
          </View>

          <Text style={styles.arrow}>
            →
          </Text>
        </TouchableOpacity>

        {/* CONTINUE SHOPPING */}
        <TouchableOpacity
          style={styles.shopButton}
          activeOpacity={0.7}
          onPress={() => router.push("/")}
        >
          <Text style={styles.shopButtonText}>
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

  profileCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 22,
    borderRadius: 14,
    alignItems: "center",
    elevation: 2,
  },

  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  profileIconText: {
    fontSize: 40,
  },

  profileName: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#333",
  },

  profileEmail: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },

  section: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 15,
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

  saveButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 13,
    borderRadius: 9,
    alignItems: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  menuItem: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  menuIcon: {
    fontSize: 28,
    width: 45,
  },

  menuInfo: {
    flex: 1,
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  menuSubtitle: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },

  arrow: {
    fontSize: 16,
    color: "#2E7D32",
    fontWeight: "bold",
  },

  expandSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: -5,
    marginBottom: 10,
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    elevation: 1,
  },

  paymentCard: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  paymentIcon: {
    fontSize: 28,
    marginRight: 12,
  },

  paymentTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },

  paymentSubtitle: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },

  shopButton: {
    backgroundColor: "#2E7D32",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 30,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  shopButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});