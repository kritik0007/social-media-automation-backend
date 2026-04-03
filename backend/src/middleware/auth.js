/**
 * JWT Authentication Middleware
 * Verifies access tokens and attaches user to request.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const { jwt: jwtConfig } = require('../config/env');

const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return ApiResponse.error(res, 'Not authorized — no token provided', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Attach user to request (exclude password)
    const user = await User.findById(decoded.id);
    if (!user) {
      return ApiResponse.error(res, 'User not found', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Token expired — please refresh', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.error(res, 'Invalid token', 401);
    }
    return ApiResponse.error(res, 'Authentication failed', 401);
  }
};

module.exports = { protect };
