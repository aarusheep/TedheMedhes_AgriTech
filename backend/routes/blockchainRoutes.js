const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchainService');
const { protect } = require('../middleware/authMiddleware');

// @desc    Create a new batch on blockchain
// @route   POST /api/blockchain/batch
// @access  Private (only authenticated users)
router.post('/batch', protect, async (req, res) => {
  try {
    const { batchId, quantity, farmerId, metadata } = req.body;

    if (!batchId || !quantity || !farmerId) {
      return res.status(400).json({ 
        message: 'Please provide batchId, quantity, and farmerId' 
      });
    }

    const result = await blockchainService.createBatch(
      batchId,
      quantity,
      farmerId,
      metadata || {}
    );

    res.status(201).json({
      success: true,
      message: 'Batch created on blockchain',
      data: result
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Get batch details from blockchain
// @route   GET /api/blockchain/batch/:batchId
// @access  Public
router.get('/batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    const result = await blockchainService.getBatch(batchId);

    res.json(result);
  } catch (error) {
    console.error('Error getting batch:', error);
    res.status(404).json({ 
      success: false,
      message: 'Batch not found or error occurred',
      error: error.message 
    });
  }
});

// @desc    Transfer batch to new holder
// @route   PUT /api/blockchain/batch/:batchId/transfer
// @access  Private
router.put('/batch/:batchId/transfer', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    const { toId } = req.body;

    if (!toId) {
      return res.status(400).json({ 
        message: 'Please provide toId (new holder ID)' 
      });
    }

    const result = await blockchainService.transferBatch(batchId, toId);

    res.json({
      success: true,
      message: 'Batch transferred successfully',
      data: result
    });
  } catch (error) {
    console.error('Error transferring batch:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Split batch into parent and child
// @route   POST /api/blockchain/batch/:parentId/split
// @access  Private
router.post('/batch/:parentId/split', protect, async (req, res) => {
  try {
    const { parentId } = req.params;
    const { childId, quantity, newHolder, metadata } = req.body;

    if (!childId || !quantity || !newHolder) {
      return res.status(400).json({ 
        message: 'Please provide childId, quantity, and newHolder' 
      });
    }

    const result = await blockchainService.splitBatch(
      parentId,
      childId,
      quantity,
      newHolder,
      metadata || {}
    );

    res.status(201).json({
      success: true,
      message: 'Batch split successfully',
      data: result
    });
  } catch (error) {
    console.error('Error splitting batch:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Check if batch exists
// @route   GET /api/blockchain/batch/:batchId/exists
// @access  Public
router.get('/batch/:batchId/exists', async (req, res) => {
  try {
    const { batchId } = req.params;
    const exists = await blockchainService.batchExists(batchId);

    res.json({
      success: true,
      exists
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Get current gas price
// @route   GET /api/blockchain/gas-price
// @access  Public
router.get('/gas-price', async (req, res) => {
  try {
    const gasPrice = await blockchainService.getGasPrice();

    res.json({
      success: true,
      gasPrice: gasPrice + ' Gwei'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Get wallet balance
// @route   GET /api/blockchain/balance/:address
// @access  Public
router.get('/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await blockchainService.getBalance(address);

    res.json({
      success: true,
      address,
      balance: balance + ' MATIC/ETH'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;
