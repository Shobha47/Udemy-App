const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

// Get Assignment by Lesson ID
async function getAssignmentByLesson(req, res, next) {
  try {
    const { lessonId } = req.params;
    const assignment = await prisma.assignment.findUnique({ where: { lessonId } });

    if (!assignment) {
      return errorResponse(res, { statusCode: 404, message: 'No assignment configured for this lesson.' });
    }
    return successResponse(res, { data: { assignment } });
  } catch (error) {
    next(error);
  }
}

// Create or Update Assignment Parameters
async function saveAssignment(req, res, next) {
  try {
    const { lessonId } = req.params;
    const { title, description, instructions, maxMarks, dueDate } = req.body;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { include: { course: true } } }
    });

    if (!lesson) return errorResponse(res, { statusCode: 404, message: 'Lesson structure context missing.' });
    if (req.user.role === 'INSTRUCTOR' && lesson.section.course.instructorId !== req.user.id) {
      return errorResponse(res, { statusCode: 403, message: 'Unauthorized resource alteration.' });
    }

    const assignment = await prisma.assignment.upsert({
      where: { lessonId },
      update: { title, description, instructions, maxMarks, dueDate: dueDate ? new Date(dueDate) : null },
      create: { lessonId, title, description, instructions, maxMarks, dueDate: dueDate ? new Date(dueDate) : null }
    });

    return successResponse(res, { message: 'Assignment payload compiled.', data: { assignment } });
  } catch (error) {
    next(error);
  }
}

// Delete Assignment Node
async function deleteAssignment(req, res, next) {
  try {
    const { lessonId } = req.params;

    const assignment = await prisma.assignment.findUnique({
      where: { lessonId },
      include: { lesson: { include: { section: { include: { course: true } } } } }
    });

    if (!assignment) return errorResponse(res, { statusCode: 404, message: 'Assignment target entity absent.' });
    if (req.user.role === 'INSTRUCTOR' && assignment.lesson.section.course.instructorId !== req.user.id) {
      return errorResponse(res, { statusCode: 403, message: 'Operation unauthorized.' });
    }

    await prisma.assignment.delete({ where: { lessonId } });
    return successResponse(res, { message: 'Assignment removed from lesson ecosystem.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAssignmentByLesson, saveAssignment, deleteAssignment };