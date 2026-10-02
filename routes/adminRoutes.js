const express = require("express");

const {
  // User management
  getAllUsers,
  getAllSellers,
  getAllBuyers,
  getUserById,
  updateUserStatus,

  // Product management
  getAllProducts,
  getPendingOrganicProducts,
  getProductById,
  approveProduct,
  rejectProduct,

  // Order management
  getAllOrders,
  getAdminOrderById,
  updateAdminOrderStatus,

  // Dashboard
  getDashboardStats,
} = require("../controllers/adminController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// ADMIN DASHBOARD
// =====================================================

router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  getDashboardStats
);

// =====================================================
// USER MANAGEMENT
// =====================================================

router.get(
  "/users",
  protect,
  authorize("admin"),
  getAllUsers
);

router.get(
  "/sellers",
  protect,
  authorize("admin"),
  getAllSellers
);

router.get(
  "/buyers",
  protect,
  authorize("admin"),
  getAllBuyers
);

router.get(
  "/users/:id",
  protect,
  authorize("admin"),
  getUserById
);

router.patch(
  "/users/:id/status",
  protect,
  authorize("admin"),
  updateUserStatus
);

// =====================================================
// PRODUCT MANAGEMENT
// =====================================================

router.get(
  "/products",
  protect,
  authorize("admin"),
  getAllProducts
);

router.get(
  "/products/pending",
  protect,
  authorize("admin"),
  getPendingOrganicProducts
);

router.get(
  "/products/:id",
  protect,
  authorize("admin"),
  getProductById
);

router.patch(
  "/products/:id/approve",
  protect,
  authorize("admin"),
  approveProduct
);

router.patch(
  "/products/:id/reject",
  protect,
  authorize("admin"),
  rejectProduct
);

// =====================================================
// ORDER MANAGEMENT
// =====================================================

router.get(
  "/orders",
  protect,
  authorize("admin"),
  getAllOrders
);

router.get(
  "/orders/:id",
  protect,
  authorize("admin"),
  getAdminOrderById
);

router.patch(
  "/orders/:id/status",
  protect,
  authorize("admin"),
  updateAdminOrderStatus
);

module.exports = router;
