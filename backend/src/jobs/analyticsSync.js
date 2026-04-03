/**
 * Analytics Sync Job
 * Periodically fetches updated engagement metrics for published posts.
 * In production, this would call real platform APIs.
 */
const cron = require('node-cron');
const Post = require('../models/Post');
const Analytics = require('../models/Analytics');
const logger = require('../utils/logger');

/**
 * Initialize analytics sync
 * Runs every 30 minutes to update metrics for recent published posts
 */
const initAnalyticsSync = () => {
  // Run every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      // Get posts published in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentPosts = await Post.find({
        status: 'published',
        publishedAt: { $gte: sevenDaysAgo },
      });

      if (recentPosts.length === 0) return;

      logger.info(`📊 Analytics sync: Updating metrics for ${recentPosts.length} recent post(s)`);

      for (const post of recentPosts) {
        for (const platform of post.platforms) {
          // Find existing analytics record
          let analytics = await Analytics.findOne({
            postId: post._id,
            platform,
          });

          if (analytics) {
            // Simulate metric growth over time
            const growthFactor = 1 + Math.random() * 0.1; // 0-10% growth
            analytics.metrics.likes = Math.floor(analytics.metrics.likes * growthFactor);
            analytics.metrics.comments = Math.floor(analytics.metrics.comments * growthFactor);
            analytics.metrics.shares = Math.floor(analytics.metrics.shares * growthFactor);
            analytics.metrics.impressions = Math.floor(analytics.metrics.impressions * growthFactor);
            analytics.metrics.reach = Math.floor(analytics.metrics.reach * growthFactor);
            analytics.metrics.clicks = Math.floor(analytics.metrics.clicks * growthFactor);
            analytics.metrics.engagementRate = parseFloat(
              (
                ((analytics.metrics.likes + analytics.metrics.comments + analytics.metrics.shares) /
                  analytics.metrics.impressions) *
                100
              ).toFixed(2)
            );
            analytics.fetchedAt = new Date();
            await analytics.save();
          }
        }
      }

      logger.info('📊 Analytics sync completed');
    } catch (error) {
      logger.error(`❌ Analytics sync error: ${error.message}`);
    }
  });

  logger.info('📊 Analytics sync initialized — running every 30 minutes');
};

module.exports = { initAnalyticsSync };
