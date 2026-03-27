const OpenAI = require('openai');
const fs = require('fs');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Mock response for demo/preview when no real API key is set
function getMockResponse() {
  const cars = [
    { make: 'Toyota', model: 'Camry', year: 2021, trim: 'SE', condition: 'good', color: 'Silver', estimated_mileage: '25,000 - 35,000', confidence: 0.87 },
    { make: 'Honda', model: 'Civic', year: 2022, trim: 'Sport', condition: 'excellent', color: 'Blue', estimated_mileage: '10,000 - 20,000', confidence: 0.92 },
    { make: 'Ford', model: 'F-150', year: 2020, trim: 'XLT', condition: 'good', color: 'White', estimated_mileage: '30,000 - 45,000', confidence: 0.84 },
    { make: 'BMW', model: '3 Series', year: 2023, trim: '330i', condition: 'excellent', color: 'Black', estimated_mileage: '5,000 - 15,000', confidence: 0.90 },
  ];
  return cars[Math.floor(Math.random() * cars.length)];
}

async function identifyVehicle(imagePath) {
  // Use mock data if no real API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock') {
    console.log('Using mock vehicle identification (no OPENAI_API_KEY set)');
    return getMockResponse();
  }

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
