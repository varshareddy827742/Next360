const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // --------------------------------------------------
    // Order associated with this payment
    // --------------------------------------------------
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // --------------------------------------------------
    // Buyer who made the payment
    // --------------------------------------------------
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --------------------------------------------------
    // Payment amount
    // --------------------------------------------------
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // --------------------------------------------------
    // Payment method
    // --------------------------------------------------
    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "WALLET"],
      required: true,
    },

    // --------------------------------------------------
    // Payment status
    // --------------------------------------------------
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    // --------------------------------------------------
    // Transaction ID
    // --------------------------------------------------
    transactionId: {
      type: String,
      default: "",
      trim: true,
    },

    // --------------------------------------------------
    // Payment gateway
    // --------------------------------------------------
    gateway: {
      type: String,
      enum: ["COD", "UPI_DEMO", "WALLET"],
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

const Payment = mongoose.model(
  "Payment",
  paymentSchema
);

module.exports = Payment;