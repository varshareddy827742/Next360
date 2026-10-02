const Wallet = require("../models/Wallet");

// GET MY WALLET
const getMyWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({
      userId: req.user._id,
    });

    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user._id,
        balance: 0,
        transactions: [],
      });
    }

    res.status(200).json({
      success: true,
      wallet,
    });
  } catch (error) {
    console.error("GET WALLET ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ADD MONEY TO WALLET
const addMoney = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    // Validate amount
    if (
      amount === undefined ||
      amount === null ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    const rechargeAmount = Number(amount);

    // Validate payment method
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    // Currently only UPI demo is supported
    if (paymentMethod !== "UPI") {
      return res.status(400).json({
        success: false,
        message:
          "Wallet recharge currently supports UPI only",
      });
    }

    // Find or create wallet
    let wallet = await Wallet.findOne({
      userId: req.user._id,
    });

    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user._id,
        balance: 0,
        transactions: [],
      });
    }

    // Generate demo UPI transaction ID
    const transactionId =
      `WALLET-UPI-${Date.now()}-${Math.floor(
        Math.random() * 10000
      )}`;

    // Increase wallet balance
    wallet.balance += rechargeAmount;

    // Add transaction
    wallet.transactions.push({
      type: "CREDIT",
      amount: rechargeAmount,
      description: "Wallet recharge using UPI",
      reference: transactionId,
    });

    await wallet.save();

    res.status(200).json({
      success: true,
      message: "Money added to wallet successfully",
      transactionId,
      wallet,
    });
  } catch (error) {
    console.error("ADD MONEY ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET WALLET TRANSACTIONS
const getWalletTransactions = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({
      userId: req.user._id,
    });

    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user._id,
        balance: 0,
        transactions: [],
      });
    }

    const transactions = [
      ...wallet.transactions,
    ].sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error(
      "GET WALLET TRANSACTIONS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  getMyWallet,
  addMoney,
  getWalletTransactions,
};