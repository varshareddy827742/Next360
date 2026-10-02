const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Wallet = require("../models/Wallet");

// CREATE PAYMENT
const createPayment = async (req, res) => {
  try {
    const {
      orderId,
      paymentMethod,
    } = req.body;

    // Validate order ID
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Validate payment method
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    const allowedMethods = [
      "COD",
      "UPI",
      "WALLET",
    ];

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // Find order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Make sure buyer owns the order
    if (
      order.userId.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only pay for your own orders.",
      });
    }

    // Make sure payment method matches the order
    if (order.paymentMethod !== paymentMethod) {
      return res.status(400).json({
        success: false,
        message:
          "Payment method does not match the order payment method",
      });
    }

    // Check if already paid
    const existingPayment =
      await Payment.findOne({
        orderId: order._id,
        paymentStatus: "PAID",
      });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message:
          "Payment has already been completed for this order",
      });
    }

    let paymentStatus = "PENDING";
    let gateway = "COD";
    let transactionId = "";

    // ==========================================
    // COD PAYMENT
    // ==========================================

    if (paymentMethod === "COD") {
      paymentStatus = "PENDING";
      gateway = "COD";
      transactionId = "";
    }

    // ==========================================
    // UPI PAYMENT
    // ==========================================

    if (paymentMethod === "UPI") {
      paymentStatus = "PAID";
      gateway = "UPI_DEMO";

      transactionId =
        `UPI-${Date.now()}-${Math.floor(
          Math.random() * 10000
        )}`;
    }

    // ==========================================
    // WALLET PAYMENT
    // ==========================================

    if (paymentMethod === "WALLET") {
      // Find buyer wallet
      let wallet = await Wallet.findOne({
        userId: req.user._id,
      });

      // Create wallet if it doesn't exist
      if (!wallet) {
        wallet = await Wallet.create({
          userId: req.user._id,
          balance: 0,
          transactions: [],
        });
      }

      // Check wallet balance
      if (wallet.balance < order.totalAmount) {
        return res.status(400).json({
          success: false,
          message:
            `Insufficient wallet balance. Available balance: ₹${wallet.balance}. Required: ₹${order.totalAmount}.`,
        });
      }

      // Deduct order amount
      wallet.balance -= order.totalAmount;

      // Generate transaction ID
      transactionId =
        `WALLET-${Date.now()}-${Math.floor(
          Math.random() * 10000
        )}`;

      // Add debit transaction
      wallet.transactions.push({
        type: "DEBIT",
        amount: order.totalAmount,
        description:
          `Payment for Order ${order.orderNumber}`,
        reference: transactionId,
      });

      // Save wallet
      await wallet.save();

      paymentStatus = "PAID";
      gateway = "WALLET";
    }

    // Create payment record
    const payment = await Payment.create({
      orderId: order._id,
      userId: req.user._id,
      amount: order.totalAmount,
      paymentMethod,
      paymentStatus,
      transactionId,
      gateway,
    });

    // Update order payment status
    order.paymentMethod = paymentMethod;
    order.paymentStatus = paymentStatus;

    await order.save();

    res.status(201).json({
      success: true,
      message: "Payment processed successfully",
      payment,
      order,
    });
  } catch (error) {
    console.error(
      "CREATE PAYMENT ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET MY PAYMENTS
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error(
      "GET PAYMENTS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET PAYMENT BY ORDER
const getPaymentByOrder = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      orderId: req.params.orderId,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Admin can view any payment.
    // Buyers can only view their own payment.
    if (
      req.user.role !== "admin" &&
      payment.userId.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only view your own payment.",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error(
      "GET PAYMENT BY ORDER ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createPayment,
  getMyPayments,
  getPaymentByOrder,
};