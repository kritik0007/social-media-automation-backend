/**
 * Post Scheduler — Cron Job
 * Runs every minute to check for posts that are due for publishing.
 * Publishes them to the connected platforms automatically.
 */
const cron = require('node-cron');
const postService = require('../services/postService');
const logger = require('../utils/logger');

/**
 * Initialize the post scheduler
 * Runs every minute: checks for scheduled posts whose scheduledAt <= now
 */
const initScheduler = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const duePosts = await postService.getDuePosts();

      if (duePosts.length === 0) return;

      logger.info(`📅 Scheduler: Found ${duePosts.length} post(s) due for publishing`);

      for (const post of duePosts) {
        try {
          await postService.publishPost(post.userId, post._id);
          logger.info(`✅ Scheduler: Published post ${post._id}`);
        } catch (error) {
          logger.error(`❌ Scheduler: Failed to publish post ${post._id}: ${error.message}`);

          // Mark as failed
          post.status = 'failed';
          await post.save();
        }
      }
    } catch (error) {
      logger.error(`❌ Scheduler error: ${error.message}`);
    }
  });

  logger.info('📅 Post scheduler initialized — checking every minute');
};

module.exports = { initScheduler };
