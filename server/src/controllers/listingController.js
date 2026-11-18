import { z } from 'zod';
import { query } from '../db/pool.js';
import { resolveIndianLocation, reverseGeocodeIndianLocation } from '../utils/indiaGeoGazetteer.js';

// Validation Schema for Listing Creation
export const createListingSchema = z.object({
  crop_name: z.string().min(2, 'Crop name is required'),
  variety: z.string().optional(),
  quantity_kg: z.number().positive('Quantity must be greater than 0'),
  base_price_per_kg: z.number().nonnegative('Base price cannot be negative'),
  expires_at: z.string().datetime('Valid ISO expiration date required'),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  zone: z.string().optional(),
  village: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  image_urls: z.array(z.string().url()).optional().default([])
});

/**
 * POST /api/listings
 * Create a new crop listing batch with Pan-India zone / current location resolution
 */
export const createListing = async (req, res, next) => {
  try {
    const validated = createListingSchema.parse(req.body);
    let {
      crop_name,
      variety,
      quantity_kg,
      base_price_per_kg,
      expires_at,
      lat,
      lng,
      zone,
      village,
      district,
      state,
      image_urls
    } = validated;

    const farmer_id = req.user.id;

    if ((lat === undefined || lng === undefined) && (zone || village || district || state)) {
      const locationText = zone || `${village ? village + ', ' : ''}${district ? district + ', ' : ''}${state || ''}`;
      const resolved = await resolveIndianLocation(locationText);
      if (resolved) {
        lat = resolved.lat;
        lng = resolved.lng;
      }
    }

    lat = lat !== undefined ? lat : 20.5937;
    lng = lng !== undefined ? lng : 78.9629;

    const insertSql = `
      INSERT INTO crop_listings (
        farmer_id,
        crop_name,
        variety,
        quantity_kg,
        base_price_per_kg,
        current_highest_bid,
        status,
        expires_at,
        location,
        image_urls
      )
      VALUES (
        $1, $2, $3, $4, $5, $5, 'open', $6,
        ST_SetSRID(ST_MakePoint($7, $8), 4326)::geography,
        $9
      )
      RETURNING 
        id, farmer_id, crop_name, variety, quantity_kg, 
        base_price_per_kg, current_highest_bid, status, expires_at,
        ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng,
        image_urls, created_at
    `;

    const result = await query(insertSql, [
      farmer_id,
      crop_name,
      variety || null,
      quantity_kg,
      base_price_per_kg,
      expires_at,
      lng,
      lat,
      image_urls
    ]);

    res.status(201).json({
      success: true,
      message: 'Crop listing created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/listings/nearby
 * PostGIS spatial radius search across ANY Indian City, State, District, Mandi, Town, Village or Current GPS Location
 */
export const getNearbyListings = async (req, res, next) => {
  try {
    let lat = parseFloat(req.query.lat);
    let lng = parseFloat(req.query.lng);
    const radiusKm = parseFloat(req.query.radius_km || '100');
    const cropCategory = req.query.crop_category || req.query.crop_name;
    const sortBy = req.query.sort_by === 'expires_at' ? 'expires_at ASC' : 'distance_km ASC';
    const zoneQuery = req.query.zone || req.query.city || req.query.state || req.query.village || req.query.location;

    let resolvedZoneInfo = null;

    if ((isNaN(lat) || isNaN(lng)) && zoneQuery) {
      resolvedZoneInfo = await resolveIndianLocation(zoneQuery);
      if (resolvedZoneInfo) {
        lat = resolvedZoneInfo.lat;
        lng = resolvedZoneInfo.lng;
      }
    } else if (!isNaN(lat) && !isNaN(lng) && !zoneQuery) {
      // Raw GPS coordinates provided (e.g. from Current Location feature): reverse geocode to get human location name
      resolvedZoneInfo = await reverseGeocodeIndianLocation(lat, lng);
    }

    if (isNaN(lat) || isNaN(lng)) {
      lat = 20.5937;
      lng = 78.9629;
      resolvedZoneInfo = {
        name: 'All India',
        formatted_address: 'Pan-India Agricultural Network',
        lat,
        lng
      };
    }

    const radiusMeters = radiusKm * 1000;
    let sql = `
      SELECT 
        l.id,
        l.farmer_id,
        u.name AS farmer_name,
        u.phone AS farmer_phone,
        l.crop_name,
        l.variety,
        l.quantity_kg,
        l.base_price_per_kg,
        l.current_highest_bid,
        l.status,
        l.expires_at,
        l.image_urls,
        l.created_at,
        ST_Y(l.location::geometry) AS lat,
        ST_X(l.location::geometry) AS lng,
        ROUND((ST_Distance(l.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) / 1000)::numeric, 2) AS distance_km,
        (SELECT COUNT(*) FROM bids b WHERE b.listing_id = l.id)::int AS total_bids
      FROM crop_listings l
      JOIN users u ON l.farmer_id = u.id
      WHERE 
        l.status = 'open'
        AND l.expires_at > NOW()
        AND ST_DWithin(l.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
    `;

    const params = [lng, lat, radiusMeters];

    if (cropCategory) {
      params.push(`%${cropCategory}%`);
      sql += ` AND (l.crop_name ILIKE $${params.length} OR l.variety ILIKE $${params.length})`;
    }

    sql += ` ORDER BY ${sortBy} LIMIT 100`;

    const result = await query(sql, params);

    res.status(200).json({
      success: true,
      count: result.rowCount,
      search_zone: resolvedZoneInfo || { lat, lng },
      radius_km: radiusKm,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/listings/:id
 */
export const getListingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const listingSql = `
      SELECT 
        l.id,
        l.farmer_id,
        u.name AS farmer_name,
        u.phone AS farmer_phone,
        u.address_text AS farmer_address,
        l.crop_name,
        l.variety,
        l.quantity_kg,
        l.base_price_per_kg,
        l.current_highest_bid,
        l.status,
        l.expires_at,
        l.image_urls,
        l.created_at,
        ST_Y(l.location::geometry) AS lat,
        ST_X(l.location::geometry) AS lng
      FROM crop_listings l
      JOIN users u ON l.farmer_id = u.id
      WHERE l.id = $1
    `;

    const listingRes = await query(listingSql, [id]);

    if (listingRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Crop listing not found'
      });
    }

    const listing = listingRes.rows[0];

    const winningBidSql = `
      SELECT 
        b.id,
        b.buyer_id,
        u.name AS buyer_name,
        u.phone AS buyer_phone,
        b.bid_amount_per_kg,
        b.total_amount,
        b.is_winning,
        b.created_at
      FROM bids b
      JOIN users u ON b.buyer_id = u.id
      WHERE b.listing_id = $1
      ORDER BY b.bid_amount_per_kg DESC, b.created_at ASC
      LIMIT 1
    `;
    const winningRes = await query(winningBidSql, [id]);

    const recentBidsSql = `
      SELECT 
        b.id,
        b.buyer_id,
        u.name AS buyer_name,
        b.bid_amount_per_kg,
        b.total_amount,
        b.created_at
      FROM bids b
      JOIN users u ON b.buyer_id = u.id
      WHERE b.listing_id = $1
      ORDER BY b.created_at DESC
      LIMIT 10
    `;
    const bidsRes = await query(recentBidsSql, [id]);

    res.status(200).json({
      success: true,
      data: {
        ...listing,
        winning_bid: winningRes.rows[0] || null,
        recent_bids: bidsRes.rows
      }
    });
  } catch (error) {
    next(error);
  }
};
