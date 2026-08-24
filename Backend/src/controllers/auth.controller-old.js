const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { successResponse, errorResponse } = require('../utils/response');

// ─── Register ─────────────────────────────────────────────────────────────────
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    // Prevent registering as SUPERADMIN via public route
    const assignedRole = role === 'SUPERADMIN' ? 'STUDENT' : role;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse(res, { statusCode: 409, message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: assignedRole },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Registration successful.',
      data: { user, accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return errorResponse(res, { statusCode: 401, message: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return errorResponse(res, { statusCode: 401, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return errorResponse(res, { statusCode: 403, message: 'Your account has been deactivated.' });
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return successResponse(res, {
      message: 'Login successful.',
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Refresh Token ────────────────────────────────────────────────────────────
async function refreshToken(req, res, next) {
  try {
    const { refreshToken: token } = req.body;

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      return errorResponse(res, { statusCode: 401, message: 'Invalid or expired refresh token.' });
    }

    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.isActive) {
      return errorResponse(res, { statusCode: 401, message: 'User not found or deactivated.' });
    }

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { token } });

    const newAccessToken = generateAccessToken({ id: user.id, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return successResponse(res, {
      message: 'Token refreshed.',
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
async function logout(req, res, next) {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    return successResponse(res, { message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
}

// ─── Get Me ───────────────────────────────────────────────────────────────────
async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true,
        avatar: true, bio: true, headline: true, website: true,
        socialLinks: true, emailVerified: true, createdAt: true,
      },
    });
    return successResponse(res, { data: { user } });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, refreshToken, logout, getMe };
