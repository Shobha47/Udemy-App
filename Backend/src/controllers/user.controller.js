const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

// GET /users/:id — Public profile
async function getPublicProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, avatar: true, headline: true, bio: true,
        website: true, socialLinks: true, role: true, createdAt: true,
        _count: { select: { instructorCourses: true } },
        instructorCourses: {
          where: { isPublished: true, isApproved: true },
          select: { id: true, title: true, image: true, rating: true, studentCount: true, price: true },
          take: 6,
        },
      },
    });

    if (!user) return errorResponse(res, { statusCode: 404, message: 'User not found.' });
    return successResponse(res, { data: { user } });
  } catch (error) {
    next(error);
  }
}

// PUT /users/me — Update own profile
async function updateProfile(req, res, next) {
  try {
    const { name, avatar, bio, headline, website, socialLinks } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, avatar, bio, headline, website, socialLinks },
      select: {
        id: true, name: true, email: true, avatar: true,
        bio: true, headline: true, website: true, socialLinks: true, role: true,
      },
    });

    return successResponse(res, { message: 'Profile updated.', data: { user } });
  } catch (error) {
    next(error);
  }
}

// PUT /users/me/password — Change password
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return errorResponse(res, { statusCode: 401, message: 'Current password is incorrect.' });
    }

    if (newPassword.length < 8) {
      return errorResponse(res, { statusCode: 422, message: 'New password must be at least 8 characters.' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({ where: { userId: req.user.id } });

    return successResponse(res, { message: 'Password changed. Please log in again.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getPublicProfile, updateProfile, changePassword };
