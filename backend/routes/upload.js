const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

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
    const garmentDesc = req.body.garmentDescription || 'Clothing item';

    try {
      // --- PASS 1: Apply User-Uploaded Garment ---
      const formData = new FormData();
      formData.append('userImage', fs.createReadStream(userImagePath));
      formData.append('clothImage', fs.createReadStream(clothImagePath));
      formData.append('garmentDescription', garmentDesc);

      console.log(`Executing Try-On for: ${garmentDesc}`);
      const aiResponse = await axios.post(aiServiceUrl, formData, {
        headers: {
          ...formData.getHeaders()
        },
        responseType: 'arraybuffer'
      });

      // Save the final generated image
      const resultFileName = `result-${Date.now()}.png`;
      const resultPath = path.join(resultsDir, resultFileName);
      fs.writeFileSync(resultPath, aiResponse.data);

      const resultImageUrl = `/results/${resultFileName}`;

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
  // Database has been removed, returning empty array
  res.status(200).json([]);
});

module.exports = router;
