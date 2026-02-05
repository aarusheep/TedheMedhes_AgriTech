const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay (with proper error handling)
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('⚠️  Razorpay credentials not found. Payment features will be disabled.');
}

// @desc    Create a payment order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ 
      message: 'Payment service not configured. Please contact administrator.' 
    });
  }

  const { amount, currency = 'INR', receipt } = req.body;

  try {
    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ message: 'Payment order creation failed', error: error.error ? error.error.description : error.message });
  }
};

// @desc    Verify payment signature
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Database update logic here (e.g., mark order as paid)
    res.json({ message: 'Payment verified successfully', success: true });
  } else {
    res.status(400).json({ message: 'Invalid payment signature', success: false });
  }
};

module.exports = { createOrder, verifyPayment };
