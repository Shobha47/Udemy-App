const express = require('express');
const router = express.Router();

const {
  getAllCourses, getCourseById, createCourse, updateCourse, getAdminCourses,
  deleteCourse, getMyCourses, togglePublish, getProtectedCourseById, getCourseBySlug
} = require('../controllers/course.controller');

const {
  createSection, updateSection, deleteSection,
  createLesson, updateLesson, deleteLesson, 
} = require('../controllers/curriculum.controller');

const { authenticate, authorize, optionalAuth } = require('../middlewares/auth.middleware');
const { validate, validateQuery } = require('../middlewares/validate.middleware');
const {
  createCourseSchema, updateCourseSchema, courseQuerySchema,
  createSectionSchema, createLessonSchema,
} = require('../validators');

// ─── Public ───────────────────────────────────────────────────────────────────
// ─── Public ───────────────────────────────────────
router.get('/', validateQuery(courseQuerySchema), getAllCourses);
router.get('/slug/:slug', getCourseBySlug);

// ─── Instructor (must be before /:id) ─────────────
router.get('/instructor/my-courses', authenticate, authorize('INSTRUCTOR'), getMyCourses);
router.get('/admin/admin-courses', authenticate, authorize('SUPERADMIN'), getAdminCourses);
router.get('/instructor/course/:id', authenticate, authorize('INSTRUCTOR', 'SUPERADMIN'), getProtectedCourseById);

// ─── Public (wildcard, must be last) ──────────────
router.get('/:id', getCourseById);

// ─── Instructor + SuperAdmin ───────────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  authorize('INSTRUCTOR', 'SUPERADMIN'),
  validate(createCourseSchema),
  createCourse
);

router.put(
  '/:id',
  authenticate,
  authorize('INSTRUCTOR', 'SUPERADMIN'),
  validate(updateCourseSchema),
  updateCourse
);

router.delete(
  '/:id',
  authenticate,
  authorize('INSTRUCTOR', 'SUPERADMIN'),
  deleteCourse
);

router.patch(
  '/:id/publish',
  authenticate,
  authorize('INSTRUCTOR', 'SUPERADMIN'),
  togglePublish
);

// ─── Curriculum: Sections ─────────────────────────────────────────────────────
router.post(
  '/:courseId/sections',
  authenticate,
  authorize('INSTRUCTOR', 'SUPERADMIN'),
  validate(createSectionSchema),
  createSection
);

router.put(
  '/:courseId/sections/:sectionId',
  authenticate,
  authorize('INSTRUCTOR', 'SUPERADMIN'),
  updateSection
);

router.delete(
  '/:courseId/sections/:sectionId',
  authenticate,
  authorize('INSTRUCTOR', 'SUPERADMIN'),
  deleteSection
);

// ─── Curriculum: Lessons ──────────────────────────────────────────────────────
router.post(
  '/:courseId/sections/:sectionId/lessons',
  authenticate,
  authorize('INSTRUCTOR', 'SUPERADMIN'),
  validate(createLessonSchema),
  createLesson
);

router.put(
  '/:courseId/sections/:sectionId/lessons/:lessonId',
  authenticate,
  authorize('INSTRUCTOR', 'SUPERADMIN'),
  updateLesson
);

router.delete(
  '/:courseId/sections/:sectionId/lessons/:lessonId',
  authenticate,
  authorize('INSTRUCTOR', 'SUPERADMIN'),
  deleteLesson
);

module.exports = router;
