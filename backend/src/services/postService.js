/**
 * Post Service
 * Business logic for creating, scheduling, updating, and publishing posts.
 */
const Post = require('../models/Post');
const SocialAccount = require('../models/SocialAccount');
const Analytics = require('../models/Analytics');
const logger = require('../utils/logger');

class PostService {
  /**
   * Get all posts for a user with pagination and filtering
   */
  async getPosts(userId, { page = 1, limit = 10, status, platform }) {
    const query = { userId };

    if (status) query.status = status;
    if (platform) query.platforms = platform;

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments(query),
    ]);

    return {
      posts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    };
  }

  /**
   * Create a new post (draft or scheduled)
   */
  async createPost(userId, postData) {
    const { content, platforms, scheduledAt, hashtags, mediaUrls, aiGenerated } = postData;

    // Validate that user has connected the requested platforms
    for (const platform of platforms) {
      const account = await SocialAccount.findOne({ userId, platform, isActive: true });
      if (!account) {
        const error = new Error(`Please connect your ${platform} account first`);
        error.statusCode = 400;
        throw error;
      }
    }

    // Determine status based on scheduledAt
    let status = 'draft';
    if (scheduledAt) {
      const scheduleDate = new Date(scheduledAt);
      if (scheduleDate <= new Date()) {
        const error = new Error('Scheduled time must be in the future');
        error.statusCode = 400;
        throw error;
      }
      status = 'scheduled';
    }

    // Build platform results array
    const platformResults = platforms.map((p) => ({
      platform: p,
      status: 'pending',
    }));

    const post = await Post.create({
      userId,
      content,
      platforms,
      status,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      hashtags: hashtags || [],
      mediaUrls: mediaUrls || [],
      aiGenerated: aiGenerated || false,
      platformResults,
    });

    logger.info(`Post created: ${post._id} (${status}) by user ${userId}`);
    return post;
  }

  /**
   * Update a post (only drafts and scheduled posts can be updated)
   */
  async updatePost(userId, postId, updateData) {
    const post = await Post.findOne({ _id: postId, userId });
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    if (post.status === 'published') {
      const error = new Error('Cannot edit a published post');
      error.statusCode = 400;
      throw error;
    }

    const allowedFields = ['content', 'platforms', 'scheduledAt', 'hashtags', 'mediaUrls', 'status'];
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        post[field] = updateData[field];
      }
    });

    // Update platform results if platforms changed
    if (updateData.platforms) {
      post.platformResults = updateData.platforms.map((p) => ({
        platform: p,
        status: 'pending',
      }));
    }

    // Update status if scheduling
    if (updateData.scheduledAt) {
      post.status = 'scheduled';
    }

    await post.save();
    logger.info(`Post updated: ${postId} by user ${userId}`);
    return post;
  }

  /**
   * Delete a post
   */
  async deletePost(userId, postId) {
    const post = await Post.findOneAndDelete({ _id: postId, userId });
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    // Also delete associated analytics
    await Analytics.deleteMany({ postId });

    logger.info(`Post deleted: ${postId} by user ${userId}`);
    return { message: 'Post deleted successfully' };
  }

  /**
   * Publish a post immediately to all selected platforms
   * Uses mock publishing — replace with real platform adapters in production.
   */
  async publishPost(userId, postId) {
    const post = await Post.findOne({ _id: postId, userId });
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    if (post.status === 'published') {
      const error = new Error('Post already published');
      error.statusCode = 400;
      throw error;
    }

    // Mock publish to each platform
    const results = [];
    for (const platform of post.platforms) {
      try {
        // Simulate API call with mock response
        const mockResult = this._mockPublish(platform, post.content);
        results.push({
          platform,
          postId: mockResult.id,
          url: mockResult.url,
          status: 'success',
        });
      } catch (err) {
        results.push({
          platform,
          status: 'failed',
          error: err.message,
        });
      }
    }

    // Update post with results
    post.platformResults = results;
    post.status = results.every((r) => r.status === 'success') ? 'published' : 'failed';
    post.publishedAt = new Date();
    await post.save();

    // Generate mock analytics for published posts
    if (post.status === 'published') {
      await this._generateMockAnalytics(post);
    }

    logger.info(`Post published: ${postId} — Status: ${post.status}`);
    return post;
  }

  /**
   * Get due posts for the cron scheduler
   */
  async getDuePosts() {
    return Post.find({
      status: 'scheduled',
      scheduledAt: { $lte: new Date() },
    });
  }

  /**
   * Mock publish simulation
   */
  _mockPublish(platform, content) {
    // Simulate a 5% failure rate
    if (Math.random() < 0.05) {
      throw new Error(`${platform} API temporarily unavailable`);
    }

    const mockId = `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const urls = {
      twitter: `https://twitter.com/i/status/${mockId}`,
      linkedin: `https://linkedin.com/posts/${mockId}`,
      instagram: `https://instagram.com/p/${mockId}`,
    };

    return {
      id: mockId,
      url: urls[platform],
    };
  }

  /**
   * Generate mock analytics data for a published post
   */
  async _generateMockAnalytics(post) {
    for (const platform of post.platforms) {
      const impressions = Math.floor(Math.random() * 10000) + 500;
      const likes = Math.floor(Math.random() * impressions * 0.1);
      const comments = Math.floor(Math.random() * likes * 0.3);
      const shares = Math.floor(Math.random() * likes * 0.2);

      await Analytics.create({
        postId: post._id,
        userId: post.userId,
        platform,
        metrics: {
          likes,
          comments,
          shares,
          impressions,
          reach: Math.floor(impressions * 0.8),
          clicks: Math.floor(impressions * 0.05),
          engagementRate: parseFloat((((likes + comments + shares) / impressions) * 100).toFixed(2)),
        },
      });
    }
  }
}

module.exports = new PostService();
