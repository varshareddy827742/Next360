const express = require("express");

const {
  createProduct,
  getProducts,
  getSellerProducts,
  getProductById,
  updateProduct,
  verifyProduct,
} = require("../controllers/productController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// CREATE PRODUCT
// =====================================================

router.post(
  "/",
  protect,
  authorize("seller", "admin"),
  createProduct
);

// =====================================================
// GET BUYER-VISIBLE PRODUCTS
// =====================================================

router.get(
  "/",
  getProducts
);

// =====================================================
// GET LOGGED-IN SELLER'S PRODUCTS
// =====================================================

router.get(
  "/seller",
  protect,
  authorize("seller"),
  getSellerProducts
);

// =====================================================
// ADMIN VERIFY ORGANIC PRODUCT
// =====================================================

router.patch(
  "/:id/verify",
  protect,
  authorize("admin"),
  verifyProduct
);

// =====================================================
// UPDATE PRODUCT
// =====================================================

router.patch(
  "/:id",
  protect,
  authorize("seller", "admin"),
  updateProduct
);

// =====================================================
// GET ONE PRODUCT
// =====================================================

router.get(
  "/:id",
  getProductById
);

module.exports = router;