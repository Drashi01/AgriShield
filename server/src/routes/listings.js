import { Router } from 'express';
import { createListing, getNearbyListings, getListingById } from '../controllers/listingController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = Router();

// Publicly searchable geo-radius marketplace
router.get('/nearby', getNearbyListings);

// Individual listing with auction bids
router.get('/:id', getListingById);

// Farmer-only listing creation
router.post('/', authenticateToken, requireRoles('farmer', 'admin'), createListing);

export default router;
