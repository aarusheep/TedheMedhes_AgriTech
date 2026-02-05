const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const Batch = require('../models/Batch');
const User = require('../models/User');
const { createBatchAndListing, getListings, getListingById, updateListing } = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');
const Order = require('../models/Order');

// Helper to map listing -> frontend post shape
const mapListingToPost = (listing) => {
  const batch = listing.batch || {};
  const seller = listing.seller || {};
  return {
    _id: listing._id,
    postId: batch.batchId || listing._id,
    farmerName: seller.name || 'Unknown',
    productName: batch.cropName || 'Product',
    quantity: listing.quantityAvailable,
    price: listing.pricePerKg || listing.price || 0,
    status: listing.isActive ? 'Available' : 'Sold',
    harvestDate: batch.harvestDate,
    location: { address: batch.originLocation || '' },
    images: (batch.images && batch.images.length) ? batch.images : [],
    currentOwnerName: seller.name || '',
  };
};

// GET /api/posts/available
router.get('/available', protect, async (req, res) => {
  try {
    const listings = await Listing.find({ isActive: true })
      .populate('batch')
      .populate('seller', 'name');
    const data = listings.map(mapListingToPost);
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch available posts' });
  }
});

// GET /api/posts/my-posts -> listings where seller = me
router.get('/my-posts', protect, async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user._id })
      .populate('batch')
      .populate('seller', 'name');
    const data = listings.map(mapListingToPost);
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch my posts' });
  }
});

// GET /api/posts/owned -> listings owned by me (including child listings)
router.get('/owned', protect, async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user._id })
      .populate('batch')
      .populate('seller', 'name');
    const data = listings.map(mapListingToPost);
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch owned posts' });
  }
});

// NOTE: Route for specific id is defined after more specific paths

// POST /api/posts/create -> create listing (multipart/form-data expected)
router.post('/create', protect, async (req, res, next) => {
  // Delegate to existing controller but adapt input names
  // The controller expects cropName, quantity, pricePerKg, harvestDate, originLocation
  try {
    // If multipart, body parsing should have parsed fields already (express.json won't handle multipart)
    // For now assume frontend sends FormData and server has parsing for it elsewhere; attempt to read from req.body
    const { productName, quantity, price, harvestDate, location, description } = req.body;
    const originLocation = typeof location === 'string' ? (() => {
      try { return JSON.parse(location).address || location; } catch (e) { return location; }
    })() : (location && location.address) || '';

    req.body.cropName = productName || req.body.cropName;
    req.body.quantity = Number(quantity) || req.body.quantity;
    req.body.pricePerKg = Number(price) || req.body.pricePerKg;
    req.body.harvestDate = harvestDate || req.body.harvestDate;
    req.body.originLocation = originLocation || req.body.originLocation;
    req.body.description = description || req.body.description;

    return createBatchAndListing(req, res, next);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to create post' });
  }
});

// POST /api/posts/repost -> create child listing (repost) (multipart)
router.post('/repost', protect, async (req, res) => {
  try {
    // Expect originalPostId, newPrice, quantity, description
    const { originalPostId, newPrice, quantity } = req.body;
    if (!originalPostId) return res.status(400).json({ success: false, message: 'originalPostId required' });

    const parentListing = await Listing.findById(originalPostId);
    if (!parentListing) return res.status(404).json({ success: false, message: 'Original listing not found' });

    // Create a child listing owned by current user
    const child = await Listing.create({
      batch: parentListing.batch,
      seller: req.user._id,
      parentListing: parentListing._id,
      quantityAvailable: Number(quantity) || 0,
      pricePerKg: Number(newPrice) || parentListing.pricePerKg,
      isActive: true,
    });

    res.json({ success: true, data: { repostId: child._id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to repost' });
  }
});

// GET /api/posts/:postId/timeline -> get traceability from batch
router.get('/:postId/timeline', protect, async (req, res) => {
  try {
    const postId = req.params.postId;
    const batch = await Batch.findOne({ batchId: postId }).populate('journey.handler', 'name role');
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, data: batch.journey });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch timeline' });
  }
});

// GET /api/posts/selling -> get reposted/selling posts (child listings)
router.get('/selling', protect, async (req, res) => {
  try {
    const listings = await Listing.find({ parentListing: { $ne: null }, isActive: true })
      .populate('batch')
      .populate('seller', 'name');
    const data = listings.map(mapListingToPost);
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch selling posts' });
  }
});

// GET /api/posts/:id -> get listing details (placed after specific routes)
router.get('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('batch')
      .populate('seller', 'name location role mobile walletAddress');
    if (!listing) return res.status(404).json({ success: false, message: 'Post not found' });
    const post = mapListingToPost(listing);
    // Attach more raw fields
    post._raw = listing;
    res.json({ success: true, data: post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch post' });
  }
});

module.exports = router;
