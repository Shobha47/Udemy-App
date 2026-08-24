const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/payment.controller');

const {
  authenticate,
  authorize,
} = require('../middlewares/auth.middleware');

// ─────────────────────────────────────────────
// RAZORPAY WEBHOOK
// IMPORTANT:
// This route MUST use raw body
// and MUST be registered before express.json()
// ─────────────────────────────────────────────
router.post('/webhook', express.json(), paymentController.razorpayWebhook);  // Razorpay sends JSON, not raw

// ─────────────────────────────────────────────
// STUDENT ROUTES
// ─────────────────────────────────────────────

// Create Stripe Checkout Session
router.post(
  '/checkout/:courseId',
  authenticate,
  paymentController.createCheckoutSession
);

// Verify Razorpay Session after payment
router.post('/verify', authenticate, paymentController.verifyPayment);        // POST with 3 IDs from frontend

// Get logged in student orders
router.get(
  '/orders',
  authenticate,
  paymentController.getMyOrders
);

// Get single order
router.get(
  '/orders/:orderId',
  authenticate,
  paymentController.getOrderById
);

// ─────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────

// Refund order
router.post(
  '/refund/:orderId',
  authenticate,
  authorize('SUPERADMIN'),
  paymentController.issueRefund
);

// Get all orders
router.get(
  '/admin/orders',
  authenticate,
  authorize('SUPERADMIN'),
  paymentController.adminGetAllOrders
);

module.exports = router;