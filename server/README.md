# 🌾 AgriSmart Backend Engine (PostGIS + WebSockets + Offline Replay)

Production-ready Node.js & PostgreSQL backend powering AgriShield / AgriSmart real-time auctions, geospatial farmer-to-buyer matching, AI leaf pathology scan logging, and offline-first IndexedDB reconciliation.

---

## 🚀 Quickstart Guide

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your PostgreSQL database credentials:
```bash
cp .env.example .env
```

### 3. Initialize PostgreSQL & PostGIS Database
Ensure PostgreSQL is installed with PostGIS extension. Execute the schema migration:
```bash
psql -U postgres -d agrismart_db -f schema.sql
```

### 4. Run Development Server
```bash
npm run dev
# Server will start on http://localhost:5000 and connect to http://localhost:5173
```

---

## 📡 API Overview

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register farmer/buyer with GPS coordinates | Public |
| `POST` | `/api/auth/login` | Login and receive JWT bearer token | Public |
| `GET` | `/api/listings/nearby` | Find crops within geo-radius (`lat`, `lng`, `radius_km`) | Public |
| `POST` | `/api/listings` | Create new batch listing | Farmer only |
| `GET` | `/api/listings/:id` | Get lot details, top bid, and latest 10 bids | Public |
| `POST` | `/api/diagnostics/log` | Upload leaf scan & record pathology diagnostic | Authenticated |
| `GET` | `/api/diagnostics/history` | Paginated pathology scan history | Farmer only |
| `POST` | `/api/sync/batch` | Idempotent reconciliation of queued offline mutations | Authenticated |

---

## ⚡ Real-Time WebSockets (Socket.IO)

- **Handshake Auth:** Send JWT token in `socket.handshake.auth.token` or `Authorization` header.
- **Events:**
  - `join_auction`: `{ listingId }` -> Joins room `auction_<listingId>`, returns initial state.
  - `place_bid`: `{ listingId, bidAmountPerKg }` -> Executes PostgreSQL `FOR UPDATE` row lock, verifies minimums, applies anti-sniping extension (+2m if <2m remaining), broadcasts `bid_updated` and `auction_extended`.
