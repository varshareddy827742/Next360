import React, {
  useEffect,
  useState,
} from "react";

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

import { useWallet } from "../context/WalletContext";

export default function WalletScreen() {
  const {
    balance,
    transactions,
    addMoney,
    loading,
    refreshing,
    refreshWallet,
  } = useWallet();

  const [amount, setAmount] =
    useState("");

  const [selectedMethod, setSelectedMethod] =
    useState("");

  const [upiId, setUpiId] =
    useState("");

  const [processing, setProcessing] =
    useState(false);

  const quickAmounts = [
    500,
    1000,
    2000,
  ];

  /*
   * Refresh wallet whenever this screen
   * is opened.
   */
  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  const selectQuickAmount = (
    value: number
  ) => {
    setAmount(value.toString());
  };

  const handleProceedWithUPI = () => {
    const numericAmount =
      Number(amount);

    if (
      !amount ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid amount."
      );

      return;
    }

    if (!selectedMethod) {
      Alert.alert(
        "Select UPI Method",
        "Please select a UPI payment method."
      );

      return;
    }

    if (
      selectedMethod === "Other UPI" &&
      !upiId.trim()
    ) {
      Alert.alert(
        "UPI ID Required",
        "Please enter your UPI ID."
      );

      return;
    }

    Alert.alert(
      "Confirm UPI Payment",

      `Proceed with adding ₹${numericAmount} using ${selectedMethod}?`,

      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Confirm",

          onPress: async () => {
            try {
              setProcessing(true);

              /*
               * The backend receives the recharge
               * request and updates MongoDB.
               */
              const result =
                await addMoney(
                  numericAmount,
                  selectedMethod
                );

              if (!result.success) {
                Alert.alert(
                  "Payment Failed",
                  result.message
                );

                return;
              }

              setAmount("");

              setSelectedMethod("");

              setUpiId("");

              Alert.alert(
                "Payment Successful",
                result.message
              );
            } catch (error) {
              console.error(
                "WALLET PAYMENT ERROR:",
                error
              );

              Alert.alert(
                "Payment Failed",
                "Unable to add money to your wallet."
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

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
            Loading wallet...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* Header */}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.back}>
              ← Back
            </Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            My Wallet
          </Text>

          <Text style={styles.subtitle}>
            Manage your Next360 wallet
          </Text>
        </View>

        {/* Wallet Balance */}

        <View
          style={styles.balanceCard}
        >
          <Text
            style={styles.balanceLabel}
          >
            Available Balance
          </Text>

          <Text style={styles.balance}>
            ₹{balance.toFixed(2)}
          </Text>

          <Text
            style={styles.balanceInfo}
          >
            Use your wallet balance during
            checkout.
          </Text>

          {refreshing && (
            <View
              style={styles.refreshingRow}
            >
              <ActivityIndicator
                size="small"
                color="#E8F5E9"
              />

              <Text
                style={
                  styles.refreshingText
                }
              >
                Updating...
              </Text>
            </View>
          )}
        </View>

        {/* Add Money */}

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Add Money
          </Text>

          <Text style={styles.label}>
            Enter Amount
          </Text>

          <TextInput
            style={styles.amountInput}
            placeholder="Enter amount"
            keyboardType="number-pad"
            value={amount}
            onChangeText={setAmount}
            editable={!processing}
          />

          {/* Quick Amounts */}

          <Text
            style={styles.quickTitle}
          >
            Quick Amount
          </Text>

          <View
            style={styles.quickAmountRow}
          >
            {quickAmounts.map(
              (value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.quickAmountButton,

                    amount ===
                      value.toString() &&
                      styles.selectedQuickAmount,
                  ]}
                  onPress={() =>
                    selectQuickAmount(
                      value
                    )
                  }
                  activeOpacity={0.7}
                  disabled={processing}
                >
                  <Text
                    style={[
                      styles.quickAmountText,

                      amount ===
                        value.toString() &&
                        styles.selectedQuickAmountText,
                    ]}
                  >
                    ₹{value}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* UPI Payment Methods */}

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Select UPI Payment Method
          </Text>

          {/* Google Pay */}

          <TouchableOpacity
            style={[
              styles.upiOption,

              selectedMethod ===
                "Google Pay" &&
                styles.selectedUpiOption,
            ]}
            onPress={() =>
              setSelectedMethod(
                "Google Pay"
              )
            }
            activeOpacity={0.7}
            disabled={processing}
          >
            <View
              style={
                styles.upiIconContainer
              }
            >
              <Text
                style={styles.upiIcon}
              >
                G
              </Text>
            </View>

            <View
              style={styles.upiInfo}
            >
              <Text
                style={styles.upiName}
              >
                Google Pay
              </Text>

              <Text
                style={
                  styles.upiDescription
                }
              >
                Pay using Google Pay
              </Text>
            </View>

            <View
              style={[
                styles.radio,

                selectedMethod ===
                  "Google Pay" &&
                  styles.radioSelected,
              ]}
            >
              {selectedMethod ===
                "Google Pay" && (
                <View
                  style={
                    styles.radioInner
                  }
                />
              )}
            </View>
          </TouchableOpacity>

          {/* PhonePe */}

          <TouchableOpacity
            style={[
              styles.upiOption,

              selectedMethod ===
                "PhonePe" &&
                styles.selectedUpiOption,
            ]}
            onPress={() =>
              setSelectedMethod(
                "PhonePe"
              )
            }
            activeOpacity={0.7}
            disabled={processing}
          >
            <View
              style={
                styles.upiIconContainer
              }
            >
              <Text
                style={styles.upiIcon}
              >
                P
              </Text>
            </View>

            <View
              style={styles.upiInfo}
            >
              <Text
                style={styles.upiName}
              >
                PhonePe
              </Text>

              <Text
                style={
                  styles.upiDescription
                }
              >
                Pay using PhonePe
              </Text>
            </View>

            <View
              style={[
                styles.radio,

                selectedMethod ===
                  "PhonePe" &&
                  styles.radioSelected,
              ]}
            >
              {selectedMethod ===
                "PhonePe" && (
                <View
                  style={
                    styles.radioInner
                  }
                />
              )}
            </View>
          </TouchableOpacity>

          {/* Paytm */}

          <TouchableOpacity
            style={[
              styles.upiOption,

              selectedMethod ===
                "Paytm" &&
                styles.selectedUpiOption,
            ]}
            onPress={() =>
              setSelectedMethod(
                "Paytm"
              )
            }
            activeOpacity={0.7}
            disabled={processing}
          >
            <View
              style={
                styles.upiIconContainer
              }
            >
              <Text
                style={styles.upiIcon}
              >
                T
              </Text>
            </View>

            <View
              style={styles.upiInfo}
            >
              <Text
                style={styles.upiName}
              >
                Paytm
              </Text>

              <Text
                style={
                  styles.upiDescription
                }
              >
                Pay using Paytm
              </Text>
            </View>

            <View
              style={[
                styles.radio,

                selectedMethod ===
                  "Paytm" &&
                  styles.radioSelected,
              ]}
            >
              {selectedMethod ===
                "Paytm" && (
                <View
                  style={
                    styles.radioInner
                  }
                />
              )}
            </View>
          </TouchableOpacity>

          {/* Other UPI */}

          <TouchableOpacity
            style={[
              styles.upiOption,

              selectedMethod ===
                "Other UPI" &&
                styles.selectedUpiOption,
            ]}
            onPress={() =>
              setSelectedMethod(
                "Other UPI"
              )
            }
            activeOpacity={0.7}
            disabled={processing}
          >
            <View
              style={
                styles.upiIconContainer
              }
            >
              <Text
                style={styles.upiIcon}
              >
                ₹
              </Text>
            </View>

            <View
              style={styles.upiInfo}
            >
              <Text
                style={styles.upiName}
              >
                Other UPI
              </Text>

              <Text
                style={
                  styles.upiDescription
                }
              >
                Enter another UPI ID
              </Text>
            </View>

            <View
              style={[
                styles.radio,

                selectedMethod ===
                  "Other UPI" &&
                  styles.radioSelected,
              ]}
            >
              {selectedMethod ===
                "Other UPI" && (
                <View
                  style={
                    styles.radioInner
                  }
                />
              )}
            </View>
          </TouchableOpacity>

          {/* Other UPI ID */}

          {selectedMethod ===
            "Other UPI" && (
            <View
              style={
                styles.upiInputContainer
              }
            >
              <Text style={styles.label}>
                UPI ID
              </Text>

              <TextInput
                style={styles.input}
                placeholder="example@upi"
                keyboardType="email-address"
                autoCapitalize="none"
                value={upiId}
                onChangeText={
                  setUpiId
                }
                editable={!processing}
              />
            </View>
          )}

          {/* Proceed Button */}

          <TouchableOpacity
            style={[
              styles.proceedButton,

              processing &&
                styles.disabledButton,
            ]}
            onPress={
              handleProceedWithUPI
            }
            activeOpacity={0.7}
            disabled={processing}
          >
            {processing ? (
              <>
                <ActivityIndicator
                  color="#FFFFFF"
                  size="small"
                />

                <Text
                  style={[
                    styles.proceedButtonText,
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
                  styles.proceedButtonText
                }
              >
                PROCEED WITH UPI
              </Text>
            )}
          </TouchableOpacity>

          <Text
            style={styles.demoNote}
          >
            Demo UPI recharge. A real UPI
            payment gateway can be connected
            later.
          </Text>
        </View>

        {/* Transaction History */}

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Transaction History
          </Text>

          {transactions.length ===
          0 ? (
            <View
              style={
                styles.emptyTransaction
              }
            >
              <Text
                style={styles.emptyIcon}
              >
                💳
              </Text>

              <Text
                style={styles.emptyText}
              >
                No transactions yet
              </Text>

              <Text
                style={
                  styles.emptySubText
                }
              >
                Your wallet transactions
                will appear here.
              </Text>
            </View>
          ) : (
            transactions.map(
              (transaction) => (
                <View
                  key={transaction.id}
                  style={
                    styles.transactionRow
                  }
                >
                  <View
                    style={[
                      styles.transactionIcon,

                      transaction.type ===
                        "credit"
                        ? styles.creditIcon
                        : styles.debitIcon,
                    ]}
                  >
                    <Text
                      style={
                        styles.transactionIconText
                      }
                    >
                      {transaction.type ===
                      "credit"
                        ? "+"
                        : "-"}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.transactionInfo
                    }
                  >
                    <Text
                      style={
                        styles.transactionTitle
                      }
                    >
                      {transaction.title}
                    </Text>

                    <Text
                      style={
                        styles.transactionDate
                      }
                    >
                      {transaction.date}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.transactionAmount,

                      transaction.type ===
                        "credit"
                        ? styles.creditAmount
                        : styles.debitAmount,
                    ]}
                  >
                    {transaction.type ===
                    "credit"
                      ? "+"
                      : "-"}
                    ₹
                    {transaction.amount.toFixed(
                      2
                    )}
                  </Text>
                </View>
              )
            )
          )}
        </View>

        {/* Security Note */}

        <View
          style={styles.securityBox}
        >
          <Text
            style={styles.securityTitle}
          >
            🔒 Payment Security
          </Text>

          <Text
            style={styles.securityText}
          >
            Next360 does not store your
            UPI PIN, bank password, or
            card security information in
            this demo application.
          </Text>
        </View>
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

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
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

  balanceCard: {
    backgroundColor: "#2E7D32",
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 22,
    borderRadius: 16,
    elevation: 4,
  },

  balanceLabel: {
    color: "#E8F5E9",
    fontSize: 14,
    fontWeight: "600",
  },

  balance: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 8,
  },

  balanceInfo: {
    color: "#E8F5E9",
    fontSize: 12,
    marginTop: 8,
  },

  refreshingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  refreshingText: {
    color: "#E8F5E9",
    fontSize: 11,
    marginLeft: 6,
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
    marginBottom: 8,
  },

  amountInput: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 17,
    backgroundColor: "#FFFFFF",
  },

  quickTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginTop: 16,
    marginBottom: 10,
  },

  quickAmountRow: {
    flexDirection: "row",
    gap: 10,
  },

  quickAmountButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#2E7D32",
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: "center",
  },

  selectedQuickAmount: {
    backgroundColor: "#2E7D32",
  },

  quickAmountText: {
    color: "#2E7D32",
    fontWeight: "bold",
  },

  selectedQuickAmountText: {
    color: "#FFFFFF",
  },

  upiOption: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    padding: 13,
    marginBottom: 10,
  },

  selectedUpiOption: {
    borderColor: "#2E7D32",
    backgroundColor: "#E8F5E9",
  },

  upiIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },

  upiIcon: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#2E7D32",
  },

  upiInfo: {
    flex: 1,
    marginLeft: 12,
  },

  upiName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },

  upiDescription: {
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

  upiInputContainer: {
    marginTop: 4,
    marginBottom: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#FFFFFF",
  },

  proceedButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 15,
  },

  disabledButton: {
    opacity: 0.7,
  },

  proceedButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  demoNote: {
    fontSize: 11,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 16,
  },

  emptyTransaction: {
    alignItems: "center",
    paddingVertical: 20,
  },

  emptyIcon: {
    fontSize: 35,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
  },

  emptySubText: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },

  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  transactionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  creditIcon: {
    backgroundColor: "#E8F5E9",
  },

  debitIcon: {
    backgroundColor: "#FFEBEE",
  },

  transactionIconText: {
    fontSize: 20,
    fontWeight: "bold",
  },

  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },

  transactionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },

  transactionDate: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
  },

  transactionAmount: {
    fontSize: 14,
    fontWeight: "bold",
  },

  creditAmount: {
    color: "#2E7D32",
  },

  debitAmount: {
    color: "#D32F2F",
  },

  securityBox: {
    marginHorizontal: 16,
    backgroundColor: "#FFF8E1",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFE082",
  },

  securityTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#795548",
    marginBottom: 6,
  },

  securityText: {
    fontSize: 12,
    color: "#795548",
    lineHeight: 18,
  },
});