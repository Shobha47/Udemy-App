const express = require('express');

const router = express.Router();

const {
  getAllInstructors,
  getInstructorById,
  updateInstructorProfile,
  getMyInstructorProfile,
} = require('../controllers/instructor.controller');

const { authenticate } = require('../middlewares/auth.middleware');

router.get('/instructors', getAllInstructors);

router.get('/instructor/:id', getInstructorById);

router.get(
  '/me/profile',
  authenticate,
  getMyInstructorProfile
);

router.put(
  '/me/profile',
  authenticate,
  updateInstructorProfile
);

module.exports = router;