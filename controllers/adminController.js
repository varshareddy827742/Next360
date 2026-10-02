const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// =====================================================
// USER MANAGEMENT
// =====================================================

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all sellers
const getAllSellers = async (req, res) => {
  try {
    const sellers = await User.find({
      role: "seller",
    })
      .select("-password")
      .sort({ createdAt: -1 });

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

// Get all buyers
const getAllBuyers = async (req, res) => {
  try {
    const buyers = await User.find({
      role: "buyer",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: buyers.length,
      buyers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update user active/inactive status
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deactivating their own account
    if (
      user._id.toString() === req.user._id.toString() &&
      isActive === false
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot deactivate your own admin account",
      });
    }

    user.isActive = isActive;

    await user.save();

    const safeUser = await User.findById(user._id)
      .select("-password");

    res.status(200).json({
      success: true,
      message: isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// PRODUCT MANAGEMENT
// =====================================================

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get pending Organic products
const getPendingOrganicProducts = async (req, res) => {
  try {
    const products = await Product.find({
      type: "Organic",
      verified: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve product
const approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.type !== "Organic") {
      return res.status(400).json({
        success: false,
        message:
          "Only Organic products require admin approval",
      });
    }

    if (!product.certificate) {
      return res.status(400).json({
        success: false,
        message:
          "Organic product certificate is required before approval",
      });
    }

    product.verified = true;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product approved successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reject product
const rejectProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.type !== "Organic") {
      return res.status(400).json({
        success: false,
        message:
          "Only Organic products can be rejected through approval flow",
      });
    }

    product.verified = false;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product rejected successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// ORDER MANAGEMENT
// =====================================================

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get admin order by ID
const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update order status by admin
const updateAdminOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "PLACED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order status. Allowed values: PLACED, SHIPPED, DELIVERED, CANCELLED",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// ADMIN DASHBOARD
// =====================================================

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // =================================================
    // PLATFORM COMMISSION
    // =================================================

    // Current technical default commission rate
    // Business commission range: 10% - 20%
    const commissionRate = 10;

    // =================================================
    // FETCH DASHBOARD DATA
    // =================================================

    const [
      totalUsers,
      totalBuyers,
      totalSellers,

      totalProducts,
      verifiedProducts,
      pendingOrganicProducts,

      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,

      paidOrders,
      pendingPaymentOrders,

      salesResult,
    ] = await Promise.all([
      // ===============================================
      // USERS
      // ===============================================

      User.countDocuments({}),

      User.countDocuments({
        role: "buyer",
      }),

      User.countDocuments({
        role: "seller",
      }),

      // ===============================================
      // PRODUCTS
      // ===============================================

      Product.countDocuments({}),

      Product.countDocuments({
        verified: true,
      }),

      Product.countDocuments({
        type: "Organic",
        verified: false,
      }),

      // ===============================================
      // ORDERS
      // ===============================================

      Order.countDocuments({}),

      Order.countDocuments({
        orderStatus: "PLACED",
      }),

      Order.countDocuments({
        orderStatus: "SHIPPED",
      }),

      Order.countDocuments({
        orderStatus: "DELIVERED",
      }),

      Order.countDocuments({
        orderStatus: "CANCELLED",
      }),

      // ===============================================
      // PAYMENTS
      // ===============================================

      Order.countDocuments({
        paymentStatus: "PAID",
      }),

      Order.countDocuments({
        paymentStatus: "PENDING",
      }),

      // ===============================================
      // SALES
      // ===============================================

      // Cancelled orders are excluded from sales
      Order.aggregate([
        {
          $match: {
            orderStatus: {
              $ne: "CANCELLED",
            },
          },
        },
        {
          $group: {
            _id: null,

            totalSales: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),
    ]);

    // =================================================
    // SALES CALCULATION
    // =================================================

    const totalSales =
      salesResult.length > 0
        ? salesResult[0].totalSales
        : 0;

    // Platform commission
    const commissionAmount =
      (totalSales * commissionRate) / 100;

    // Amount remaining for sellers
    const sellerEarnings =
      totalSales - commissionAmount;

    // =================================================
    // ADMIN DASHBOARD RESPONSE
    // =================================================

    res.status(200).json({
      success: true,

      dashboard: {
        // =============================================
        // USERS
        // =============================================

        users: {
          total: totalUsers,
          buyers: totalBuyers,
          sellers: totalSellers,
        },

        // =============================================
        // PRODUCTS
        // =============================================

        products: {
          total: totalProducts,
          verified: verifiedProducts,
          pendingOrganic: pendingOrganicProducts,
        },

        // =============================================
        // ORDERS
        // =============================================

        orders: {
          total: totalOrders,
          pending: pendingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },

        // =============================================
        // PAYMENTS
        // =============================================

        payments: {
          paid: paidOrders,
          pending: pendingPaymentOrders,
        },

        // =============================================
        // SALES & COMMISSION
        // =============================================

        sales: {
          total: totalSales,
          commissionRate: commissionRate,
          commissionAmount: commissionAmount,
          sellerEarnings: sellerEarnings,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
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
};