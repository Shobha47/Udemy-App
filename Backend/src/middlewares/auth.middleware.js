const { verifyAccessToken } = require('../config/jwt');
const { prisma } = require('../config/database');
const { errorResponse } = require('../utils/response');

/**
 * Verify JWT and attach user to request
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, { statusCode: 401, message: 'Access token required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        avatar: true,
      },
    });

    if (!user) {
      return errorResponse(res, { statusCode: 401, message: 'User not found.' });
    }
    if (!user.isActive) {
      return errorResponse(res, { statusCode: 403, message: 'Account is deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Authorize specific roles
 * Usage: authorize('SUPERADMIN', 'INSTRUCTOR')
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, { statusCode: 401, message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, {
        statusCode: 403,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
    }
    next();
  };
}

/**
 * Optional authentication — attaches user if token present, else continues
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    req.user = user?.isActive ? user : null;
    next();
  } catch {
    req.user = null;
    next();
  }
}

module.exports = { authenticate, authorize, optionalAuth };
