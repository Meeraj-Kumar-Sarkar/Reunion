import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Whitelist of allowed origins
const allowedOrigins = [
  'https://reunion-tgrf.onrender.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    console.log('Request origin:', origin);

    if (!origin) {
      console.log('No origin provided - allowing request');
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log('Origin allowed:', origin);
      callback(null, true);
    } else if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
      console.log('Localhost origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('Origin rejected:', origin);
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  maxAge: 86400,
};

// Apply CORS middleware FIRST (don't use app.options with '*')
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

app.get('/', (req, res) => {
  res.send('Alumni Payment API is running...');
});

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      message: err.message,
    });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start server FIRST
const server = app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Connect to MongoDB (async, doesn't block server startup)
connectDB()
  .then(() => {
    console.log('✓ MongoDB connected');
  })
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    console.warn('Server running without database - some features may not work');
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});