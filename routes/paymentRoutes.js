const express = require('express');
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
  paystackWebhook,
  getPaymentStatus,
  initializeRemitaPayment,
  verifyRemitaPayment,
  remitaWebhook
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// ==================== PAYSTACK ROUTES ====================

// Initialize Paystack payment (protected - user must be logged in)
router.post('/paystack/initialize', protect, initializePayment);

// Verify Paystack payment
router.get('/paystack/verify/:reference', verifyPayment);

// Paystack webhook (no auth required - Paystack calls this)
router.post('/webhook/paystack', paystackWebhook);

// ==================== REMITA ROUTES ====================

// Initialize Remita payment (protected - user must be logged in)
router.post('/remita/initialize', protect, initializeRemitaPayment);

// Verify Remita payment
router.get('/remita/verify/:rrr', verifyRemitaPayment);

// Remita webhook (no auth required - Remita calls this)
router.post('/webhook/remita', remitaWebhook);

// ==================== GENERAL ROUTES ====================

// Get payment status for an order
router.get('/status/:orderId', protect, getPaymentStatus);

module.exports = router;

