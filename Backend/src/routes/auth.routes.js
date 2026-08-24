const express = require('express');
const router = express.Router();

const {
  registerStudent,
  registerInstructor,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  verifyEmailOTP,
  resendOTP,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const Joi = require('joi');

const studentRegisterSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

const instructorRegisterSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  headline: Joi.string().max(200).optional().allow(''),
  bio: Joi.string().max(2000).optional().allow(''),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).max(128).required(),
});

const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

const resendOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

// Public routes
router.post('/register/student', validate(studentRegisterSchema), registerStudent);
router.post('/register/instructor', validate(instructorRegisterSchema), registerInstructor);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/verify-email-otp', validate(verifyEmailSchema), verifyEmailOTP);
router.post('/resend-otp', validate(resendOtpSchema), resendOTP);

// Protected
router.get('/me', authenticate, getMe);

module.exports = router;
