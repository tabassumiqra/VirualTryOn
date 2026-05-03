const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/recommend', upload.single('userImage'), async (req, res) => {
  const { occasion, stylePreference, gender, season } = req.body;

  // Image is mandatory
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a photo of yourself.' });
  }

  if (!occasion || !gender || !season) {
    return res.status(400).json({ error: 'Please provide occasion, gender, and season.' });
  }

  try {
    const prompt = `You are a professional fashion stylist AI with expertise in personal styling, color theory, and body proportions.

Your task is to generate highly personalized outfit recommendations based on the user's uploaded photo.

User Input:
- Gender / Style Preference: ${gender} - ${stylePreference || 'Any'}
- Occasion: ${occasion}
- Season / Weather: ${season}

The user has provided a photo of themselves.
1. Analyze the image to accurately determine their skin tone, hair color, and body type (if visible).
2. Based on their actual features in the image, suggest the best color palette.

Instructions:
1. Suggest exactly 5 outfit ideas tailored to ALL user inputs.
2. Each outfit must include:
   - Outfit title
   - Detailed description (top, bottom, footwear, layering if needed)
   - Why it suits the body type
   - Why the colors suit the skin tone
   - Styling tips (fit, patterns, accessories)
3. Ensure outfits match the given occasion and season/weather.
4. Recommend appropriate fabrics (e.g., cotton for summer, wool for winter).
5. Suggest a color palette (5–7 colors) that complements the user's skin tone and style preference.
6. Keep suggestions modern, practical, and wearable in real life.
7. Avoid repetition and generic advice.

Output Format (STRICTLY FOLLOW):
{
  "outfits": [
    {
      "title": "",
      "description": "",
      "body_type_reason": "",
      "color_reason": "",
      "styling_tips": "",
      "recommended_colors": []
    }
  ],
  "color_palette": []
}

Tone: Professional, stylish, and easy to understand.
Do not output anything outside of the JSON object. Just return valid JSON.`;

    const modelToUse = "google/gemini-2.5-flash"; // Highly capable and extremely cheap vision model
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const imageUrl = `data:${mimeType};base64,${base64Image}`;
    
    const messages = [
      { 
        "role": "user", 
        "content": [
          { "type": "text", "text": prompt },
          { "type": "image_url", "image_url": { "url": imageUrl } }
        ] 
      }
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Virtual Try-On App",
      },
      body: JSON.stringify({
        "model": modelToUse,
        "messages": messages,
        "max_tokens": 2500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Unknown OpenRouter Error");
    }

    const data = await response.json();
    let responseText = data.choices[0].message.content;
    
    // Clean up potential markdown formatting block for JSON
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsedRecommendation = JSON.parse(responseText);
      res.json({ recommendation: parsedRecommendation });
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', responseText);
      res.status(500).json({ error: 'AI returned invalid data format.' });
    }
  } catch (error) {
    console.error('Error generating recommendation:', error.message);
    res.status(500).json({ error: `AI Error: ${error.message}` });
  }
});

module.exports = router;
