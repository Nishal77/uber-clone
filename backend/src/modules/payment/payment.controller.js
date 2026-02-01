const Razorpay = require('razorpay');
const crypto = require('crypto');
const rideModel = require('../ride/ride.model');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
module.exports.createOrder = async (req, res) => {
    try {
        const { rideId, amount } = req.body;

        console.log('Creating Razorpay order for ride:', rideId, 'Amount:', amount);

        // Validate inputs
        if (!rideId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Ride ID and amount are required'
            });
        }

        // Validate Razorpay credentials
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('Razorpay credentials missing!');
            return res.status(500).json({
                success: false,
                message: 'Payment gateway not configured'
            });
        }

        // Create Razorpay order
        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise (integer)
            currency: 'INR',
            receipt: `ride_${rideId}_${Date.now()}`,
            notes: {
                rideId: rideId,
                userId: req.user._id.toString()
            }
        };

        console.log('Razorpay order options:', options);

        const order = await razorpay.orders.create(options);

        console.log('Razorpay order created:', order);

        // Update ride with orderId
        await rideModel.findByIdAndUpdate(rideId, {
            orderId: order.id,
            paymentMethod: 'online'
        });

        res.status(200).json({
            success: true,
            order: order,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: error.message
        });
    }
};

// Verify Razorpay payment
module.exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, rideId } = req.body;

        console.log('Verifying payment for ride:', rideId);

        // Create signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        // Verify signature
        if (razorpay_signature === expectedSign) {
            // Payment is verified
            const ride = await rideModel.findByIdAndUpdate(
                rideId,
                {
                    paymentID: razorpay_payment_id,
                    orderId: razorpay_order_id,
                    signature: razorpay_signature,
                    paymentMethod: 'online'
                },
                { new: true }
            );

            console.log('✅ Payment verified successfully for ride:', rideId);

            return res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                ride: ride
            });
        } else {
            console.error('❌ Invalid payment signature');
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message
        });
    }
};

// Get payment status
module.exports.getPaymentStatus = async (req, res) => {
    try {
        const { rideId } = req.params;

        const ride = await rideModel.findById(rideId);

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: 'Ride not found'
            });
        }

        const paymentStatus = {
            isPaid: ride.paymentID ? true : false,
            paymentMethod: ride.paymentMethod,
            paymentID: ride.paymentID,
            orderId: ride.orderId
        };

        res.status(200).json({
            success: true,
            paymentStatus: paymentStatus
        });

    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment status',
            error: error.message
        });
    }
};
