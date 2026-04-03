/**
 * Auth Routes
 */
const express = require('express');
const router = express.Router();
const { register, login, getMe, refreshToken, registerValidation, loginValidation } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes (with auth rate limiter)
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/refresh', authLimiter, refreshToken);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
