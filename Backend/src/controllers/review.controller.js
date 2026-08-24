const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

// POST /reviews/:courseId
async function createReview(req, res, next) {
  try {
    const { courseId } = req.params;
    const { rating, content } = req.body;

    // Must be enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: req.user.id, courseId } },
    });
    if (!enrollment) {
      return errorResponse(res, { statusCode: 403, message: 'You must be enrolled to review this course.' });
    }

    const existing = await prisma.review.findUnique({
      where: { authorId_courseId: { authorId: req.user.id, courseId } },
    });
    if (existing) {
      return errorResponse(res, { statusCode: 409, message: 'You have already reviewed this course.' });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        content,
        date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        authorId: req.user.id,
        courseId,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    // Recalculate course rating
    const stats = await prisma.review.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.course.update({
      where: { id: courseId },
      data: {
        rating: Math.round((stats._avg.rating ?? 0) * 10) / 10,
        reviewCount: stats._count,
      },
    });

    return successResponse(res, { statusCode: 201, message: 'Review submitted.', data: { review } });
  } catch (error) {
    next(error);
  }
}

// GET /reviews/course/:courseId
async function getCourseReviews(req, res, next) {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where: { courseId } }),
      prisma.review.findMany({
        where: { courseId },
        include: { author: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
    ]);

    return successResponse(res, {
      data: { reviews },
      meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /reviews/:reviewId (author or superadmin)
async function deleteReview(req, res, next) {
  try {
    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) return errorResponse(res, { statusCode: 404, message: 'Review not found.' });

    if (req.user.role !== 'SUPERADMIN' && review.authorId !== req.user.id) {
      return errorResponse(res, { statusCode: 403, message: 'Forbidden.' });
    }

    await prisma.review.delete({ where: { id: reviewId } });

    // Recalculate rating
    const stats = await prisma.review.aggregate({
      where: { courseId: review.courseId },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.course.update({
      where: { id: review.courseId },
      data: {
        rating: Math.round((stats._avg.rating ?? 0) * 10) / 10,
        reviewCount: stats._count,
      },
    });

    return successResponse(res, { message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
}

// POST /reviews/:reviewId/helpful
async function markHelpful(req, res, next) {
  try {
    const { reviewId } = req.params;

    const existing = await prisma.reviewHelpful.findUnique({
      where: { userId_reviewId: { userId: req.user.id, reviewId } },
    });

    if (existing) {
      await prisma.reviewHelpful.delete({ where: { userId_reviewId: { userId: req.user.id, reviewId } } });
      await prisma.review.update({ where: { id: reviewId }, data: { helpful: { decrement: 1 } } });
      return successResponse(res, { message: 'Helpful vote removed.' });
    }

    await prisma.reviewHelpful.create({ data: { userId: req.user.id, reviewId } });
    await prisma.review.update({ where: { id: reviewId }, data: { helpful: { increment: 1 } } });

    return successResponse(res, { message: 'Marked as helpful.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { createReview, getCourseReviews, deleteReview, markHelpful };
