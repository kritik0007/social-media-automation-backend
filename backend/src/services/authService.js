/**
 * Auth Service
 * Business logic for user registration, login, and token management.
 */
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Register a new user
   * @param {object} userData - { name, email, password }
   * @returns {object} { user, accessToken, refreshToken }
   */
  async register({ name, email, password }) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('Email already registered');
      error.statusCode = 409;
      throw error;
    }

    // Create user (password hashed in pre-save hook)
    const user = await User.create({ name, email, password });

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    logger.info(`New user registered: ${email}`);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user with email and password
   * @param {string} email
   * @param {string} password
   * @returns {object} { user, accessToken, refreshToken }
   */
  async login(email, password) {
    // Find user WITH password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    logger.info(`User logged in: ${email}`);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken
   * @returns {object} { accessToken }
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      const error = new Error('Refresh token is required');
      error.statusCode = 400;
      throw error;
    }

    const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      const error = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }

    const newAccessToken = user.generateAccessToken();
    return { accessToken: newAccessToken };
  }

  /**
   * Get current user profile
   * @param {string} userId
   * @returns {object} User data
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }
}

module.exports = new AuthService();
