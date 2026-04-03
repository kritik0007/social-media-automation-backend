/**
 * Rate Limiter Middleware
 * Protects API from abuse with configurable limits per route group.
 */
const rateLimit = require('express-rate-limit');
const { rateLimitConfig } = require('../config/env');

// General API rate limiter — 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.max,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter — stricter: 10 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI generation limiter — 20 requests per 15 minutes
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'AI generation rate limit exceeded, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter, aiLimiter };
