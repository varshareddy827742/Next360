const express = require("express");

const {
  createPayment,
  getMyPayments,
  getPaymentByOrder,
} = require("../controllers/paymentController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// CREATE PAYMENT
// POST /api/payments
// BUYER ONLY
// ======================================================
router.post(
  "/",
  protect,
  authorize("buyer"),
  createPayment
);

// ======================================================
// GET MY PAYMENTS
// GET /api/payments
// BUYER ONLY
// ======================================================
router.get(
  "/",
  protect,
  authorize("buyer"),
  getMyPayments
);

// ======================================================
// GET PAYMENT BY ORDER
// GET /api/payments/order/:orderId
// BUYER OR ADMIN
// ======================================================
router.get(
  "/order/:orderId",
  protect,
  authorize("buyer", "admin"),
  getPaymentByOrder
);

module.exports = router;