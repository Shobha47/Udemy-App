const Joi = require('joi');
const { errorResponse } = require('../utils/response');

/**
 * Validate request body against a Joi schema
 */
function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));
      return errorResponse(res, { statusCode: 422, message: 'Validation failed.', errors });
    }
    next();
  };
}

/**
 * Validate query params
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));
      return errorResponse(res, { statusCode: 422, message: 'Invalid query parameters.', errors });
    }
    req.query = value;
    next();
  };
}

module.exports = { validate, validateQuery };
