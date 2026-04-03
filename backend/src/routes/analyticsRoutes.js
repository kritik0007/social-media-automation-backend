/**
 * Analytics Routes
 */
const express = require('express');
const router = express.Router();
const { getOverview, getPostMetrics, getTrends } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// All analytics routes require authentication
router.use(protect);

router.get('/overview', getOverview);
router.get('/posts/:id', getPostMetrics);
router.get('/trends', getTrends);

module.exports = router;
