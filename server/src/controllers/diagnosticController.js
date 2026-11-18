import { z } from 'zod';
import { query } from '../db/pool.js';
import { saveUploadedFile } from '../middleware/upload.js';

const diagnosticPayloadSchema = z.object({
  crop_name: z.string().optional().default('General Leaf Scan'),
  detected_condition: z.string().min(1, 'Detected condition is required'),
  confidence_score: z.coerce.number().min(0).max(100).optional().default(85.0),
  severity: z.string().optional().default('Moderate'),
  remedies_applied: z.any().optional().default([]),
  image_url: z.string().optional()
});

/**
 * POST /api/diagnostics/log
 * Accepts multipart/form-data or JSON payload, uploads image, saves detection outcome
 */
export const logDiagnosticScan = async (req, res, next) => {
  try {
    const farmer_id = req.user.id;

    // Handle remedies_applied if sent as stringified JSON in multipart form
    let remediesApplied = req.body.remedies_applied;
    if (typeof remediesApplied === 'string') {
      try {
        remediesApplied = JSON.parse(remediesApplied);
      } catch (e) {
        remediesApplied = [remediesApplied];
      }
    }

    const validated = diagnosticPayloadSchema.parse({
      ...req.body,
      remedies_applied: remediesApplied
    });

    let finalImageUrl = validated.image_url || null;

    // If a file was uploaded in the request
    if (req.file) {
      finalImageUrl = await saveUploadedFile(req.file, 'leaf-scans');
    }

    const insertSql = `
      INSERT INTO diagnostic_scans (
        farmer_id,
        crop_name,
        detected_condition,
        confidence_score,
        severity,
        image_url,
        remedies_applied
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, crop_name, detected_condition, confidence_score, severity, image_url, remedies_applied, created_at
    `;

    const result = await query(insertSql, [
      farmer_id,
      validated.crop_name,
      validated.detected_condition,
      validated.confidence_score,
      validated.severity,
      finalImageUrl,
      JSON.stringify(validated.remedies_applied)
    ]);

    res.status(201).json({
      success: true,
      message: 'Plant pathology scan logged successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/diagnostics/history
 * Fetches paginated scan history for the authenticated farmer
 */
export const getDiagnosticHistory = async (req, res, next) => {
  try {
    const farmer_id = req.user.id;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const offset = (page - 1) * limit;

    const countSql = `SELECT COUNT(*) FROM diagnostic_scans WHERE farmer_id = $1`;
    const countRes = await query(countSql, [farmer_id]);
    const totalCount = parseInt(countRes.rows[0].count, 10);

    const historySql = `
      SELECT id, crop_name, detected_condition, confidence_score, severity, image_url, remedies_applied, created_at
      FROM diagnostic_scans
      WHERE farmer_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(historySql, [farmer_id, limit, offset]);

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total_items: totalCount,
        total_pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
