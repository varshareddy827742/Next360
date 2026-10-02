const Product = require("../models/Product");

// =====================================================
// CREATE PRODUCT
// =====================================================

const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      description,
      type,
      seller,
      certificate,
      stock,
      images,
    } = req.body;

    // -----------------------------------------------
    // BASIC VALIDATION
    // -----------------------------------------------

    if (!name || !category || !type || !seller) {
      return res.status(400).json({
        success: false,
        message:
          "Name, category, type and seller are required",
      });
    }

    if (price === undefined || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid price is required",
      });
    }

    if (stock === undefined || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid stock is required",
      });
    }

    // -----------------------------------------------
    // ORGANIC CERTIFICATE VALIDATION
    // -----------------------------------------------

    if (
      type === "Organic" &&
      (!certificate || !certificate.trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Organic products require a certificate",
      });
    }

    // -----------------------------------------------
    // CREATE PRODUCT
    // -----------------------------------------------

    const product = await Product.create({
      name: name.trim(),

      category: category.trim(),

      price: Number(price),

      description:
        description
          ? description.trim()
          : "",

      type,

      seller: seller.trim(),

      // Automatically assign logged-in seller
      sellerId: req.user._id,

      // New products are not verified initially
      verified: false,

      // Certificate only applies to Organic
      certificate:
        type === "Organic"
          ? certificate.trim()
          : "",

      stock: Number(stock),

      images:
        Array.isArray(images)
          ? images
          : [],
    });

    res.status(201).json({
      success: true,
      message:
        "Product created successfully",
      product,
    });

  } catch (error) {
    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET BUYER-VISIBLE PRODUCTS
// =====================================================
//
// Organic:
//   verified = true
//
// Natural:
//   visible
//
// Eco-Friendly:
//   visible
//
// =====================================================

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $or: [
        {
          type: "Organic",
          verified: true,
        },

        {
          type: {
            $in: [
              "Natural",
              "Eco-Friendly",
            ],
          },
        },
      ],
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });

  } catch (error) {
    console.error(
      "GET PRODUCTS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET SELLER'S PRODUCTS
// =====================================================
//
// This endpoint is for Seller Dashboard only.
//
// It returns:
// - Pending Organic products
// - Verified Organic products
// - Natural products
// - Eco-Friendly products
//
// Only products belonging to the logged-in seller
// are returned.
// =====================================================

const getSellerProducts = async (
  req,
  res
) => {
  try {
    const products =
      await Product.find({
        sellerId: req.user._id,
      }).sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });

  } catch (error) {
    console.error(
      "GET SELLER PRODUCTS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET ONE PRODUCT
// =====================================================

const getProductById = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });

  } catch (error) {
    console.error(
      "GET PRODUCT ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE PRODUCT
// =====================================================
//
// Admin:
//   Can update any product
//
// Seller:
//   Can update only their own product
//
// Seller updates:
//   verified becomes false
//
// =====================================================

const updateProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // -----------------------------------------------
    // SELLER OWNERSHIP CHECK
    // -----------------------------------------------

    if (
      req.user.role !== "admin" &&
      (
        !product.sellerId ||
        product.sellerId.toString() !==
          req.user._id.toString()
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only update your own products.",
      });
    }

    const {
      name,
      category,
      price,
      description,
      type,
      seller,
      certificate,
      stock,
      images,
    } = req.body;

    // -----------------------------------------------
    // BASIC FIELDS
    // -----------------------------------------------

    if (name !== undefined) {
      product.name = name.trim();
    }

    if (category !== undefined) {
      product.category =
        category.trim();
    }

    if (price !== undefined) {
      if (Number(price) < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid price",
        });
      }

      product.price =
        Number(price);
    }

    if (description !== undefined) {
      product.description =
        description.trim();
    }

    if (type !== undefined) {

      const allowedTypes = [
        "Organic",
        "Natural",
        "Eco-Friendly",
      ];

      if (
        !allowedTypes.includes(type)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product type",
        });
      }

      product.type = type;
    }

    if (seller !== undefined) {
      product.seller =
        seller.trim();
    }

    // -----------------------------------------------
    // CERTIFICATE
    // -----------------------------------------------

    if (
      product.type === "Organic"
    ) {

      if (
        certificate !== undefined
      ) {
        product.certificate =
          certificate.trim();
      }

      if (
        !product.certificate
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Organic products require a certificate",
        });
      }

    } else {

      product.certificate = "";

    }

    // -----------------------------------------------
    // STOCK
    // -----------------------------------------------

    if (stock !== undefined) {

      if (Number(stock) < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Stock cannot be negative",
        });
      }

      product.stock =
        Number(stock);
    }

    // -----------------------------------------------
    // IMAGES
    // -----------------------------------------------

    if (images !== undefined) {
      product.images =
        Array.isArray(images)
          ? images
          : [];
    }

    // -----------------------------------------------
    // SELLER UPDATE
    // -----------------------------------------------
    //
    // Seller modifications remove previous
    // Organic approval.
    //
    // Admin updates preserve verification.
    //

    if (
      req.user.role !== "admin"
    ) {
      product.verified = false;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message:
        "Product updated successfully",
      product,
    });

  } catch (error) {
    console.error(
      "UPDATE PRODUCT ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// ADMIN VERIFY ORGANIC PRODUCT
// =====================================================

const verifyProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Only Organic products
    // can be verified.

    if (
      product.type !== "Organic"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only Organic products require verification",
      });
    }

    // Certificate required

    if (
      !product.certificate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Organic product certificate is required",
      });
    }

    product.verified = true;

    await product.save();

    res.status(200).json({
      success: true,
      message:
        "Organic product verified successfully",
      product,
    });

  } catch (error) {
    console.error(
      "VERIFY PRODUCT ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getSellerProducts,
  getProductById,
  updateProduct,
  verifyProduct,
};