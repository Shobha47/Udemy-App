const express = require('express');
const router = express.Router();

const { register, login, refreshToken, logout, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema, refreshTokenSchema } = require('../validators');

// Public
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);
router.post('/logout', logout);

// Protected
router.get('/me', authenticate, getMe);

module.exports = router;
