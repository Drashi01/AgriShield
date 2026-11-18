import pg from 'pg';
import dotenv from 'dotenv';
import { resolveIndianLocation } from '../utils/indiaGeoGazetteer.js';

dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/agrismart_db';

let isPgConnected = false;
let pgPool = null;

try {
  pgPool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 2000,
  });

  pgPool.on('error', (err) => {
    if (isPgConnected) {
      console.warn('[PostgreSQL Pool Warning]:', err.message);
    }
  });
} catch (e) {
  console.warn('[PostgreSQL Init]', e.message);
}

// -------------------------------------------------------------
// COMPREHENSIVE PAN-INDIA MOCK STORE (All Indian States & Agri Zones)
// -------------------------------------------------------------
export const mockStore = {
  users: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      phone: '9876543210',
      password_hash: '$2a$10$wT8vM97fK2dD6m1rY9XUOuQJcQnF8d4vF3Lz9E5gXmJ1aK0bL1bGe',
      name: 'Gurpreet Singh',
      role: 'farmer',
      lat: 30.900965,
      lng: 75.857277,
      address_text: 'Ludhiana, Punjab',
      created_at: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      phone: '9876543211',
      password_hash: '$2a$10$wT8vM97fK2dD6m1rY9XUOuQJcQnF8d4vF3Lz9E5gXmJ1aK0bL1bGe',
      name: 'Rajesh Sharma',
      role: 'buyer',
      lat: 30.920000,
      lng: 75.870000,
      address_text: 'Model Town, Ludhiana, Punjab',
      created_at: new Date().toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      phone: '9876543212',
      password_hash: '$2a$10$wT8vM97fK2dD6m1rY9XUOuQJcQnF8d4vF3Lz9E5gXmJ1aK0bL1bGe',
      name: 'Suresh Patil',
      role: 'farmer',
      lat: 19.9975,
      lng: 73.7898,
      address_text: 'Nashik, Maharashtra',
      created_at: new Date().toISOString()
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      phone: '9876543213',
      password_hash: '$2a$10$wT8vM97fK2dD6m1rY9XUOuQJcQnF8d4vF3Lz9E5gXmJ1aK0bL1bGe',
      name: 'Venkatesh Gowda',
      role: 'farmer',
      lat: 14.6784,
      lng: 75.4855,
      address_text: 'Byadagi, Haveri District, Karnataka',
      created_at: new Date().toISOString()
    }
  ],
  cropListings: [
    // 1. Punjab - Basmati Rice
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      farmer_id: '11111111-1111-1111-1111-111111111111',
      crop_name: 'Basmati Rice (Pusa 1121)',
      variety: 'A-Grade Long Grain Export',
      quantity_kg: 5000,
      base_price_per_kg: 42.50,
      current_highest_bid: 48.00,
      status: 'open',
      expires_at: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
      lat: 30.900965,
      lng: 75.857277,
      state: 'Punjab',
      district: 'Ludhiana',
      village: 'Khanna Mandi',
      image_urls: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80'],
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    // 2. Punjab - Sharbati Wheat
    {
      id: 'a0000000-0000-0000-0000-000000000002',
      farmer_id: '11111111-1111-1111-1111-111111111111',
      crop_name: 'Organic Sharbati Wheat',
      variety: 'C.306 Golden High Protein',
      quantity_kg: 8500,
      base_price_per_kg: 28.00,
      current_highest_bid: 31.50,
      status: 'open',
      expires_at: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
      lat: 30.915000,
      lng: 75.840000,
      state: 'Punjab',
      district: 'Ludhiana',
      village: 'Samrala',
      image_urls: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80'],
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    // 3. Maharashtra - Nashik Red Onion
    {
      id: 'a0000000-0000-0000-0000-000000000003',
      farmer_id: '33333333-3333-3333-3333-333333333333',
      crop_name: 'Nashik Red Onions (Garwa)',
      variety: 'Export Quality 45mm+',
      quantity_kg: 12000,
      base_price_per_kg: 18.00,
      current_highest_bid: 22.50,
      status: 'open',
      expires_at: new Date(Date.now() + 1000 * 60 * 90).toISOString(),
      lat: 20.1478,
      lng: 74.2257,
      state: 'Maharashtra',
      district: 'Nashik',
      village: 'Lasalgaon Mandi',
      image_urls: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80'],
      created_at: new Date(Date.now() - 5400000).toISOString()
    },
    // 4. Maharashtra - Thomson Seedless Grapes
    {
      id: 'a0000000-0000-0000-0000-000000000004',
      farmer_id: '33333333-3333-3333-3333-333333333333',
      crop_name: 'Thomson Seedless Green Grapes',
      variety: 'Sweet Table Grapes (TSS 18+)',
      quantity_kg: 4000,
      base_price_per_kg: 65.00,
      current_highest_bid: 74.00,
      status: 'open',
      expires_at: new Date(Date.now() + 1000 * 60 * 180).toISOString(),
      lat: 19.9975,
      lng: 73.7898,
      state: 'Maharashtra',
      district: 'Nashik',
      village: 'Dindori Valley',
      image_urls: ['https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80'],
      created_at: new Date(Date.now() - 10800000).toISOString()
    },
    // 5. Karnataka - Byadagi Red Chilli
    {
      id: 'a0000000-0000-0000-0000-000000000005',
      farmer_id: '44444444-4444-4444-4444-444444444444',
      crop_name: 'Byadagi Red Chilli (Kaddi)',
      variety: 'Deep Red High Color / Low Pungency',
      quantity_kg: 3500,
      base_price_per_kg: 180.00,
      current_highest_bid: 205.00,
      status: 'open',
      expires_at: new Date(Date.now() + 1000 * 60 * 300).toISOString(),
      lat: 14.6784,
      lng: 75.4855,
      state: 'Karnataka',
      district: 'Haveri',
      village: 'Byadagi APMC',
      image_urls: ['https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80'],
      created_at: new Date(Date.now() - 4000000).toISOString()
    },
    // 6. Andhra Pradesh - Guntur Sannam Chilli
    {
      id: 'a0000000-0000-0000-0000-000000000006',
      farmer_id: '44444444-4444-4444-4444-444444444444',
      crop_name: 'Guntur Sannam Chilli (S4)',
      variety: 'Spicy Premium Quality',
      quantity_kg: 6000,
      base_price_per_kg: 160.00,
      current_highest_bid: 172.00,
      status: 'open',
      expires_at: new Date(Date.now() + 1000 * 60 * 240).toISOString(),
      lat: 16.3067,
      lng: 80.4365,
      state: 'Andhra Pradesh',
      district: 'Guntur',
      village: 'Guntur Yard',
      image_urls: ['https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80'],
      created_at: new Date().toISOString()
    },
    // 7. Gujarat - Unjha Cumin (Jeera)
    {
      id: 'a0000000-0000-0000-0000-000000000007',
      farmer_id: '11111111-1111-1111-1111-111111111111',
      crop_name: 'Unjha Organic Cumin (Jeera)',
      variety: 'Machine Cleaned Bold A-Grade',
      quantity_kg: 2800,
      base_price_per_kg: 260.00,
      current_highest_bid: 285.00,
      status: 'open',
      expires_at: new Date(Date.now() + 1000 * 60 * 150).toISOString(),
      lat: 23.8037,
      lng: 72.3917,
      state: 'Gujarat',
      district: 'Mehsana',
      village: 'Unjha Mandi',
      image_urls: ['https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80'],
      created_at: new Date().toISOString()
    },
    // 8. Rajasthan - Nagaur Kasuri Methi
    {
      id: 'a0000000-0000-0000-0000-000000000008',
      farmer_id: '11111111-1111-1111-1111-111111111111',
      crop_name: 'Nagaur Kasuri Methi (Dried Fenugreek)',
      variety: 'Aromatic Green Sun-Dried',
      quantity_kg: 1500,
      base_price_per_kg: 120.00,
      current_highest_bid: 135.00,
      status: 'open',
      expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      lat: 27.1983,
      lng: 73.7493,
      state: 'Rajasthan',
      district: 'Nagaur',
      village: 'Merta City',
      image_urls: ['https://images.unsplash.com/photo-1508747703725-719777637510?w=600&auto=format&fit=crop&q=80'],
      created_at: new Date().toISOString()
    },
    // 9. Uttar Pradesh - Dasheri Mangoes (Seasonal Lot)
    {
      id: 'a0000000-0000-0000-0000-000000000009',
      farmer_id: '11111111-1111-1111-1111-111111111111',
      crop_name: 'Malihabad Dasheri Mangoes',
      variety: 'Naturally Tree-Ripened GI Tagged',
      quantity_kg: 4500,
      base_price_per_kg: 55.00,
      current_highest_bid: 62.00,
      status: 'open',
      expires_at: new Date(Date.now() + 1000 * 60 * 180).toISOString(),
      lat: 26.9200,
      lng: 80.7100,
      state: 'Uttar Pradesh',
      district: 'Lucknow',
      village: 'Malihabad Orchards',
      image_urls: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80'],
      created_at: new Date().toISOString()
    },
    // 10. Kashmir - Saffron & Walnuts
    {
      id: 'a0000000-0000-0000-0000-000000000010',
      farmer_id: '11111111-1111-1111-1111-111111111111',
      crop_name: 'Kashmiri Mongra Saffron (GI Tagged)',
      variety: 'Pure Grade A1 Stigmas',
      quantity_kg: 25,
      base_price_per_kg: 185000.00,
      current_highest_bid: 210000.00,
      status: 'open',
      expires_at: new Date(Date.now() + 1000 * 60 * 360).toISOString(),
      lat: 34.0200,
      lng: 74.9300,
      state: 'Jammu and Kashmir',
      district: 'Pulwama',
      village: 'Pampore Karewas',
      image_urls: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80'],
      created_at: new Date().toISOString()
    }
  ],
  bids: [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      listing_id: 'a0000000-0000-0000-0000-000000000001',
      buyer_id: '22222222-2222-2222-2222-222222222222',
      bid_amount_per_kg: 48.00,
      total_amount: 240000,
      is_winning: true,
      created_at: new Date(Date.now() - 300000).toISOString()
    }
  ],
  diagnosticScans: [
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      farmer_id: '11111111-1111-1111-1111-111111111111',
      crop_name: 'Wheat',
      detected_condition: 'Yellow Rust (Puccinia striiformis)',
      confidence_score: 94.8,
      severity: 'Moderate',
      image_url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&auto=format&fit=crop&q=80',
      remedies_applied: [
        'Apply Propiconazole 25% EC @ 1ml/L water',
        'Avoid excessive nitrogen fertilizer application',
        'Ensure proper crop spacing for air circulation'
      ],
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  syncOutbox: new Map()
};

// Haversine formula for PostGIS distance calculation
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
};

export const checkDbConnection = async () => {
  if (!pgPool) return false;
  try {
    await pgPool.query('SELECT 1');
    isPgConnected = true;
    return true;
  } catch (err) {
    isPgConnected = false;
    return false;
  }
};

checkDbConnection();
export const isDatabaseLive = () => isPgConnected;

/**
 * Universal Query Engine supporting both native PostgreSQL + PostGIS and In-Memory Pan-India spatial queries
 */
export const query = async (text, params = []) => {
  if (isPgConnected && pgPool) {
    try {
      return await pgPool.query(text, params);
    } catch (e) {
      console.warn('[PostgreSQL Query Fallback to Pan-India Engine]:', e.message);
    }
  }

  const trimmed = text.trim();

  // Health check query
  if (trimmed.includes('postgis_version') || trimmed.includes('SELECT 1')) {
    return {
      rowCount: 1,
      rows: [{ server_time: new Date().toISOString(), postgis: '3.4.0 (Pan-India PostGIS Simulation Engine)' }]
    };
  }

  // Select user by phone
  if (trimmed.includes('FROM users') && trimmed.includes('phone = $1')) {
    const user = mockStore.users.find(u => u.phone === params[0]);
    return { rowCount: user ? 1 : 0, rows: user ? [{ ...user }] : [] };
  }

  // Select user by id
  if (trimmed.includes('FROM users') && trimmed.includes('id = $1')) {
    const user = mockStore.users.find(u => u.id === params[0]);
    return { rowCount: user ? 1 : 0, rows: user ? [{ ...user }] : [] };
  }

  // Nearby listings with PostGIS spatial radius calculation
  if (trimmed.includes('ST_DWithin') || trimmed.includes('distance_km')) {
    const centerLng = params[0];
    const centerLat = params[1];
    const radiusMeters = params[2] || 50000;
    const maxRadiusKm = radiusMeters / 1000;

    let items = mockStore.cropListings
      .filter(l => l.status === 'open' && new Date(l.expires_at) > new Date())
      .map(l => {
        const farmer = mockStore.users.find(u => u.id === l.farmer_id) || {};
        const dist = calculateDistanceKm(centerLat, centerLng, l.lat, l.lng);
        const totalBids = mockStore.bids.filter(b => b.listing_id === l.id).length;
        return {
          ...l,
          farmer_name: farmer.name || 'Farmer',
          farmer_phone: farmer.phone || '',
          distance_km: dist,
          total_bids: totalBids
        };
      });

    // If maxRadiusKm is large (e.g. >= 500km or Pan-India), return all sorted by distance
    if (maxRadiusKm < 2000) {
      items = items.filter(l => l.distance_km <= maxRadiusKm);
    }

    items.sort((a, b) => a.distance_km - b.distance_km);
    return { rowCount: items.length, rows: items };
  }

  // Select single listing by id
  if (trimmed.includes('FROM crop_listings') && trimmed.includes('id = $1')) {
    const listing = mockStore.cropListings.find(l => l.id === params[0]);
    if (listing) {
      const farmer = mockStore.users.find(u => u.id === listing.farmer_id) || {};
      return {
        rowCount: 1,
        rows: [{
          ...listing,
          farmer_name: farmer.name || 'Farmer',
          farmer_phone: farmer.phone || '',
          farmer_address: farmer.address_text || ''
        }]
      };
    }
    return { rowCount: 0, rows: [] };
  }

  // Bids for listing
  if (trimmed.includes('FROM bids') && trimmed.includes('listing_id = $1')) {
    const listingBids = mockStore.bids
      .filter(b => b.listing_id === params[0])
      .map(b => {
        const buyer = mockStore.users.find(u => u.id === b.buyer_id) || {};
        return { ...b, buyer_name: buyer.name || 'Buyer', buyer_phone: buyer.phone || '' };
      });
    return { rowCount: listingBids.length, rows: listingBids };
  }

  // Diagnostic scans history
  if (trimmed.includes('FROM diagnostic_scans')) {
    const scans = mockStore.diagnosticScans.filter(s => s.farmer_id === params[0]);
    return { rowCount: scans.length, rows: scans };
  }

  // Insert diagnostic scan
  if (trimmed.startsWith('INSERT INTO diagnostic_scans')) {
    const newScan = {
      id: crypto.randomUUID(),
      farmer_id: params[0],
      crop_name: params[1],
      detected_condition: params[2],
      confidence_score: parseFloat(params[3]),
      severity: params[4],
      image_url: params[5],
      remedies_applied: typeof params[6] === 'string' ? JSON.parse(params[6]) : params[6],
      created_at: new Date().toISOString()
    };
    mockStore.diagnosticScans.unshift(newScan);
    return { rowCount: 1, rows: [newScan] };
  }

  return { rowCount: 0, rows: [] };
};

export const getClient = async () => {
  if (isPgConnected && pgPool) {
    try {
      return await pgPool.connect();
    } catch (e) {
      console.warn('[getClient Fallback]:', e.message);
    }
  }

  return {
    query: async (text, params = []) => {
      const trimmed = text.trim();
      if (trimmed === 'BEGIN' || trimmed === 'COMMIT' || trimmed === 'ROLLBACK') {
        return { rowCount: 0, rows: [] };
      }

      if (trimmed.includes('FROM sync_outbox') && trimmed.includes('client_mutation_id = $1')) {
        const found = mockStore.syncOutbox.get(params[0]);
        return { rowCount: found ? 1 : 0, rows: found ? [found] : [] };
      }

      if (trimmed.startsWith('INSERT INTO sync_outbox')) {
        const record = {
          id: crypto.randomUUID(),
          client_mutation_id: params[0],
          user_id: params[1],
          entity_type: params[2],
          status: params[3] || 'processed',
          payload: params[4],
          processed_at: new Date().toISOString()
        };
        mockStore.syncOutbox.set(params[0], record);
        return { rowCount: 1, rows: [record] };
      }

      if (trimmed.includes('FOR UPDATE') && trimmed.includes('FROM crop_listings')) {
        const listing = mockStore.cropListings.find(l => l.id === params[0]);
        return { rowCount: listing ? 1 : 0, rows: listing ? [{ ...listing }] : [] };
      }

      if (trimmed.startsWith('INSERT INTO bids')) {
        const newBid = {
          id: crypto.randomUUID(),
          listing_id: params[0],
          buyer_id: params[1],
          bid_amount_per_kg: parseFloat(params[2]),
          total_amount: parseFloat(params[3]),
          created_at: new Date().toISOString()
        };
        mockStore.bids.unshift(newBid);
        return { rowCount: 1, rows: [newBid] };
      }

      if (trimmed.startsWith('UPDATE crop_listings')) {
        const listing = mockStore.cropListings.find(l => l.id === (params[1] || params[0]));
        if (listing) {
          listing.current_highest_bid = parseFloat(params[0]);
          if (trimmed.includes("INTERVAL '2 minutes'")) {
            listing.expires_at = new Date(new Date(listing.expires_at).getTime() + 120000).toISOString();
          }
          return { rowCount: 1, rows: [listing] };
        }
      }

      return query(text, params);
    },
    release: () => {}
  };
};

export const pool = {
  query,
  end: async () => {
    if (pgPool) await pgPool.end();
  }
};

export default {
  pool,
  query,
  getClient,
  isDatabaseLive,
  calculateDistanceKm,
  mockStore
};
