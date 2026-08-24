const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

// ─── Sections ──────────────────────────────────────────────────────────────────

async function createSection(req, res, next) {
  try {
    const { courseId } = req.params;
    const { title, totalDuration, order } = req.body;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return errorResponse(res, { statusCode: 404, message: 'Course not found.' });

    if (req.user.role === 'INSTRUCTOR' && course.instructorId !== req.user.id) {
      return errorResponse(res, { statusCode: 403, message: 'Forbidden.' });
    }

    // Auto-increment order if not provided
    let sectionOrder = order;
    if (sectionOrder === undefined) {
      const last = await prisma.section.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' },
      });
      sectionOrder = last ? last.order + 1 : 0;
    }

    const section = await prisma.section.create({
      data: { title, totalDuration, order: sectionOrder, courseId },
      include: { lessons: true },
    });

    return successResponse(res, { statusCode: 201, message: 'Section created.', data: { section } });
  } catch (error) {
    next(error);
  }
}

async function updateSection(req, res, next) {
  try {
    const { courseId, sectionId } = req.params;
    const { title, totalDuration, order } = req.body;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return errorResponse(res, { statusCode: 404, message: 'Course not found.' });

    if (req.user.role === 'INSTRUCTOR' && course.instructorId !== req.user.id) {
      return errorResponse(res, { statusCode: 403, message: 'Forbidden.' });
    }

    const section = await prisma.section.update({
      where: { id: sectionId },
      data: { title, totalDuration, order },
      include: { lessons: true },
    });

    return successResponse(res, { message: 'Section updated.', data: { section } });
  } catch (error) {
    next(error);
  }
}

async function deleteSection(req, res, next) {
  try {
    const { courseId, sectionId } = req.params;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return errorResponse(res, { statusCode: 404, message: 'Course not found.' });

    if (req.user.role === 'INSTRUCTOR' && course.instructorId !== req.user.id) {
      return errorResponse(res, { statusCode: 403, message: 'Forbidden.' });
    }

    await prisma.section.delete({ where: { id: sectionId } });
    return successResponse(res, { message: 'Section deleted.' });
  } catch (error) {
    next(error);
  }
}

// ─── Lessons ───────────────────────────────────────────────────────────────────

async function createLesson(req, res, next) {
  try {
    const { courseId, sectionId } = req.params;
    const { title, duration, isPreview, type, videoUrl, content, order } = req.body;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return errorResponse(res, { statusCode: 404, message: 'Course not found.' });

    if (req.user.role === 'INSTRUCTOR' && course.instructorId !== req.user.id) {
      return errorResponse(res, { statusCode: 403, message: 'Forbidden.' });
    }

    const section = await prisma.section.findFirst({ where: { id: sectionId, courseId } });
    if (!section) return errorResponse(res, { statusCode: 404, message: 'Section not found.' });

    let lessonOrder = order;
    if (lessonOrder === undefined) {
      const last = await prisma.lesson.findFirst({ where: { sectionId }, orderBy: { order: 'desc' } });
      lessonOrder = last ? last.order + 1 : 0;
    }

    const lesson = await prisma.lesson.create({
      data: { title, duration, isPreview, type, videoUrl, content, order: lessonOrder, sectionId },
    });

    // Update course totalLectures / totalArticles
    const isVideo = type === 'video';
    await prisma.course.update({
      where: { id: courseId },
      data: {
        totalLectures: { increment: isVideo ? 1 : 0 },
        totalArticles: { increment: type === 'article' ? 1 : 0 },
      },
    });

    return successResponse(res, { statusCode: 201, message: 'Lesson created.', data: { lesson } });
  } catch (error) {
    next(error);
  }
}

async function updateLesson(req, res, next) {
  try {
    const { courseId, sectionId, lessonId } = req.params;
    const { title, duration, isPreview, type, videoUrl, content, order } = req.body;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return errorResponse(res, { statusCode: 404, message: 'Course not found.' });

    if (req.user.role === 'INSTRUCTOR' && course.instructorId !== req.user.id) {
      return errorResponse(res, { statusCode: 403, message: 'Forbidden.' });
    }

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: { title, duration, isPreview, type, videoUrl, content, order },
    });

    return successResponse(res, { message: 'Lesson updated.', data: { lesson } });
  } catch (error) {
    next(error);
  }
}

async function deleteLesson(req, res, next) {
  try {
    const { courseId, sectionId, lessonId } = req.params;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return errorResponse(res, { statusCode: 404, message: 'Course not found.' });

    if (req.user.role === 'INSTRUCTOR' && course.instructorId !== req.user.id) {
      return errorResponse(res, { statusCode: 403, message: 'Forbidden.' });
    }

    const lesson = await prisma.lesson.delete({ where: { id: lessonId } });

    // Update course counts
    await prisma.course.update({
      where: { id: courseId },
      data: {
        totalLectures: { decrement: lesson.type === 'video' ? 1 : 0 },
        totalArticles: { decrement: lesson.type === 'article' ? 1 : 0 },
      },
    });

    return successResponse(res, { message: 'Lesson deleted.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createSection, updateSection, deleteSection,
  createLesson, updateLesson, deleteLesson,
};
