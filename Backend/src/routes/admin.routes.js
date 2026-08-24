const express = require('express');
const router = express.Router();

const {
  getDashboardStats, getAllUsers, getUserById, updateUserRole,
  toggleUserStatus, getPendingCourses, approveCourse,
  rejectCourse, adminDeleteCourse,
} = require('../controllers/admin.controller');

const { authenticate, authorize } = require('../middlewares/auth.middleware');

// All admin routes require SUPERADMIN
router.use(authenticate, authorize('SUPERADMIN'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', toggleUserStatus);

// Course Moderation
router.get('/courses/pending', getPendingCourses);
router.patch('/courses/approve/:id', approveCourse);
router.patch('/courses/reject/:id', rejectCourse);
router.delete('/courses/:id', adminDeleteCourse);

module.exports = router;
