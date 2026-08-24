const { Prisma } = require('@prisma/client');

/**
 * 404 Not Found handler
 */
function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

/**
 * Global error handler
 */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      const field = err.meta?.target?.[0] || 'field';
      message = `A record with this ${field} already exists.`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found.';
    } else if (err.code === 'P2003') {
      statusCode = 400;
      message = 'Related record not found.';
    } else {
      statusCode = 400;
      message = 'Database operation failed.';
    }
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided to database.';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired.';
  }

  // Joi validation errors (passed as array)
  if (err.isJoi) {
    statusCode = 422;
    message = 'Validation failed.';
    errors = err.details.map((d) => ({ field: d.path.join('.'), message: d.message }));
  }

  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    console.error('❌ Unhandled Error:', err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && statusCode === 500 && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
