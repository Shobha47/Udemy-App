const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

// Get Quiz by Lesson ID
async function getQuizByLesson(req, res, next) {
  try {
    const { lessonId } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { lessonId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { options: true }
        }
      }
    });

    if (!quiz) {
      return errorResponse(res, { statusCode: 404, message: 'No quiz found for this lesson.' });
    }

    return successResponse(res, { data: { quiz } });
  } catch (error) {
    next(error);
  }
}

// Upsert (Create/Update) Full Quiz Structure Atomically
async function saveQuiz(req, res, next) {
  try {
    const { lessonId } = req.params;
    const { title, description, passingScore, timeLimit, maxAttempts, questions } = req.body;

    // Verify ownership of the course through the lesson structure
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { include: { course: true } } }
    });

    if (!lesson) {
      return errorResponse(res, { statusCode: 404, message: 'Parent lesson metadata context missing.' });
    }

    if (req.user.role === 'INSTRUCTOR' && lesson.section.course.instructorId !== req.user.id) {
      return errorResponse(res, { statusCode: 403, message: 'Unauthorized management access to this course resources.' });
    }

    // Use a transaction to clean up and rewrite parameters safely
    const result = await prisma.$transaction(async (tx) => {
      // 1. Upsert base Quiz node
      const quiz = await tx.quiz.upsert({
        where: { lessonId },
        update: { title, description, passingScore, timeLimit, maxAttempts },
        create: { lessonId, title, description, passingScore, timeLimit, maxAttempts }
      });

      // 2. Clear out older cascading question configurations to avoid partial orphans
      await tx.quizQuestion.deleteMany({ where: { quizId: quiz.id } });

      // 3. Re-populate incoming structured question parameters
      if (questions && questions.length > 0) {
        for (const [qIdx, q] of questions.entries()) {
          await tx.quizQuestion.create({
            data: {
              quizId: quiz.id,
              question: q.question,
              type: q.type || 'SINGLE_CHOICE',
              points: q.points || 1,
              order: qIdx,
              options: {
                create: q.options.map((opt) => ({
                  text: opt.text,
                  isCorrect: opt.isCorrect ?? false
                }))
              }
            }
          });
        }
      }

      return tx.quiz.findUnique({
        where: { id: quiz.id },
        include: { questions: { orderBy: { order: 'asc' }, include: { options: true } } }
      });
    });

    return successResponse(res, {
      message: 'Quiz infrastructure saved successfully.',
      data: { quiz: result }
    });
  } catch (error) {
    next(error);
  }
}

// Delete Entire Quiz
async function deleteQuiz(req, res, next) {
  try {
    const { lessonId } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { lessonId },
      include: { lesson: { include: { section: { include: { course: true } } } } }
    });

    if (!quiz) return errorResponse(res, { statusCode: 404, message: 'Quiz record unavailable.' });
    if (req.user.role === 'INSTRUCTOR' && quiz.lesson.section.course.instructorId !== req.user.id) {
      return errorResponse(res, { statusCode: 403, message: 'Access Denied.' });
    }

    await prisma.quiz.delete({ where: { lessonId } });

    return successResponse(res, { message: 'Quiz structural payload cleared successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getQuizByLesson, saveQuiz, deleteQuiz };