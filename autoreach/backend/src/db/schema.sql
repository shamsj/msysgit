CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY,
  photo_url TEXT NOT NULL,
  make VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  trim VARCHAR(100),
  condition VARCHAR(50),
  color VARCHAR(50),
  estimated_mileage VARCHAR(50),
  ai_confidence DECIMAL(3,2),
  ai_raw_response JSONB,
  seller_email VARCHAR(255),
  seller_phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  dealer_name VARCHAR(255) NOT NULL,
  dealer_email VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dealers (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  business_name VARCHAR(255),
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
