const express = require('express');
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
  paystackWebhook,
  getPaymentStatus
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Initialize payment (protected - user must be logged in)
router.post('/initialize', protect, initializePayment);

// Verify payment
router.get('/verify/:reference', verifyPayment);

// Get payment status for an order
router.get('/status/:orderId', protect, getPaymentStatus);

// Paystack webhook (no auth required - Paystack calls this)
router.post('/webhook/paystack', paystackWebhook);

module.exports = router;

