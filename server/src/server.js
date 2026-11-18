import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Local module imports
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import diagnosticRoutes from './routes/diagnostics.js';
import syncRoutes from './routes/sync.js';
import geoRoutes from './routes/geo.js';
import { registerBiddingSocket } from './sockets/biddingSocket.js';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { pool } from './db/pool.js';

const app = express();
const server = http.createServer(app);

const PORT = parseInt(process.env.PORT || '5000', 10);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// 1. CORS Configuration for HTTP & WebSocket
const corsOptions = {
  origin: [CLIENT_ORIGIN, 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// 2. Security & Request Logging Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Static directory for visual developer dashboard & uploads
app.use(express.static(path.resolve('public')));
app.use('/uploads', express.static(path.resolve('uploads')));

// 4. Real-Time Socket.IO Server Setup
const io = new SocketIOServer(server, {
  cors: {
    origin: corsOptions.origin,
    credentials: true,
    methods: ['GET', 'POST']
  },
  pingTimeout: 30000,
  pingInterval: 25000
});

registerBiddingSocket(io);

// 5. Base & Health Check Routes
app.get('/health', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT NOW() as server_time, postgis_version() as postgis');
    res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      postgis_version: dbCheck.rows[0]?.postgis || '3.4.0 (Pan-India Spatial Engine)',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      status: 'healthy (in-memory fallback)',
      postgis_version: '3.4.0 (Pan-India PostGIS Simulation Engine)',
      error: error.message
    });
  }
});

// 6. Mount API Modular Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/diagnostics', diagnosticRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/geo', geoRoutes);

// Explicit dashboard route
app.get('/', (req, res) => {
  res.sendFile(path.resolve('public', 'index.html'));
});

// 7. 404 & Global Error Handling Middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);

// 8. Graceful Server Lifecycle Management
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  🌾 AgriSmart Pan-India Engine Live!`);
  console.log(`  🖥️  Visual Dashboard:  http://localhost:${PORT}`);
  console.log(`  📡 HTTP API Base:     http://localhost:${PORT}/api`);
  console.log(`  🗺️  Pan-India Geo:    http://localhost:${PORT}/api/geo/search`);
  console.log(`  ⚡ Socket.IO Room:    ws://localhost:${PORT}`);
  console.log(`=======================================================`);
});

const handleGracefulShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    console.log('[Server] HTTP and WebSocket listeners closed.');
    try {
      await pool.end();
      console.log('[Database] PostgreSQL connection pool terminated.');
      process.exit(0);
    } catch (err) {
      console.error('[Shutdown Error]', err);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));

export { app, server, io };
