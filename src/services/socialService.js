/**
 * Social Account Service
 * Manages connecting/disconnecting social media platform accounts.
 * Uses mock OAuth flow — replace with real OAuth when integrating live APIs.
 */
const SocialAccount = require('../models/SocialAccount');
const { encrypt } = require('../utils/encryption');
const logger = require('../utils/logger');

class SocialService {
  /**
   * Get all connected accounts for a user
   */
  async getAccounts(userId) {
    const accounts = await SocialAccount.find({ userId }).select('-accessToken -refreshToken');
    return accounts;
  }

  /**
   * Connect a social media account (mock OAuth)
   * In production, this would redirect to platform OAuth flow and handle callback.
   * @param {string} userId
   * @param {object} data - { platform, username, accessToken, refreshToken }
   */
  async connectAccount(userId, { platform, username }) {
    // Check if already connected
    const existing = await SocialAccount.findOne({ userId, platform });
    if (existing) {
      const error = new Error(`${platform} account already connected`);
      error.statusCode = 409;
      throw error;
    }

    // Generate mock tokens (in production, these come from OAuth flow)
    const mockAccessToken = `mock_${platform}_access_${Date.now()}`;
    const mockRefreshToken = `mock_${platform}_refresh_${Date.now()}`;

    const account = await SocialAccount.create({
      userId,
      platform,
      username,
      platformUserId: `${platform}_${Date.now()}`,
      accessToken: encrypt(mockAccessToken),
      refreshToken: encrypt(mockRefreshToken),
      profileUrl: this._generateProfileUrl(platform, username),
      connectedAt: new Date(),
      tokenExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    });

    logger.info(`Social account connected: ${platform} (@${username}) for user ${userId}`);

    return {
      id: account._id,
      platform: account.platform,
      username: account.username,
      profileUrl: account.profileUrl,
      isActive: account.isActive,
      connectedAt: account.connectedAt,
    };
  }

  /**
   * Disconnect a social media account
   */
  async disconnectAccount(userId, accountId) {
    const account = await SocialAccount.findOneAndDelete({ _id: accountId, userId });
    if (!account) {
      const error = new Error('Account not found');
      error.statusCode = 404;
      throw error;
    }

    logger.info(`Social account disconnected: ${account.platform} for user ${userId}`);
    return { message: `${account.platform} account disconnected` };
  }

  /**
   * Check if user has connected a specific platform
   */
  async hasConnectedPlatform(userId, platform) {
    const account = await SocialAccount.findOne({ userId, platform, isActive: true });
    return !!account;
  }

  /**
   * Generate profile URL based on platform
   */
  _generateProfileUrl(platform, username) {
    const urls = {
      twitter: `https://twitter.com/${username}`,
      linkedin: `https://linkedin.com/in/${username}`,
      instagram: `https://instagram.com/${username}`,
    };
    return urls[platform] || '';
  }
}

module.exports = new SocialService();
