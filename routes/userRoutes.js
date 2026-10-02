const express = require("express");

const {
  createUser,
  loginUser,
  getProfile,
} = require("../controllers/userController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Register user
router.post("/", createUser);

// Login user
router.post("/login", loginUser);

// Get logged-in user profile
router.get("/profile", protect, getProfile);

// Buyer-only test route
router.get(
  "/buyer-test",
  protect,
  authorize("buyer"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Buyer access granted",
      user: req.user,
    });
  }
);
// Seller-only test route
router.get(
  "/seller-test",
  protect,
  authorize("seller"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Seller access granted",
      user: req.user,
    });
  }
);
// Admin-only test route
router.get(
  "/admin-test",
  protect,
  authorize("admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin access granted",
      user: req.user,
    });
  }
);

module.exports = router;