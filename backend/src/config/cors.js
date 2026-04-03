/**
 * CORS Configuration
 * Whitelist-based CORS with credentials support.
 */
const { frontendUrl } = require('./env');

const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [frontendUrl, 'http://localhost:5173', 'http://localhost:3000'];

    // Allow requests with no origin (Postman, curl, mobile apps)
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = corsOptions;
