import { Router } from 'express';
import { syncBatchMutations } from '../controllers/syncController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Replay queued offline mutations
router.post('/batch', authenticateToken, syncBatchMutations);

export default router;
