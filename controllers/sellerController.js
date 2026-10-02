const Seller = require("../models/Seller");

// Create seller
const createSeller = async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      email,
      phone,
      address,
      city,
      pincode,
      sellerType,
      verified,
      certification,
    } = req.body;

    const existingSeller = await Seller.findOne({ email });

    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: "Seller with this email already exists",
      });
    }

    const seller = await Seller.create({
      businessName,
      ownerName,
      email,
      phone,
      address,
      city,
      pincode,
      sellerType,
      verified,
      certification,
    });

    res.status(201).json({
      success: true,
      message: "Seller created successfully",
      seller,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all sellers
const getSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sellers.length,
      sellers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get seller by ID
const getSellerById = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    res.status(200).json({
      success: true,
      seller,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createSeller,
  getSellers,
  getSellerById,
};