/**
 * Standardized API Response Helper
 * Ensures consistent response format across all endpoints.
 */

class ApiResponse {
  /**
   * Success response
   * @param {object} res - Express response object
   * @param {object} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Created response (201)
   */
  static created(res, data = null, message = 'Created successfully') {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Error response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @param {object} errors - Validation errors object
   */
  static error(res, message = 'Internal server error', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
    };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
  }

  /**
   * Paginated list response
   */
  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
    });
  }
}

module.exports = ApiResponse;
