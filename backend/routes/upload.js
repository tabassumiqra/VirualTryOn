const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const TryOnResult = require('../models/TryOnResult');

const router = express.Router();

// Ensure directories exist
const uploadsDir = path.join(__dirname, '../uploads');
const resultsDir = path.join(__dirname, '../results');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir);

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.post('/try-on', upload.fields([
  { name: 'userImage', maxCount: 1 },
  { name: 'clothImage', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files.userImage || !req.files.clothImage) {
      return res.status(400).json({ error: 'Please provide both userImage and clothImage' });
    }

    const userImagePath = req.files.userImage[0].path;
    const clothImagePath = req.files.clothImage[0].path;

    // Call Python Microservice
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000/try-on';
    
    const formData = new FormData();
    formData.append('userImage', fs.createReadStream(userImagePath));
    formData.append('clothImage', fs.createReadStream(clothImagePath));

    try {
      const aiResponse = await axios.post(aiServiceUrl, formData, {
        headers: {
          ...formData.getHeaders()
        },
        responseType: 'arraybuffer' // We expect an image file back
      });

      // Save the generated image
      const resultFileName = `result-${Date.now()}.png`;
      const resultPath = path.join(resultsDir, resultFileName);
      fs.writeFileSync(resultPath, aiResponse.data);

      const userImageUrl = `/uploads/${path.basename(userImagePath)}`;
      const clothImageUrl = `/uploads/${path.basename(clothImagePath)}`;
      const resultImageUrl = `/results/${resultFileName}`;

      // Save to database
      try {
        const tryOnResult = new TryOnResult({
          userImage: userImageUrl,
          clothImage: clothImageUrl,
          resultImage: resultImageUrl,
        });
        await tryOnResult.save();
      } catch (dbError) {
        console.error('Failed to save to database (ignoring error):', dbError.message);
      }

      res.status(200).json({
        success: true,
        resultImageUrl
      });
    } catch (aiError) {
      console.error('Error from AI microservice:', aiError.message);
      return res.status(500).json({ error: 'Failed to process images via AI service.' });
    }

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to fetch history
router.get('/history', async (req, res) => {
  try {
    const results = await TryOnResult.find().sort({ createdAt: -1 });
    res.status(200).json(results);
  } catch (error) {
    console.error('DB Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
