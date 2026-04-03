/**
 * Social Account Controller
 * HTTP layer for managing connected social media accounts.
 */
const { body } = require('express-validator');
const socialService = require('../services/socialService');
const ApiResponse = require('../utils/apiResponse');

// Validation
const connectValidation = [
  body('platform')
    .isIn(['twitter', 'linkedin', 'instagram'])
    .withMessage('Platform must be twitter, linkedin, or instagram'),
  body('username').trim().notEmpty().withMessage('Username/handle is required'),
];

/**
 * GET /api/social/accounts
 */
const getAccounts = async (req, res, next) => {
  try {
    const accounts = await socialService.getAccounts(req.user._id);
    ApiResponse.success(res, accounts, 'Social accounts retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/social/connect
 */
const connectAccount = async (req, res, next) => {
  try {
    const account = await socialService.connectAccount(req.user._id, req.body);
    ApiResponse.created(res, account, `${req.body.platform} account connected`);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/social/accounts/:id
 */
const disconnectAccount = async (req, res, next) => {
  try {
    const result = await socialService.disconnectAccount(req.user._id, req.params.id);
    ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAccounts,
  connectAccount,
  disconnectAccount,
  connectValidation,
};
