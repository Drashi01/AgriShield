import { Router } from 'express';
import { logDiagnosticScan, getDiagnosticHistory } from '../controllers/diagnosticController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Log scan with optional image file upload
router.post('/log', authenticateToken, upload.single('image'), logDiagnosticScan);

// Farmer's historical scans
router.get('/history', authenticateToken, getDiagnosticHistory);

export default router;
