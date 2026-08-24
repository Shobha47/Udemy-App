const express = require('express');
const router = express.Router();

const { createReview, getCourseReviews, deleteReview, markHelpful } = require('../controllers/review.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createReviewSchema } = require('../validators');

// Public
router.get('/course/:courseId', getCourseReviews);

// Protected
router.post('/course/:courseId', authenticate, authorize('STUDENT'), validate(createReviewSchema), createReview);
router.delete('/:reviewId', authenticate, deleteReview);
router.post('/:reviewId/helpful', authenticate, markHelpful);

module.exports = router;
