# AutoReach - AI-Powered Reverse Car Marketplace

Sellers upload car photos → AI identifies the vehicle → Dealers compete with offers.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL running locally
- OpenAI API key

### 1. Database Setup
```bash
createdb autoreach
psql autoreach < backend/src/db/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env   # Add your OPENAI_API_KEY
npm install
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## How It Works

1. **Upload** - Seller uploads a photo of their car
2. **AI Identification** - OpenAI Vision identifies make, model, year, trim, condition
3. **Listing Created** - Vehicle listing is stored and distributed to dealers
4. **Dealer Offers** - Dealers submit competing offers
5. **Accept Best Offer** - Seller reviews and accepts from the dashboard

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/listings/upload` | Upload photo & identify vehicle |
| GET | `/api/listings` | List all listings |
| GET | `/api/listings/:id` | Get single listing |
| GET | `/api/listings/:id/offers` | Get offers for a listing |
| POST | `/api/listings/:id/offers` | Submit a dealer offer |
| POST | `/api/listings/:lid/offers/:oid/accept` | Accept an offer |
