/**
 * Analytics Model
 * Stores engagement metrics for each published post per platform.
 */
const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    platform: {
      type: String,
      enum: ['twitter', 'linkedin', 'instagram'],
      required: true,
    },
    metrics: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 },
      reach: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      engagementRate: { type: Number, default: 0 }, // Calculated: (likes+comments+shares) / impressions * 100
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookups
analyticsSchema.index({ postId: 1 });
analyticsSchema.index({ userId: 1, fetchedAt: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
