const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { initBlockchain } = require('./utils/blockchain');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();
// Initialize Blockchain Connection
initBlockchain();

const app = express();
app.use((req, res, next) => {
  console.log(`${req.method} request received at ${req.url}`);
  next();
});

// Configure CORS to allow frontend dev servers
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
};

app.use(cors({
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Provide both singular and plural payment mount points for frontend compatibility
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// Existing listings API
app.use('/api/listings', require('./routes/listingRoutes'));
// Provide frontend-compatible posts endpoints that map to listings/orders models
app.use('/api/posts', require('./routes/postsRoutes'));

app.use('/api/orders', require('./routes/orderRoutes'));
// Frontend expects /api/requests for buy requests
app.use('/api/requests', require('./routes/orderRoutes'));

app.use('/api/traceability', require('./routes/traceabilityRoutes'));

// IPFS helper endpoints
app.use('/api/ipfs', require('./routes/ipfsRoutes'));
// app.use('/api/blockchain', require('./routes/blockchainRoutes'));

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
