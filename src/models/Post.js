const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    platforms: {
      type: [String],
      enum: ['twitter', 'linkedin', 'instagram'],
      required: true,
    },

    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'failed'],
      default: 'draft',
    },

    scheduledAt: {
      type: Date,
      default: null,
    },

    hashtags: {
      type: [String],
      default: [],
    },

    mediaUrls: {
      type: [String],
      default: [],
    },

    aiGenerated: {
      type: Boolean,
      default: false,
    },

    platformResults: [
      {
        platform: String,
        status: String,
        postId: String,
        url: String,
        error: String,
      },
    ],

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);