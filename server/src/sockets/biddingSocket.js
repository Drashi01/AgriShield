import jwt from 'jsonwebtoken';
import { getClient, query } from '../db/pool.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_2026';

/**
 * Configure and register real-time auction WebSocket handlers
 * @param {import('socket.io').Server} io 
 */
export const registerBiddingSocket = (io) => {
  // Socket Authentication Middleware
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization &&
          socket.handshake.headers.authorization.split(' ')[1]);

      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded; // { id, phone, role, name }
      next();
    } catch (err) {
      console.warn('[Socket Auth] Connection rejected:', err.message);
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[WebSocket] Connected: socket=${socket.id} | user=${socket.user.name} (${socket.user.role})`);

    /**
     * Join auction room
     */
    socket.on('join_auction', async (data, callback) => {
      try {
        const listingId = typeof data === 'string' ? data : data?.listingId;
        if (!listingId) {
          if (callback) callback({ success: false, message: 'listingId is required' });
          return;
        }

        const roomName = `auction_${listingId}`;
        socket.join(roomName);

        // Fetch current auction status
        const listingRes = await query(
          `SELECT id, crop_name, current_highest_bid, base_price_per_kg, quantity_kg, status, expires_at 
           FROM crop_listings 
           WHERE id = $1`,
          [listingId]
        );

        if (listingRes.rowCount === 0) {
          if (callback) callback({ success: false, message: 'Listing not found' });
          return;
        }

        const listing = listingRes.rows[0];

        // Fetch winning bidder name if exists
        const topBidRes = await query(
          `SELECT b.bid_amount_per_kg, b.total_amount, u.name as buyer_name, b.created_at
           FROM bids b
           JOIN users u ON b.buyer_id = u.id
           WHERE b.listing_id = $1
           ORDER BY b.bid_amount_per_kg DESC, b.created_at ASC
           LIMIT 1`,
          [listingId]
        );

        const currentTopBid = topBidRes.rows[0] || null;

        const payload = {
          success: true,
          listingId: listing.id,
          cropName: listing.crop_name,
          currentHighestBid: parseFloat(listing.current_highest_bid),
          basePricePerKg: parseFloat(listing.base_price_per_kg),
          quantityKg: parseFloat(listing.quantity_kg),
          status: listing.status,
          expiresAt: listing.expires_at,
          topBid: currentTopBid
        };

        socket.emit('auction_state', payload);
        if (callback) callback(payload);
      } catch (err) {
        console.error('[Socket join_auction error]:', err);
        socket.emit('bid_error', { message: 'Failed to join auction room' });
      }
    });

    /**
     * Leave auction room
     */
    socket.on('leave_auction', (data) => {
      const listingId = typeof data === 'string' ? data : data?.listingId;
      if (listingId) {
        socket.leave(`auction_${listingId}`);
      }
    });

    /**
     * Place real-time bid with PostgreSQL FOR UPDATE row locking
     */
    socket.on('place_bid', async (payload, callback) => {
      const { listingId, bidAmountPerKg } = payload || {};
      const numBid = parseFloat(bidAmountPerKg);
      const buyerId = socket.user.id;
      const buyerName = socket.user.name;

      if (!listingId || isNaN(numBid) || numBid <= 0) {
        const errorMsg = 'Invalid bid amount or missing listingId';
        socket.emit('bid_error', { listingId, message: errorMsg });
        if (callback) callback({ success: false, message: errorMsg });
        return;
      }

      const client = await getClient();

      try {
        await client.query('BEGIN');

        // 1. Transactional Row-Level Lock
        const selectSql = `
          SELECT id, current_highest_bid, base_price_per_kg, status, expires_at, quantity_kg
          FROM crop_listings 
          WHERE id = $1 
          FOR UPDATE
        `;
        const lockRes = await client.query(selectSql, [listingId]);

        if (lockRes.rowCount === 0) {
          throw new Error('Listing not found');
        }

        const listing = lockRes.rows[0];
        const now = new Date();
        const expiresAt = new Date(listing.expires_at);
        const currentHighest = parseFloat(listing.current_highest_bid);
        const basePrice = parseFloat(listing.base_price_per_kg);
        const quantityKg = parseFloat(listing.quantity_kg);

        // 2. State & Timing Validations
        if (listing.status !== 'open') {
          throw new Error(`Auction is ${listing.status} and cannot accept new bids.`);
        }

        if (now >= expiresAt) {
          throw new Error('Auction has ended. Bidding is closed.');
        }

        if (numBid <= currentHighest) {
          throw new Error(`Your bid of ₹${numBid}/kg must exceed current highest bid of ₹${currentHighest}/kg.`);
        }

        if (numBid < basePrice) {
          throw new Error(`Bid must be at least the base price of ₹${basePrice}/kg.`);
        }

        const totalLotValue = numBid * quantityKg;

        // 3. Insert Bid
        const insertBidSql = `
          INSERT INTO bids (listing_id, buyer_id, bid_amount_per_kg, total_amount, is_winning)
          VALUES ($1, $2, $3, $4, FALSE)
          RETURNING id, created_at
        `;
        const bidRes = await client.query(insertBidSql, [listingId, buyerId, numBid, totalLotValue]);
        const newBid = bidRes.rows[0];

        // 4. Update Listing Current Highest Bid & Anti-Sniping Protection
        // Anti-Sniping: If remaining time < 2 minutes, extend by 2 minutes
        const timeRemainingMs = expiresAt.getTime() - now.getTime();
        let wasExtended = false;
        let newExpiryDate = expiresAt;

        if (timeRemainingMs < 2 * 60 * 1000) {
          wasExtended = true;
          const updateSql = `
            UPDATE crop_listings
            SET 
              current_highest_bid = $1,
              expires_at = expires_at + INTERVAL '2 minutes',
              updated_at = NOW()
            WHERE id = $2
            RETURNING expires_at
          `;
          const updateRes = await client.query(updateSql, [numBid, listingId]);
          newExpiryDate = updateRes.rows[0].expires_at;
        } else {
          await client.query(
            `UPDATE crop_listings SET current_highest_bid = $1, updated_at = NOW() WHERE id = $2`,
            [numBid, listingId]
          );
        }

        await client.query('COMMIT');

        // 5. Broadcast to room
        const roomName = `auction_${listingId}`;
        const broadcastPayload = {
          listingId,
          bidId: newBid.id,
          newHighestBid: numBid,
          buyerId,
          buyerName,
          totalLotValue,
          timestamp: newBid.created_at
        };

        io.to(roomName).emit('bid_updated', broadcastPayload);

        if (wasExtended) {
          io.to(roomName).emit('auction_extended', {
            listingId,
            newExpiresAt: newExpiryDate,
            message: 'Auction extended by 2 minutes due to late bid activity.'
          });
        }

        if (callback) {
          callback({
            success: true,
            message: 'Bid placed successfully',
            data: broadcastPayload
          });
        }
      } catch (err) {
        await client.query('ROLLBACK');
        console.warn(`[Place Bid Rejected] listing=${listingId}, buyer=${buyerName}:`, err.message);

        socket.emit('bid_error', {
          listingId,
          message: err.message
        });

        if (callback) {
          callback({
            success: false,
            message: err.message
          });
        }
      } finally {
        client.release();
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[WebSocket] Disconnected: socket=${socket.id} (${reason})`);
    });
  });
};
