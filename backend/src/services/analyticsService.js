/**
 * Analytics Service
 * Aggregates and returns engagement metrics for the dashboard.
 */
const Analytics = require('../models/Analytics');
const Post = require('../models/Post');
const logger = require('../utils/logger');

class AnalyticsService {
  /**
   * Get dashboard overview metrics for a user
   */
  async getOverview(userId) {
    // Total posts by status
    const postStats = await Post.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Total engagement metrics
    const engagementStats = await Analytics.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: '$metrics.likes' },
          totalComments: { $sum: '$metrics.comments' },
          totalShares: { $sum: '$metrics.shares' },
          totalImpressions: { $sum: '$metrics.impressions' },
          totalReach: { $sum: '$metrics.reach' },
          totalClicks: { $sum: '$metrics.clicks' },
          avgEngagementRate: { $avg: '$metrics.engagementRate' },
          postCount: { $sum: 1 },
        },
      },
    ]);

    // Platform breakdown
    const platformBreakdown = await Analytics.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$platform',
          likes: { $sum: '$metrics.likes' },
          comments: { $sum: '$metrics.comments' },
          shares: { $sum: '$metrics.shares' },
          impressions: { $sum: '$metrics.impressions' },
          avgEngagement: { $avg: '$metrics.engagementRate' },
          postCount: { $sum: 1 },
        },
      },
    ]);

    // Format post stats into readable object
    const postStatusCounts = {};
    postStats.forEach((stat) => {
      postStatusCounts[stat._id] = stat.count;
    });

    const engagement = engagementStats[0] || {
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalImpressions: 0,
      totalReach: 0,
      totalClicks: 0,
      avgEngagementRate: 0,
      postCount: 0,
    };

    return {
      posts: {
        total: Object.values(postStatusCounts).reduce((a, b) => a + b, 0),
        draft: postStatusCounts.draft || 0,
        scheduled: postStatusCounts.scheduled || 0,
        published: postStatusCounts.published || 0,
        failed: postStatusCounts.failed || 0,
      },
      engagement: {
        totalLikes: engagement.totalLikes,
        totalComments: engagement.totalComments,
        totalShares: engagement.totalShares,
        totalImpressions: engagement.totalImpressions,
        totalReach: engagement.totalReach,
        totalClicks: engagement.totalClicks,
        avgEngagementRate: parseFloat((engagement.avgEngagementRate || 0).toFixed(2)),
      },
      platformBreakdown: platformBreakdown.map((p) => ({
        platform: p._id,
        likes: p.likes,
        comments: p.comments,
        shares: p.shares,
        impressions: p.impressions,
        avgEngagement: parseFloat((p.avgEngagement || 0).toFixed(2)),
        postCount: p.postCount,
      })),
    };
  }

  /**
   * Get metrics for a specific post
   */
  async getPostMetrics(userId, postId) {
    const analytics = await Analytics.find({ postId, userId });
    if (!analytics.length) {
      return { message: 'No analytics data available yet', metrics: [] };
    }
    return { metrics: analytics };
  }

  /**
   * Get engagement trends over time (last 30 days)
   */
  async getTrends(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await Analytics.aggregate([
      {
        $match: {
          userId: userId,
          fetchedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$fetchedAt' } },
            platform: '$platform',
          },
          likes: { $sum: '$metrics.likes' },
          comments: { $sum: '$metrics.comments' },
          shares: { $sum: '$metrics.shares' },
          impressions: { $sum: '$metrics.impressions' },
          engagementRate: { $avg: '$metrics.engagementRate' },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    return { days, trends };
  }
}

module.exports = new AnalyticsService();
