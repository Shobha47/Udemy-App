const express = require('express');
const router = express.Router();

const { getPublicProfile, updateProfile, changePassword } = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Public
router.get('/:id', getPublicProfile);

// Protected (own profile)
router.put('/me/profile', authenticate, updateProfile);
router.put('/me/password', authenticate, changePassword);

module.exports = router;
