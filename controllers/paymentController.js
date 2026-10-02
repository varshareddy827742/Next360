const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Wallet = require("../models/Wallet");

// CREATE PAYMENT
const createPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { orderId, paymentMethod } = req.body;

    // -----------------------------
    // BASIC VALIDATION
    // -----------------------------

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

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

    // -----------------------------
    // START TRANSACTION
    // -----------------------------

    session.startTransaction();

    // -----------------------------
    // FIND ORDER
    // -----------------------------

    const order = await Order.findById(orderId).session(
      session
    );

    if (!order) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // -----------------------------
    // VERIFY ORDER OWNERSHIP
    // -----------------------------

    if (
      order.userId.toString() !==
      req.user._id.toString()
    ) {
      await session.abortTransaction();

      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only pay for your own orders.",
      });
    }

    // -----------------------------
    // VERIFY PAYMENT METHOD
    // -----------------------------

    if (order.paymentMethod !== paymentMethod) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Payment method does not match the order payment method",
      });
    }

    // -----------------------------
    // PREVENT DUPLICATE PAYMENT
    // -----------------------------

    const existingPayment =
      await Payment.findOne({
        orderId: order._id,
        paymentStatus: "PAID",
      }).session(session);

    if (existingPayment) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Payment has already been completed for this order",
      });
    }

    // -----------------------------
    // DEFAULT PAYMENT VALUES
    // -----------------------------

    let paymentStatus = "PENDING";
    let gateway = "COD";
    let transactionId = "";

    // =====================================================
    // COD PAYMENT
    // =====================================================

    if (paymentMethod === "COD") {
      paymentStatus = "PENDING";
      gateway = "COD";
      transactionId = "";
    }

    // =====================================================
    // UPI DEMO PAYMENT
    // =====================================================

    if (paymentMethod === "UPI") {
      paymentStatus = "PAID";
      gateway = "UPI_DEMO";

      transactionId =
        `UPI-${Date.now()}-${Math.floor(
          Math.random() * 10000
        )}`;
    }

    // =====================================================
    // WALLET PAYMENT
    // =====================================================

    if (paymentMethod === "WALLET") {
      console.log(
        "=========================================="
      );
      console.log("========== WALLET PAYMENT ==========");
      console.log(
        "=========================================="
      );

      console.log(
        "User ID:",
        req.user._id.toString()
      );

      console.log(
        "Order ID:",
        order._id.toString()
      );

      console.log(
        "Order Total:",
        order.totalAmount
      );

      // -----------------------------
      // FIND USER WALLET
      // -----------------------------

      const wallet =
        await Wallet.findOne({
          userId: req.user._id,
        }).session(session);

      console.log(
        "Wallet Balance:",
        wallet
          ? wallet.balance
          : "NO WALLET"
      );

      // -----------------------------
      // WALLET NOT FOUND
      // -----------------------------

      if (!wallet) {
        console.log(
          "❌ WALLET NOT FOUND"
        );

        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Wallet not found. Please create or recharge your wallet first.",
        });
      }

      // -----------------------------
      // CHECK WALLET BALANCE
      // -----------------------------

      if (
        wallet.balance <
        order.totalAmount
      ) {
        console.log(
          "❌ INSUFFICIENT WALLET BALANCE"
        );

        console.log(
          "Available:",
          wallet.balance
        );

        console.log(
          "Required:",
          order.totalAmount
        );

        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            `Insufficient wallet balance. Available balance: ₹${wallet.balance}. Required: ₹${order.totalAmount}.`,
        });
      }

      // -----------------------------
      // SUFFICIENT BALANCE
      // -----------------------------

      console.log(
        "✅ WALLET BALANCE IS SUFFICIENT"
      );

      const oldBalance =
        wallet.balance;

      // -----------------------------
      // DEDUCT ORDER AMOUNT
      // -----------------------------

      wallet.balance =
        wallet.balance -
        order.totalAmount;

      console.log(
        "Wallet balance:",
        oldBalance,
        "→",
        wallet.balance
      );

      // -----------------------------
      // CREATE TRANSACTION ID
      // -----------------------------

      transactionId =
        `WALLET-${Date.now()}-${Math.floor(
          Math.random() * 10000
        )}`;

      // -----------------------------
      // ADD DEBIT TRANSACTION
      // -----------------------------

      wallet.transactions.push({
        type: "DEBIT",
        amount: order.totalAmount,
        description:
          `Payment for Order ${order.orderNumber}`,
        reference: transactionId,
      });

      // -----------------------------
      // SAVE WALLET
      // -----------------------------

      await wallet.save({
        session,
      });

      console.log(
        "✅ WALLET DEDUCTION SAVED"
      );

      console.log(
        "New Wallet Balance:",
        wallet.balance
      );

      // -----------------------------
      // PAYMENT STATUS
      // -----------------------------

      paymentStatus = "PAID";
      gateway = "WALLET";
    }

    // =====================================================
    // CREATE PAYMENT
    // =====================================================

    const payment = new Payment({
      orderId: order._id,
      userId: req.user._id,
      amount: order.totalAmount,
      paymentMethod,
      paymentStatus,
      transactionId,
      gateway,
    });

    await payment.save({
      session,
    });

    // =====================================================
    // UPDATE ORDER PAYMENT STATUS
    // =====================================================

    order.paymentMethod = paymentMethod;
    order.paymentStatus = paymentStatus;

    await order.save({
      session,
    });

    // =====================================================
    // COMMIT TRANSACTION
    // =====================================================

    await session.commitTransaction();

    console.log(
      "✅ PAYMENT TRANSACTION COMMITTED"
    );

    // =====================================================
    // SUCCESS RESPONSE
    // =====================================================

    return res.status(201).json({
      success: true,
      message: "Payment processed successfully",
      payment,
      order,
    });
  } catch (error) {
    // =====================================================
    // ROLLBACK TRANSACTION
    // =====================================================

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(
      "CREATE PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    // =====================================================
    // END SESSION
    // =====================================================

    await session.endSession();
  }
};

// =========================================================
// GET MY PAYMENTS
// =========================================================

const getMyPayments = async (req, res) => {
  try {
    const payments =
      await Payment.find({
        userId: req.user._id,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error(
      "GET PAYMENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// GET PAYMENT BY ORDER
// =========================================================

const getPaymentByOrder = async (
  req,
  res
) => {
  try {
    const payment =
      await Payment.findOne({
        orderId: req.params.orderId,
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // -----------------------------
    // VERIFY ACCESS
    // -----------------------------

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

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error(
      "GET PAYMENT BY ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// EXPORT CONTROLLERS
// =========================================================

module.exports = {
  createPayment,
  getMyPayments,
  getPaymentByOrder,
};