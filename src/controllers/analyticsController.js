/**
 * Analytics Controller
 * HTTP layer for analytics and metrics endpoints.
 */
const mongoose = require('mongoose');
const analyticsService = require('../services/analyticsService');
const ApiResponse = require('../utils/apiResponse');

/**
 * GET /api/analytics/overview
 */
const getOverview = async (req, res, next) => {
  try {
    const overview = await analyticsService.getOverview(req.user._id);
    ApiResponse.success(res, overview, 'Analytics overview retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/posts/:id
 */
const getPostMetrics = async (req, res, next) => {
  try {
    const metrics = await analyticsService.getPostMetrics(req.user._id, req.params.id);
    ApiResponse.success(res, metrics, 'Post metrics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/trends
 */
const getTrends = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const trends = await analyticsService.getTrends(req.user._id, days);
    ApiResponse.success(res, trends, 'Trends retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getPostMetrics,
  getTrends,
};
