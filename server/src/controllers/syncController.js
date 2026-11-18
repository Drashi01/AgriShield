import { getClient } from '../db/pool.js';
import { z } from 'zod';

const mutationItemSchema = z.object({
  clientMutationId: z.string().uuid('clientMutationId must be a valid UUID'),
  type: z.enum(['CREATE_LISTING', 'RECORD_DIAGNOSTIC', 'OFFLINE_BID']),
  payload: z.record(z.any()),
  timestamp: z.union([z.string(), z.number()]).optional()
});

const syncBatchSchema = z.object({
  mutations: z.array(mutationItemSchema).min(1, 'At least one mutation is required in batch')
});

/**
 * POST /api/sync/batch
 * Offline-First Replay Engine with idempotency guarantee
 */
export const syncBatchMutations = async (req, res, next) => {
  const userId = req.user.id;
  const client = await getClient();

  try {
    const validated = syncBatchSchema.parse(req.body);
    const results = [];

    // Process each mutation in an isolated transaction or step
    for (const item of validated.mutations) {
      const { clientMutationId, type, payload } = item;

      try {
        await client.query('BEGIN');

        // Step 1: Idempotency Check
        const outboxCheck = await client.query(
          'SELECT id, status FROM sync_outbox WHERE client_mutation_id = $1 FOR UPDATE',
          [clientMutationId]
        );

        if (outboxCheck.rowCount > 0) {
          // Already reconciled earlier - skip cleanly
          await client.query('COMMIT');
          results.push({
            clientMutationId,
            status: 'synced',
            message: 'Already reconciled (idempotent skip)'
          });
          continue;
        }

        // Step 2: Route Mutation Type
        let mutationResult = null;

        if (type === 'CREATE_LISTING') {
          const {
            crop_name,
            variety,
            quantity_kg,
            base_price_per_kg,
            expires_at,
            lat,
            lng,
            image_urls
          } = payload;

          const listingRes = await client.query(
            `INSERT INTO crop_listings (
              farmer_id, crop_name, variety, quantity_kg, base_price_per_kg,
              current_highest_bid, status, expires_at, location, image_urls
            )
            VALUES (
              $1, $2, $3, $4, $5, $5, 'open', $6,
              ST_SetSRID(ST_MakePoint($7, $8), 4326)::geography, $9
            )
            RETURNING id, crop_name, quantity_kg, base_price_per_kg, expires_at`,
            [
              userId,
              crop_name,
              variety || null,
              parseFloat(quantity_kg),
              parseFloat(base_price_per_kg),
              new Date(expires_at || Date.now() + 86400000),
              parseFloat(lng || 0),
              parseFloat(lat || 0),
              image_urls || []
            ]
          );
          mutationResult = listingRes.rows[0];

        } else if (type === 'RECORD_DIAGNOSTIC') {
          const {
            crop_name,
            detected_condition,
            confidence_score,
            severity,
            image_url,
            remedies_applied
          } = payload;

          const diagRes = await client.query(
            `INSERT INTO diagnostic_scans (
              farmer_id, crop_name, detected_condition, confidence_score,
              severity, image_url, remedies_applied
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, crop_name, detected_condition, confidence_score, created_at`,
            [
              userId,
              crop_name || 'Crop Leaf',
              detected_condition || 'Healthy',
              parseFloat(confidence_score || 90.0),
              severity || 'Low',
              image_url || null,
              JSON.stringify(remedies_applied || [])
            ]
          );
          mutationResult = diagRes.rows[0];

        } else if (type === 'OFFLINE_BID') {
          const { listingId, bidAmountPerKg } = payload;
          const numBid = parseFloat(bidAmountPerKg);

          // Lock listing row
          const listingLock = await client.query(
            `SELECT id, base_price_per_kg, current_highest_bid, status, expires_at, quantity_kg
             FROM crop_listings 
             WHERE id = $1 
             FOR UPDATE`,
            [listingId]
          );

          if (listingLock.rowCount === 0) {
            throw new Error(`Listing ${listingId} not found`);
          }

          const listing = listingLock.rows[0];

          if (listing.status !== 'open' || new Date(listing.expires_at) <= new Date()) {
            throw new Error(`Auction for listing ${listingId} has already expired or closed`);
          }

          if (numBid <= parseFloat(listing.current_highest_bid) || numBid < parseFloat(listing.base_price_per_kg)) {
            throw new Error(`Bid amount ₹${numBid} must be higher than current highest ₹${listing.current_highest_bid}`);
          }

          const totalAmount = numBid * parseFloat(listing.quantity_kg);

          // Insert bid
          const bidRes = await client.query(
            `INSERT INTO bids (listing_id, buyer_id, bid_amount_per_kg, total_amount)
             VALUES ($1, $2, $3, $4)
             RETURNING id, listing_id, bid_amount_per_kg, total_amount, created_at`,
            [listingId, userId, numBid, totalAmount]
          );

          // Update listing top bid
          await client.query(
            `UPDATE crop_listings SET current_highest_bid = $1, updated_at = NOW() WHERE id = $2`,
            [numBid, listingId]
          );

          mutationResult = bidRes.rows[0];
        }

        // Step 3: Record successfully processed mutation into outbox
        await client.query(
          `INSERT INTO sync_outbox (client_mutation_id, user_id, entity_type, status, payload)
           VALUES ($1, $2, $3, 'processed', $4)`,
          [clientMutationId, userId, type, JSON.stringify(payload)]
        );

        await client.query('COMMIT');

        results.push({
          clientMutationId,
          status: 'synced',
          type,
          data: mutationResult
        });
      } catch (mutationError) {
        await client.query('ROLLBACK');

        // Log failed sync attempt in outbox for audit
        try {
          await client.query(
            `INSERT INTO sync_outbox (client_mutation_id, user_id, entity_type, status, payload, error_message)
             VALUES ($1, $2, $3, 'failed', $4, $5)
             ON CONFLICT (client_mutation_id) DO NOTHING`,
            [clientMutationId, userId, type, JSON.stringify(payload), mutationError.message]
          );
        } catch (e) {
          // ignore duplicate insert errors
        }

        results.push({
          clientMutationId,
          status: 'failed',
          type,
          error: mutationError.message
        });
      }
    }

    res.status(200).json({
      success: true,
      total_processed: results.length,
      synced_count: results.filter(r => r.status === 'synced').length,
      failed_count: results.filter(r => r.status === 'failed').length,
      results
    });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};
