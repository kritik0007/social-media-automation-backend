require('dotenv').config();

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('Missing required environment variable: MONGODB_URI');
}

const rateLimitConfig = {
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
};

// ✅ ADD THIS BLOCK
const jwt = {
  secret: process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
};

module.exports = {
  mongoUri,
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  rateLimitConfig,
  jwt, // ✅ IMPORTANT
};