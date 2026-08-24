const express = require('express');
const router = express.Router();
const quizCtrl = require('../controllers/quiz.controller');
const assignCtrl = require('../controllers/assignment.controller');
const { requireAuth, isInstructor } = require('../middlewares/auth.middleware');

// Apply Global Access Control Interceptors
const { authenticate, authorize, optionalAuth } = require('../middlewares/auth.middleware');
router.use(authenticate);
router.use(authorize('INSTRUCTOR', 'SUPERADMIN'));

// Quiz Endpoints
router.route('/lessons/:lessonId/quiz')
  .get(quizCtrl.getQuizByLesson)
  .post(quizCtrl.saveQuiz)
  .delete(quizCtrl.deleteQuiz);

// Assignment Endpoints
router.route('/lessons/:lessonId/assignment')
  .get(assignCtrl.getAssignmentByLesson)
  .post(assignCtrl.saveAssignment)
  .delete(assignCtrl.deleteAssignment);

module.exports = router;