/**
 * Auth Controller
 * HTTP layer for authentication endpoints.
 */
const { body } = require('express-validator');
const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');

// Validation chains
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    ApiResponse.created(res, result, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    ApiResponse.success(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user._id);
    ApiResponse.success(res, user);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshToken(req.body.refreshToken);
    ApiResponse.success(res, result, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  refreshToken,
  registerValidation,
  loginValidation,
};
