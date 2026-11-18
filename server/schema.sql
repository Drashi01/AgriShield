-- ==========================================================
-- AgriSmart / AgriShield Production Database Schema
-- PostgreSQL + PostGIS (Spatial & Concurrency-Safe Engine)
-- ==========================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('farmer', 'buyer', 'admin')),
    location GEOGRAPHY(Point, 4326),
    address_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crop Listings Table
CREATE TABLE IF NOT EXISTS crop_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    quantity_kg NUMERIC(10,2) NOT NULL CHECK (quantity_kg > 0),
    base_price_per_kg NUMERIC(10,2) NOT NULL CHECK (base_price_per_kg >= 0),
    current_highest_bid NUMERIC(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('draft', 'open', 'bidding_closed', 'fulfilled')),
    expires_at TIMESTAMPTZ NOT NULL,
    location GEOGRAPHY(Point, 4326),
    image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bids Table
CREATE TABLE IF NOT EXISTS bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES crop_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    bid_amount_per_kg NUMERIC(10,2) NOT NULL CHECK (bid_amount_per_kg > 0),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount > 0),
    is_winning BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Diagnostic Scans Table (AI Plant Pathology)
CREATE TABLE IF NOT EXISTS diagnostic_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_name VARCHAR(50),
    detected_condition VARCHAR(100) NOT NULL,
    confidence_score NUMERIC(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
    severity VARCHAR(50) DEFAULT 'Moderate',
    image_url TEXT,
    remedies_applied JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Sync Outbox Reconciliation Table (Idempotency Guard for Rural Offline Sync)
CREATE TABLE IF NOT EXISTS sync_outbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_mutation_id UUID UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'processed' CHECK (status IN ('processed', 'failed')),
    payload JSONB,
    error_message TEXT,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- Spatial GiST & Concurrency B-Tree Indexes
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_users_location_gist ON users USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_crop_listings_location_gist ON crop_listings USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_crop_listings_status_expires ON crop_listings (status, expires_at);
CREATE INDEX IF NOT EXISTS idx_crop_listings_farmer_id ON crop_listings (farmer_id);
CREATE INDEX IF NOT EXISTS idx_bids_listing_amount ON bids (listing_id, bid_amount_per_kg DESC);
CREATE INDEX IF NOT EXISTS idx_bids_buyer_id ON bids (buyer_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_scans_farmer ON diagnostic_scans (farmer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_outbox_mutation ON sync_outbox (client_mutation_id);
