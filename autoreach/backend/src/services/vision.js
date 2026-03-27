const OpenAI = require('openai');
const fs = require('fs');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function identifyVehicle(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are a car identification expert. Analyze this photo of a car and extract the following details. Respond ONLY with valid JSON, no markdown or extra text.

{
  "make": "manufacturer name",
  "model": "model name",
  "year": estimated year as number,
  "trim": "trim level if identifiable, otherwise null",
  "condition": "excellent | good | fair | poor",
  "color": "exterior color",
  "estimated_mileage": "estimated mileage range based on condition",
  "confidence": 0.0 to 1.0 confidence score
}

If the image is not a car, respond with: {"error": "No vehicle detected in image"}`,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    max_tokens: 500,
  });

  const content = response.choices[0].message.content.trim();

  // Strip markdown code fences if present
  const jsonStr = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');

  return JSON.parse(jsonStr);
}

module.exports = { identifyVehicle };
