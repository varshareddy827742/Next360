const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const walletRoutes = require("./routes/walletRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// User routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/admin", adminRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Next360 Backend API",
  });
});

// Test API route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Next360 API is working successfully",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Next360 Backend running on port ${PORT}`);
});