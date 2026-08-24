const express = require('express');
const router = express.Router();

const { enrollCourse, getMyEnrollments, updateProgress, checkEnrollment, enrollCourseBypass, getAssignmentForStudent, getLearningCourse, markLessonComplete, submitAssignment, submitQuizAttempt, getQuizByLessonForStudent } = require('../controllers/enrollment.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// All enrollment routes require login
router.use(authenticate);

router.post('/:courseId', authorize('STUDENT', 'INSTRUCTOR', 'SUPERADMIN'), enrollCourse);
router.post('/enrollmentsByPass/:courseId', authorize('STUDENT', 'INSTRUCTOR', 'SUPERADMIN'), enrollCourseBypass);
router.get('/my', getMyEnrollments);

router.get('/learn/:id', getLearningCourse);

// Student Quiz Submission Endpoint
router.get('/quizzes/:quizId', authorize('STUDENT'), getQuizByLessonForStudent);
router.get('/assignments/:assignmentId', authorize('STUDENT'), getAssignmentForStudent);
router.post('/quizzes/:quizId/submit', authorize('STUDENT'), submitQuizAttempt);

// Student Assignment Submission Endpoint
router.post('/lessons/:lessonId/assignment/submit', authorize('STUDENT'), submitAssignment);

router.get('/:courseId/check', checkEnrollment);
router.patch('/:courseId/progress', updateProgress);

router.patch('/lesson/:lessonId/complete', markLessonComplete);

module.exports = router;
