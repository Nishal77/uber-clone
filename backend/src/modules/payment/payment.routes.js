const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const paymentController = require('./payment.controller');

// Create Razorpay order
router.post('/create-order',
    authMiddleware.authUser,
    paymentController.createOrder
);

// Verify Razorpay payment
router.post('/verify-payment',
    authMiddleware.authUser,
    paymentController.verifyPayment
);

// Get payment status
router.get('/status/:rideId',
    authMiddleware.authUser,
    paymentController.getPaymentStatus
);

module.exports = router;
