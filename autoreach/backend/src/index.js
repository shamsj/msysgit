require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db');
const listingsRouter = require('./routes/listings');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/listings', listingsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'autoreach-api' });
});

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`AutoReach API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
