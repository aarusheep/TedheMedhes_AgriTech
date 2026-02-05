const crypto = require('crypto');

let razorpay = null;
try {
  const Razorpay = require('razorpay');
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } else {
    console.warn('Razorpay keys missing; payment features running in simulated mode');
  }
} catch (e) {
  console.warn('Razorpay module not available, running in simulated payment mode');
}

// @desc    Create a payment order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res) => {
  const { amount, currency = 'INR', receipt, postId } = req.body;

  try {
    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };
    if (razorpay) {
      const order = await razorpay.orders.create(options);
      // Return normalized response expected by frontend
      res.json({ success: true, data: { orderId: order.id, amount: order.amount, currency: order.currency, postId } });
    } else {
      // Simulate an order for development when Razorpay is not configured
      const fakeOrder = { id: `order_test_${Date.now()}`, amount: options.amount, currency };
      res.json({ success: true, data: { orderId: fakeOrder.id, amount: fakeOrder.amount, currency: fakeOrder.currency, postId } });
    }
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

  // If Razorpay secret not configured, accept verification in dev mode
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.json({ success: true, message: 'Payment verified (simulated)' });
  }

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
