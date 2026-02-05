const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const { encrypt } = require('../utils/encryption');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// In-memory OTP store: { mobile: { otp, expiresAt, meta } }
const otpStore = new Map();

// Helper to create a random 6-digit OTP
const createOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Send OTP to mobile (simulated)
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) return res.status(400).json({ message: 'Mobile number required' });

  const otp = createOTP();
  const expiresAt = Date.now() + 1000 * 60 * 5; // 5 minutes

  otpStore.set(mobile, { otp, expiresAt });

  // NOTE: In production you would integrate with SMS gateway here.
  console.log(`Generated OTP for ${mobile}: ${otp}`);

  res.json({ success: true, message: 'OTP sent' });
};

// @desc    Verify OTP and return/create user
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  const { mobile, otp, isSignup, name, role } = req.body;

  if (!mobile || !otp) return res.status(400).json({ message: 'Mobile and OTP required' });

  const record = otpStore.get(mobile);
  if (!record || record.expiresAt < Date.now() || record.otp !== otp) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  try {
    let user = await User.findOne({ mobile });

    if (!user && isSignup) {
      // Create a lightweight user with a random password
      const randomPassword = Math.random().toString(36).slice(-8) + Date.now();
      user = await User.create({
        name: name || 'Unnamed',
        mobile,
        password: randomPassword,
        role: (role && typeof role === 'string') ? role.toLowerCase() : 'farmer'
      });
    }

    if (!user) {
      // Auto-create a user for convenience (signup-less login)
      const randomPassword = Math.random().toString(36).slice(-8) + Date.now();
      user = await User.create({
        name: name || 'Unnamed',
        mobile,
        password: randomPassword,
        role: (role && typeof role === 'string') ? role.toLowerCase() : 'distributor'
      });
    }

    // Clear OTP after successful verification
    otpStore.delete(mobile);

    return res.json({
      success: true,
      data: {
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          mobile: user.mobile,
          role: user.role,
          walletAddress: user.walletAddress,
        }
      }
    });
  } catch (error) {
    console.error('verifyOTP error', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, mobile, password, role, location, phone } = req.body;

  try {
    // Check if user exists by email OR mobile
    const userExists = await User.findOne({
      $or: [
        { email: email || 'null_email' },
        { mobile: mobile || 'null_mobile' }
      ]
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 1. Generate Wallet
    const wallet = ethers.Wallet.createRandom();
    const walletAddress = wallet.address;
    const encryptedPrivateKey = encrypt(wallet.privateKey);

    // 2. Create User
    const user = await User.create({
      name,
      email,
      mobile,
      password,
      role,
      location,
      phone,
      walletAddress,
      encryptedPrivateKey // Stored securely
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        walletAddress: user.walletAddress, // Return public address
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, mobile, password } = req.body;

  try {
    // Check login by Email OR Mobile
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (mobile) {
      user = await User.findOne({ mobile });
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        token: generateToken(user._id),
      });
    } else {
      res.status(500).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private (Needs middleware)
const getUserProfile = async (req, res) => {
  // Assuming middleware adds user to req
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        location: user.location
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

module.exports = { registerUser, loginUser, getUserProfile, sendOTP, verifyOTP };
