const express = require('express');
const router = express.Router();
const { uploadToIPFS } = require('../utils/ipfs');
const multer = require('multer');
const upload = multer();

// POST /api/ipfs/upload
// Accept a multipart/form-data with field `file` or a JSON body
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    let payload;
    if (req.file) {
      // Pass file buffer and originalname for backend IPFS stub
      payload = { buffer: req.file.buffer, filename: req.file.originalname };
    } else {
      payload = req.body || {};
    }

    const hash = await uploadToIPFS(payload);
    res.json({ success: true, data: { ipfsHash: hash } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'IPFS upload failed' });
  }
});

module.exports = router;
