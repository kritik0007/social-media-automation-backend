/**
 * AI Routes
 */
const express = require('express');
const router = express.Router();
const { generateCaption, suggestHashtags, suggestOptimalTime, captionValidation, hashtagValidation } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimiter');

// All AI routes require authentication + AI rate limiter
router.use(protect);
router.use(aiLimiter);

router.post('/generate-caption', captionValidation, validate, generateCaption);
router.post('/suggest-hashtags', hashtagValidation, validate, suggestHashtags);
router.post('/optimal-time', suggestOptimalTime);

module.exports = router;
