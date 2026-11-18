import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../db/pool.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Validation Schemas
export const registerSchema = z.object({
  phone: z.string().min(10, 'Phone must be at least 10 characters').max(15),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  role: z.enum(['farmer', 'buyer', 'admin'], {
    errorMap: () => ({ message: 'Role must be either farmer, buyer, or admin' })
  }),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  address_text: z.string().optional()
});

export const loginSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(1, 'Password is required')
});

/**
 * Register a new user with spatial location
 */
export const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { phone, password, name, role, lat, lng, address_text } = validatedData;

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existing.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this phone number already exists.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert with PostGIS geometry if coordinates provided
    let insertQuery;
    let queryParams;

    if (typeof lat === 'number' && typeof lng === 'number') {
      insertQuery = `
        INSERT INTO users (phone, password_hash, name, role, location, address_text)
        VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography, $7)
        RETURNING id, phone, name, role, address_text, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng, created_at
      `;
      queryParams = [phone, passwordHash, name, role, lng, lat, address_text || null];
    } else {
      insertQuery = `
        INSERT INTO users (phone, password_hash, name, role, address_text)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, phone, name, role, address_text, created_at
      `;
      queryParams = [phone, passwordHash, name, role, address_text || null];
    }

    const result = await query(insertQuery, queryParams);
    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user and issue JWT
 */
export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { phone, password } = validatedData;

    const result = await query(
      `SELECT id, phone, password_hash, name, role, address_text, 
              ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng, created_at 
       FROM users 
       WHERE phone = $1`,
      [phone]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password.'
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password.'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Omit password hash from response
    delete user.password_hash;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get currently authenticated user profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, phone, name, role, address_text, 
              ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng, created_at 
       FROM users 
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    res.status(200).json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
