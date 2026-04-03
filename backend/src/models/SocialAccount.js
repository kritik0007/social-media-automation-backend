/**
 * Social Account Model
 * Represents a connected social media platform account.
 */
const mongoose = require('mongoose');

const socialAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    platform: {
      type: String,
      enum: ['twitter', 'linkedin', 'instagram'],
      required: [true, 'Platform is required'],
    },
    platformUserId: {
      type: String,
      default: '',
    },
    accessToken: {
      type: String,
      default: '', // Stored encrypted
    },
    refreshToken: {
      type: String,
      default: '', // Stored encrypted
    },
    username: {
      type: String,
      required: [true, 'Username/handle is required'],
      trim: true,
    },
    profileUrl: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    tokenExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: one account per platform per user
socialAccountSchema.index({ userId: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model('SocialAccount', socialAccountSchema);
