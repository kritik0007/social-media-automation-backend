/**
 * AI Controller
 * HTTP layer for AI-powered content generation endpoints.
 */
const { body } = require('express-validator');
const aiService = require('../services/aiService');
const ApiResponse = require('../utils/apiResponse');

// Validation
const captionValidation = [
  body('topic').trim().notEmpty().withMessage('Topic is required'),
  body('platform').optional().isIn(['twitter', 'linkedin', 'instagram']),
  body('tone').optional().isIn(['professional', 'casual', 'humorous']),
  body('length').optional().isIn(['short', 'medium', 'long']),
];

const hashtagValidation = [
  body('topic').trim().notEmpty().withMessage('Topic is required'),
  body('platform').optional().isIn(['twitter', 'linkedin', 'instagram']),
  body('count').optional().isInt({ min: 1, max: 30 }),
];

/**
 * POST /api/ai/generate-caption
 */
const generateCaption = async (req, res, next) => {
  try {
    const result = await aiService.generateCaption(req.body);
    ApiResponse.success(res, result, 'Caption generated');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/suggest-hashtags
 */
const suggestHashtags = async (req, res, next) => {
  try {
    const result = await aiService.suggestHashtags(req.body);
    ApiResponse.success(res, result, 'Hashtags suggested');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/optimal-time
 */
const suggestOptimalTime = async (req, res, next) => {
  try {
    const result = await aiService.suggestOptimalTime(req.body);
    ApiResponse.success(res, result, 'Optimal time suggested');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateCaption,
  suggestHashtags,
  suggestOptimalTime,
  captionValidation,
  hashtagValidation,
};
