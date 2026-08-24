const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_dev_only';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_dev_only';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || 'fallback_reset_secret_dev_only';
const JWT_RESET_EXPIRES_IN = process.env.JWT_RESET_EXPIRES_IN || '15m';

function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

function generatePasswordResetToken(payload) {
  return jwt.sign(payload, JWT_RESET_SECRET, { expiresIn: JWT_RESET_EXPIRES_IN });
}

function verifyPasswordResetToken(token) {
  return jwt.verify(token, JWT_RESET_SECRET);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
};
