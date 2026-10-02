const express = require("express");

const {
  createSeller,
  getSellers,
  getSellerById,
} = require("../controllers/sellerController");

const router = express.Router();

// Create seller
router.post("/", createSeller);

// Get all sellers
router.get("/", getSellers);

// Get one seller
router.get("/:id", getSellerById);

module.exports = router;