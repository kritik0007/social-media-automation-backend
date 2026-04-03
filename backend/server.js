/**

* Server Entry Point
  */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Load env FIRST
require('dotenv').config();

// Config
const { port, nodeEnv } = require('./src/config/env');
const connectDB = require('./src/config/db');
const corsOptions = require('./src/config/cors');

// Middleware
const errorHandler = require('./src/middleware/errorHandler');
const { generalLimiter } = require('./src/middleware/rateLimiter');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const postRoutes = require('./src/routes/postRoutes');
const socialRoutes = require('./src/routes/socialRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

// Jobs
const { initScheduler } = require('./src/jobs/scheduler');
const { initAnalyticsSync } = require('./src/jobs/analyticsSync');

// Logger
const logger = require('./src/utils/logger');

// ✅ CREATE APP FIRST
const app = express();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  BASIC ROUTE (ADD HERE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Social Media Automation API is running 🚀'
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MIDDLEWARE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

if (nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    environment: nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use(errorHandler);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  START SERVER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const startServer = async () => {
  try {
    await connectDB();

    initScheduler();
    initAnalyticsSync();

    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });

  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
