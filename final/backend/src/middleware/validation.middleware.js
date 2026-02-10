const { validationResult } = require('express-validator');

/**
 * Middleware to validate request inputs using express-validator.
 * Use this after your route-specific validation rules.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }

  next();
};

module.exports = validateRequest;
