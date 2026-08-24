const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

async function enrollCourseBypass(req, res, next) {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        isPublished: true,
        isApproved: true,
      },
    });

    if (!course) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Course not found.',
      });
    }

    const existingEnrollment =
      await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: req.user.id,
            courseId,
          },
        },
      });

    if (existingEnrollment) {
      return errorResponse(res, {
        statusCode: 409,
        message: 'Already enrolled.',
      });
    }

    // create enrollment
    const enrollment =
      await prisma.enrollment.create({
        data: {
          studentId: req.user.id,
          courseId,
        },
      });

    // create FREE order
    await prisma.order.create({
      data: {
        amount: course.price,
        originalAmount:
          course.originalPrice || course.price,

        currency: 'inr',

        status: 'COMPLETED',

        paymentMethod: 'FREE',

        courseTitle: course.title,
        coursePriceSnapshot: course.price,

        studentId: req.user.id,
        courseId: course.id,

        enrollmentId: enrollment.id,
      },
    });

    // increase count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        studentCount: {
          increment: 1,
        },
      },
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Enrollment successful.',
      data: {
        enrollment,
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /enrollments/:courseId — Enroll in course
async function enrollCourse(req, res, next) {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findFirst({
      where: { id: courseId, isPublished: true, isApproved: true },
    });
    if (!course) return errorResponse(res, { statusCode: 404, message: 'Course not found.' });

    const existing = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: req.user.id, courseId } },
    });
    if (existing) {
      return errorResponse(res, { statusCode: 409, message: 'Already enrolled in this course.' });
    }

    const enrollment = await prisma.enrollment.create({
      data: { studentId: req.user.id, courseId },
      include: { course: { select: { id: true, title: true, image: true } } },
    });

    // Increment student count
    await prisma.course.update({ where: { id: courseId }, data: { studentCount: { increment: 1 } } });

    return successResponse(res, { statusCode: 201, message: 'Enrolled successfully.', data: { enrollment } });
  } catch (error) {
    next(error);
  }
}

// GET /enrollments/my — Student's enrolled courses
async function getMyEnrollments(req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [total, enrollments] = await Promise.all([
      prisma.enrollment.count({ where: { studentId: req.user.id } }),
      prisma.enrollment.findMany({
        where: { studentId: req.user.id },
        include: {
          course: {
            include: {
              instructor: { select: { id: true, name: true, avatar: true } },
              category: { select: { name: true } },
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
    ]);

    return successResponse(res, {
      data: { enrollments },
      meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
}
async function getQuizByLessonForStudent(req, res, next) {
  try {
    const { quizId } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { 
            options: true 
          }
        }
      }
    });

    if (!quiz) {
      return errorResponse(res, { statusCode: 404, message: 'No quiz found for this lesson.' });
    }

    // Format the quiz to hide answers before sending it to the student
    const studentQuiz = {
      ...quiz,
      questions: quiz.questions.map(question => {
        // 1. Remove correctOptionId if it's stored on the question level
        const { correctOptionId, ...questionWithoutAnswer } = question;

        return {
          ...questionWithoutAnswer,
          // 2. Remove isCorrect from each option if it's stored on the option level
          options: question.options.map(option => {
            const { isCorrect, ...optionWithoutAnswer } = option;
            return optionWithoutAnswer;
          })
        };
      })
    };

    return successResponse(res, { data: { quiz: studentQuiz } });
  } catch (error) {
    next(error);
  }
}

async function getAssignmentForStudent(req, res, next) {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.id;

    const assignment = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
      },
      include: {
        submissions: {
          where: {
            studentId,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!assignment) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Assignment not found.',
      });
    }

    return successResponse(res, {
      data: {
        assignment,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Submit Quiz Attempt & Evaluate Grades Atomically
 */
async function submitQuizAttempt(req, res, next) {
  try {
    const { quizId } = req.params;
    const { answers, lessonId } = req.body; // answers is an object mapping: { [questionId]: optionText }
    const studentId = req.user.id;

    console.log("Answers for the Quizz:", answers)

    // 1. Fetch Quiz along with structural solution metrics
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: { options: true }
        }
      }
    });

    if (!quiz) {
      return errorResponse(res, { statusCode: 404, message: 'Target evaluation quiz structure missing.' });
    }

    // Optional Check: Enforce max attempts rule block if configured
    if (quiz.maxAttempts) {
      const existingAttemptsCount = await prisma.quizAttempt.count({
        where: { quizId, studentId }
      });
      if (existingAttemptsCount >= quiz.maxAttempts) {
        return errorResponse(res, { statusCode: 403, message: 'Maximum configuration attempt profiles exhausted for this module.' });
      }
    }

    let totalPointsAllocated = 0;
    let studentPointsEarned = 0;
    const recordsToCreate = [];

    // 2. Loop evaluate parameters against truth state values
    for (const question of quiz.questions) {
      console.log("QUESTION:", question.question);

      console.log(
        "CORRECT OPTIONS:",
        question.options
          .filter(o => o.isCorrect)
          .map(o => ({
            id: o.id,
            text: o.text
          }))
      );

      console.log(
        "STUDENT ANSWER:",
        answers[question.id]
      );
    }

    for (const question of quiz.questions) {
      totalPointsAllocated += question.points;
      
      const studentSelectedText = answers[question.id];
      const correctOptions = question.options.filter(o => o.isCorrect);
      
      // Determine if text string coordinates align with known answers
      const isCorrect = correctOptions.some(opt => opt.id === studentSelectedText);
      
      if (isCorrect) {
        studentPointsEarned += question.points;
      }

      // Map matching option IDs if present to fit schema footprint
      const selectedOptionMatch = question.options.find(opt => opt.id === studentSelectedText);
      
      // const selectedOptionId = answers[question.id];
      // const correctOptions = question.options.filter(o => o.isCorrect);

      // const isCorrect = correctOptions.some(
      //   opt => opt.id === selectedOptionId
      // );

      // const selectedOptionMatch =
      //   question.options.find(
      //     opt => opt.id === selectedOptionId
      //   );
        
      recordsToCreate.push({
        questionId: question.id,
        questionText: question.question,
        selectedOptionIds: selectedOptionMatch ? [selectedOptionMatch.id] : [],
        isCorrect
      });
    }

    // Calculate passing metric properties
    const scorePercentage = totalPointsAllocated > 0 
      ? Math.round((studentPointsEarned / totalPointsAllocated) * 100) 
      : 0;
    const passed = scorePercentage >= quiz.passingScore;

    // 3. Write attempt payload tracking down to data storage via transaction
    const attempt = await prisma.$transaction(async (tx) => {
      const newAttempt = await tx.quizAttempt.create({
        data: {
          quizId,
          studentId,
          score: scorePercentage,
          percentage: scorePercentage,
          passed,
          completedAt: new Date(),
          answers: {
            create: recordsToCreate
          }
        },
        include: { answers: true }
      });

      // 4. Update core lesson infrastructure loop progress upon passing
      if (passed && lessonId) {
        await tx.lessonProgress.upsert({
          where: {
            studentId_lessonId: { studentId, lessonId }
          },
          update: {
            completed: true,
            completedAt: new Date()
          },
          create: {
            studentId,
            lessonId,
            completed: true,
            completedAt: new Date()
          }
        });
      }

      return newAttempt;
    });

    return successResponse(res, {
      message: 'Quiz grading operations finalized.',
      data: { attempt }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create or Update Student Assignment Submission Parameters
 */
async function submitAssignment(req, res, next) {
  try {
    const { lessonId } = req.params;
    const { answerText, files } = req.body; 
    const studentId = req.user.id;

    // Verify the target parent assignment context exists
    const assignment = await prisma.assignment.findUnique({
      where: { lessonId }
    });

    if (!assignment) {
      return errorResponse(res, { statusCode: 404, message: 'No target assignment compiled for this lesson sequence node.' });
    }

    // Check optional deadline properties configuration locks
    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
      return errorResponse(res, { statusCode: 400, message: 'The submission window for this assignment has closed.' });
    }

    // Upsert payload to allow students to overwrite or submit fresh data elements
    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: assignment.id,
          studentId
        }
      },
      update: {
        answerText,
        files: files || null,
        status: 'SUBMITTED',
        submittedAt: new Date()
      },
      create: {
        assignmentId: assignment.id,
        studentId,
        answerText,
        files: files || null,
        status: 'SUBMITTED'
      }
    });

    return successResponse(res, {
      message: 'Assignment metadata deliverables compiled safely.',
      data: { submission }
    });
  } catch (error) {
    next(error);
  }
}

async function getLearningCourse(
  req,
  res,
  next
) {
  try {
    const { id } = req.params;

    console.log("User:", req.user.id);
    console.log("Course:", id);

    const allEnrollments = await prisma.enrollment.findMany({
      where: {
        studentId: req.user.id
      }
    });

    console.log("Enrollments:", allEnrollments);

    const enrollment =
      await prisma.enrollment.findFirst({
        where: {
          studentId: req.user.id,

          courseId: id,
        },

        include: {
          course: {
            include: {
              instructor: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },

              sections: {
                orderBy: {
                  order: 'asc',
                },
                include: {
                  lessons: {
                    orderBy: {
                      order: 'asc', // Essential for rendering the curriculum sequentially
                    },
                    include: {
                      progress: {
                        where: {
                          studentId: req.user.id,
                        },
                      },
                      // ─── UPDATED: FETCH QUIZZES + ATTEMPTS BY THIS STUDENT ───
                      quiz: {
                        include: {
                          attempts: {
                            where: {
                              studentId: req.user.id,
                            },
                            orderBy: {
                              createdAt: 'desc', // Gets newest attempt data first
                            },
                          },
                          questions: {
                            orderBy: {
                              order: 'asc',
                            },
                            include: {
                              options: true,
                            },
                          },
                        },
                      },
                      // ─── UPDATED: FETCH ASSIGNMENTS + SUBMISSIONS BY THIS STUDENT ───
                      assignment: {
                        include: {
                          submissions: {
                            where: {
                              studentId: req.user.id,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

    if (!enrollment) {
      return errorResponse(res, {
        statusCode: 404,
        message:
          'Course not enrolled.',
      });
    }

    return successResponse(res, {
      data: {
        enrollment,
      },
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /enrollments/:courseId/progress — Update progress
async function updateProgress(req, res, next) {
  try {
    const { courseId } = req.params;
    const { progress } = req.body;

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return errorResponse(res, { statusCode: 422, message: 'Progress must be a number between 0 and 100.' });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: req.user.id, courseId } },
    });
    if (!enrollment) return errorResponse(res, { statusCode: 404, message: 'Enrollment not found.' });

    const updated = await prisma.enrollment.update({
      where: { studentId_courseId: { studentId: req.user.id, courseId } },
      data: {
        progress,
        completedAt: progress === 100 ? new Date() : null,
      },
    });

    return successResponse(res, { message: 'Progress updated.', data: { enrollment: updated } });
  } catch (error) {
    next(error);
  }
}

// PATCH /enrollments/lesson/:lessonId/complete
async function markLessonComplete(req, res, next) {
  try {
    const { lessonId } = req.params;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Lesson not found',
      });
    }

    await prisma.lessonProgress.upsert({
      where: {
        studentId_lessonId: {
          studentId: req.user.id,
          lessonId,
        },
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
      create: {
        studentId: req.user.id,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
    });

    const courseId = lesson.section.courseId;

    const totalLessons = await prisma.lesson.count({
      where: {
        section: {
          courseId,
        },
      },
    });

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        studentId: req.user.id,
        completed: true,
        lesson: {
          section: {
            courseId,
          },
        },
      },
    });

    const progress = Math.round(
      (completedLessons / totalLessons) * 100
    );

    const enrollment = await prisma.enrollment.update({
      where: {
        studentId_courseId: {
          studentId: req.user.id,
          courseId,
        },
      },
      data: {
        progress,
        completedAt: progress === 100 ? new Date() : null,
      },
    });

    // after enrollment update

    let certificate = null;
    let certificateGenerated = false;

    if (progress === 100) {
      const existingCertificate = await prisma.certificate.findFirst({
        where: {
          studentId: req.user.id,
          courseId,
        },
      });

      if (!existingCertificate) {
        const certificateNo =
        `CERT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        
        certificate = await prisma.certificate.create({
          data: {
            certificateNo: certificateNo,
            studentId: req.user.id,
            courseId,
          },
        });

        certificateGenerated = true;
      } else {
        certificate = existingCertificate;
      }
    }

    return successResponse(res, {
      message:
        progress === 100
          ? 'Course completed successfully'
          : 'Lesson completed',
      data: {
        progress,
        enrollment,
        certificate,
        certificateGenerated,
      },
    });

    // return successResponse(res, {
    //   message: 'Lesson completed',
    //   data: {
    //     progress,
    //     enrollment,
    //   },
    // });
  } catch (error) {
    next(error);
  }
}

// GET /enrollments/:courseId/check — Check if enrolled
async function checkEnrollment(req, res, next) {
  try {
    const { courseId } = req.params;

    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: req.user.id, courseId } },
    });

    return successResponse(res, { data: { enrolled: !!enrollment, enrollment } });
  } catch (error) {
    next(error);
  }
}

module.exports = { enrollCourse, submitAssignment, getAssignmentForStudent, submitQuizAttempt, getMyEnrollments, getQuizByLessonForStudent, markLessonComplete, updateProgress, checkEnrollment, enrollCourseBypass, getLearningCourse };
