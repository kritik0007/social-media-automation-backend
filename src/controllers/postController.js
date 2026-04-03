/**
 * Post Controller
 * HTTP layer for post CRUD and publishing endpoints.
 */
const { body, query } = require('express-validator');
const postService = require('../services/postService');
const ApiResponse = require('../utils/apiResponse');

// Validation chains
const createPostValidation = [
  body('content').trim().notEmpty().withMessage('Post content is required').isLength({ max: 5000 }),
  body('platforms')
    .isArray({ min: 1 })
    .withMessage('At least one platform is required')
    .custom((platforms) => {
      const valid = ['twitter', 'linkedin', 'instagram'];
      return platforms.every((p) => valid.includes(p));
    })
    .withMessage('Invalid platform. Must be twitter, linkedin, or instagram'),
  body('scheduledAt').optional().isISO8601().withMessage('Invalid date format'),
  body('hashtags').optional().isArray(),
];

/**
 * GET /api/posts
 */
const getPosts = async (req, res, next) => {
  try {
    const { page, limit, status, platform } = req.query;
    const result = await postService.getPosts(req.user._id, { page, limit, status, platform });
    ApiResponse.paginated(res, result.posts, result.pagination, 'Posts retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/posts
 */
const createPost = async (req, res, next) => {
  try {
    const post = await postService.createPost(req.user._id, req.body);
    ApiResponse.created(res, post, 'Post created');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/posts/:id
 */
const updatePost = async (req, res, next) => {
  try {
    const post = await postService.updatePost(req.user._id, req.params.id, req.body);
    ApiResponse.success(res, post, 'Post updated');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/posts/:id
 */
const deletePost = async (req, res, next) => {
  try {
    const result = await postService.deletePost(req.user._id, req.params.id);
    ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/posts/:id/publish
 */
const publishPost = async (req, res, next) => {
  try {
    const post = await postService.publishPost(req.user._id, req.params.id);
    ApiResponse.success(res, post, 'Post published');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  createPostValidation,
};
