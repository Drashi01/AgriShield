import { Router } from 'express';
import { 
  INDIA_ZONES_DATABASE, 
  searchIndianZones, 
  resolveIndianLocation, 
  reverseGeocodeIndianLocation 
} from '../utils/indiaGeoGazetteer.js';

const router = Router();

/**
 * GET /api/geo/zones
 * Returns all predefined Pan-India agricultural zones, mandis, and districts
 */
router.get('/zones', (req, res) => {
  res.status(200).json({
    success: true,
    total: INDIA_ZONES_DATABASE.length,
    zones: INDIA_ZONES_DATABASE
  });
});

/**
 * GET /api/geo/search?q=...
 * Search any Indian City, State, District, Mandi, Town, or Village with autocompletion
 */
router.get('/search', async (req, res, next) => {
  try {
    const q = req.query.q || req.query.query || '';
    if (!q.trim()) {
      return res.status(200).json({ success: true, results: INDIA_ZONES_DATABASE.slice(0, 10) });
    }

    let matches = searchIndianZones(q);

    if (matches.length === 0) {
      const resolved = await resolveIndianLocation(q);
      if (resolved) {
        matches = [resolved];
      }
    }

    res.status(200).json({
      success: true,
      query: q,
      results: matches
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/geo/resolve?location=...
 * Forward Geocoding: Resolves place name to coordinates
 */
router.get('/resolve', async (req, res, next) => {
  try {
    const loc = req.query.location || req.query.zone || req.query.q;
    if (!loc) {
      return res.status(400).json({ success: false, message: 'location parameter is required' });
    }

    const resolved = await resolveIndianLocation(loc);
    res.status(200).json({
      success: true,
      data: resolved
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/geo/reverse?lat=...&lng=...
 * Reverse Geocoding: Resolves device's Current Location GPS coordinates to Indian City, District, State & Mandi
 */
router.get('/reverse', async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Valid numeric "lat" and "lng" query parameters are required for reverse geocoding.'
      });
    }

    const locationDetails = await reverseGeocodeIndianLocation(lat, lng);
    res.status(200).json({
      success: true,
      data: locationDetails
    });
  } catch (err) {
    next(err);
  }
});

export default router;
