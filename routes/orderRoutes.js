const express = require("express");

const {
  createOrder,
  getOrders,
  getOrderById,
  getSellerOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// CREATE ORDER
// BUYER ONLY
// POST /api/orders
// ======================================================
router.post(
  "/",
  protect,
  authorize("buyer"),
  createOrder
);

// ======================================================
// GET BUYER'S OWN ORDERS
// BUYER ONLY
// GET /api/orders
// ======================================================
router.get(
  "/",
  protect,
  authorize("buyer"),
  getOrders
);

// ======================================================
// GET SELLER ORDERS
// SELLER ONLY
// GET /api/orders/seller
// ======================================================
router.get(
  "/seller",
  protect,
  authorize("seller"),
  getSellerOrders
);

// ======================================================
// GET ONE ORDER
// BUYER OR ADMIN
// GET /api/orders/:id
// ======================================================
router.get(
  "/:id",
  protect,
  authorize("buyer", "admin"),
  getOrderById
);

// ======================================================
// UPDATE ORDER STATUS
// SELLER OR ADMIN
// PATCH /api/orders/:id/status
// ======================================================
router.patch(
  "/:id/status",
  protect,
  authorize("seller", "admin"),
  updateOrderStatus
);

module.exports = router;