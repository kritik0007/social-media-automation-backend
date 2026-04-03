/**
 * MongoDB Connection Configuration
 * Handles connection, reconnection, and graceful shutdown.
 */
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { mongoUri } = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoUri, {
      // Mongoose 8 uses the new URL parser and unified topology by default
    });

    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting reconnection...');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
