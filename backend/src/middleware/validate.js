/**
 * Request Validation Middleware
 * Uses express-validator for input sanitization and validation.
 */
const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

/**
 * Middleware to check validation results from express-validator chains.
 * Place this AFTER the validation chain in route definitions.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return ApiResponse.error(res, 'Validation failed', 400, extractedErrors);
  }
  next();
};

module.exports = { validate };
