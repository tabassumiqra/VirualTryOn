const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/recommend', async (req, res) => {
  const { skinTone, bodyType, occasion, stylePreference } = req.body;

  if (!skinTone || !bodyType || !occasion) {
    return res.status(400).json({ error: 'Please provide skin tone, body type, and occasion.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a professional fashion stylist. A client has provided the following physical traits and event details:
- Skin Tone: ${skinTone}
- Body Type: ${bodyType}
- Occasion: ${occasion}
- Style Preference: ${stylePreference || 'Surprise me'}

Based on this information, suggest ONE incredible outfit. 
Include:
1. The type of clothes that would flatter their body type for this occasion.
2. The color palette that best compliments their skin tone.
3. A brief explanation of why this outfit works.

Keep the response concise, punchy, and formatted with emojis. Do NOT use markdown.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({ recommendation: responseText });
  } catch (error) {
    console.error('Error generating recommendation:', error);
    res.status(500).json({ error: 'Failed to generate recommendation. Make sure GEMINI_API_KEY is configured in backend/.env' });
  }
});

module.exports = router;
