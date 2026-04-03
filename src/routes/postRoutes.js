/**
 * Post Routes
 */
const express = require('express');
const router = express.Router();
const { getPosts, createPost, updatePost, deletePost, publishPost, createPostValidation } = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// All post routes require authentication
router.use(protect);

router.get('/', getPosts);
router.post('/', createPostValidation, validate, createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/:id/publish', publishPost);

module.exports = router;
