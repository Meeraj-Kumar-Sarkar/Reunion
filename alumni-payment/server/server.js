import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

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
    // Log for debugging
    console.log('Request origin:', origin);

    // Allow requests with no origin (mobile apps, Postman, curl, server-to-server)
    if (!origin) {
      console.log('No origin provided - allowing request');
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log('Origin allowed:', origin);
      callback(null, true);
    } else {
      // Check if it matches localhost regex pattern
      if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
        console.log('Localhost origin allowed:', origin);
        callback(null, true);
      } else {
        console.log('Origin rejected:', origin);
        callback(new Error(`CORS blocked: ${origin}`));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  maxAge: 86400,
};

// Apply CORS middleware FIRST - before all routes
app.use(cors(corsOptions));

// Preflight handler
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Alumni Payment API is running...');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

// Error handling middleware - MUST be last
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  // CORS errors
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});