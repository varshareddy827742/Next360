const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

// CREATE ORDER
const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      customerName,
      phone,
      address,
      city,
      pincode,
      items,
      paymentMethod,
    } = req.body;

    // VALIDATE CUSTOMER DELIVERY DETAILS
    if (
      typeof customerName !== "string" ||
      typeof phone !== "string" ||
      typeof address !== "string" ||
      typeof city !== "string" ||
      typeof pincode !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer delivery details must be valid text values",
      });
    }

    const cleanCustomerName = customerName.trim();
    const cleanPhone = phone.trim();
    const cleanAddress = address.trim();
    const cleanCity = city.trim();
    const cleanPincode = pincode.trim();

    if (
      !cleanCustomerName ||
      !cleanPhone ||
      !cleanAddress ||
      !cleanCity ||
      !cleanPincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer delivery details are required",
      });
    }

    // VALIDATE ITEMS
    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one product",
      });
    }

    // VALIDATE PAYMENT METHOD
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    const allowedPaymentMethods = [
      "COD",
      "UPI",
      "WALLET",
    ];

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    session.startTransaction();

    // GENERATE ORDER NUMBER
    const lastOrder = await Order.findOne()
      .sort({ createdAt: -1 })
      .session(session);

    let orderNumber = "NX360001";

    if (lastOrder && lastOrder.orderNumber) {
      const lastNumber = parseInt(
        lastOrder.orderNumber.replace("NX360", ""),
        10
      );

      if (!isNaN(lastNumber)) {
        orderNumber = `NX360${String(
          lastNumber + 1
        ).padStart(3, "0")}`;
      }
    }

    const orderItems = [];
    let totalAmount = 0;

    // VALIDATE PRODUCTS AND STOCK
    for (const item of items) {
      if (!item.productId) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: "Product ID is required for every item",
        });
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Product quantity must be a positive whole number",
        });
      }

      const product = await Product.findById(
        item.productId
      ).session(session);

      if (!product) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message:
            `Product not found: ${item.productId}`,
        });
      }

      if (!product.sellerId) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            `Seller information is missing for ${product.name}`,
        });
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            `Insufficient stock for ${product.name}. Available stock: ${product.stock}`,
        });
      }

      const itemTotal =
        product.price * item.quantity;

      totalAmount += itemTotal;

      orderItems.push({
        productId: product._id,
        sellerId: product.sellerId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        seller: product.seller,
      });
    }

    // REDUCE STOCK SAFELY INSIDE TRANSACTION
    for (const item of orderItems) {
      const updatedProduct =
        await Product.findOneAndUpdate(
          {
            _id: item.productId,
            stock: {
              $gte: item.quantity,
            },
          },
          {
            $inc: {
              stock: -item.quantity,
            },
          },
          {
            new: true,
            session,
          }
        );

      if (!updatedProduct) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            `Insufficient stock for ${item.name}.`,
        });
      }
    }

    // CREATE ORDER INSIDE TRANSACTION
    const order = new Order({
      orderNumber,
      userId: req.user._id,
      customerName: cleanCustomerName,
      phone: cleanPhone,
      address: cleanAddress,
      city: cleanCity,
      pincode: cleanPincode,
      items: orderItems,
      totalAmount,
      paymentMethod,
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
    });

    await order.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("CREATE ORDER ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// GET MY ORDERS
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("GET BUYER ORDERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ONE ORDER
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      order.userId &&
      order.userId.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only view your own orders.",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("GET ORDER ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SELLER ORDERS
const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      "items.sellerId": req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("GET SELLER ORDERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE ORDER STATUS
const updateOrderStatus = async (req, res) => {
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
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (req.user.role === "admin") {
      order.orderStatus = orderStatus;

      await order.save();

      return res.status(200).json({
        success: true,
        message:
          "Order status updated successfully",
        order,
      });
    }

    if (req.user.role === "seller") {
      const sellerOwnsOrder = order.items.some(
        (item) =>
          item.sellerId &&
          item.sellerId.toString() ===
            req.user._id.toString()
      );

      if (!sellerOwnsOrder) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. This order does not contain your products.",
        });
      }

      order.orderStatus = orderStatus;

      await order.save();

      return res.status(200).json({
        success: true,
        message:
          "Order status updated successfully",
        order,
      });
    }

    return res.status(403).json({
      success: false,
      message:
        "Access denied. Buyers cannot update order status.",
    });
  } catch (error) {
    console.error(
      "UPDATE ORDER STATUS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getSellerOrders,
  updateOrderStatus,
};