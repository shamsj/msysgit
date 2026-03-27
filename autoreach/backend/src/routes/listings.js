const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db');
const { identifyVehicle } = require('../services/vision');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WebP images are allowed'));
    }
  },
});

// Upload photo and identify vehicle
router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const photoUrl = `/uploads/${req.file.filename}`;

    // Identify vehicle using OpenAI Vision
    const vehicleData = await identifyVehicle(req.file.path);

    if (vehicleData.error) {
      return res.status(422).json({ error: vehicleData.error });
    }

    const id = uuidv4();
    await pool.query(
      `INSERT INTO listings (id, photo_url, make, model, year, trim, condition, color, estimated_mileage, ai_confidence, ai_raw_response, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active')`,
      [
        id,
        photoUrl,
        vehicleData.make,
        vehicleData.model,
        vehicleData.year,
        vehicleData.trim,
        vehicleData.condition,
        vehicleData.color,
        vehicleData.estimated_mileage,
        vehicleData.confidence,
        JSON.stringify(vehicleData),
      ]
    );

    res.json({
      id,
      photoUrl,
      vehicle: vehicleData,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// Get a single listing
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM listings WHERE id = $1', [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Get listing error:', err);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// Get all listings for a seller
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM listings ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get offers for a listing
router.get('/:id/offers', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM offers WHERE listing_id = $1 ORDER BY amount DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get offers error:', err);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// Dealer submits an offer
router.post('/:id/offers', async (req, res) => {
  try {
    const { dealer_name, dealer_email, amount, message } = req.body;
    if (!dealer_name || !dealer_email || !amount) {
      return res
        .status(400)
        .json({ error: 'dealer_name, dealer_email, and amount are required' });
    }

    const id = uuidv4();
    await pool.query(
      `INSERT INTO offers (id, listing_id, dealer_name, dealer_email, amount, message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, req.params.id, dealer_name, dealer_email, amount, message]
    );

    res.status(201).json({ id, listing_id: req.params.id, amount });
  } catch (err) {
    console.error('Create offer error:', err);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

// Accept an offer
router.post('/:listingId/offers/:offerId/accept', async (req, res) => {
  try {
    await pool.query('UPDATE offers SET status = $1 WHERE id = $2', [
      'accepted',
      req.params.offerId,
    ]);
    await pool.query(
      "UPDATE offers SET status = 'rejected' WHERE listing_id = $1 AND id != $2 AND status = 'pending'",
      [req.params.listingId, req.params.offerId]
    );
    await pool.query('UPDATE listings SET status = $1 WHERE id = $2', [
      'sold',
      req.params.listingId,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error('Accept offer error:', err);
    res.status(500).json({ error: 'Failed to accept offer' });
  }
});

module.exports = router;
