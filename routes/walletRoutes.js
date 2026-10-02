const express = require("express");

const {
  getMyWallet,
  addMoney,
  getWalletTransactions,
} = require("../controllers/walletController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();


// GET MY WALLET
router.get(
  "/",
  protect,
  authorize("buyer"),
  getMyWallet
);


// ADD MONEY
router.post(
  "/add-money",
  protect,
  authorize("buyer"),
  addMoney
);


// GET WALLET TRANSACTIONS
router.get(
  "/transactions",
  protect,
  authorize("buyer"),
  getWalletTransactions
);


module.exports = router;