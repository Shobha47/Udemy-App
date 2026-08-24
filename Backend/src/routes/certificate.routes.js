const express = require('express');
const router = express.Router();

const {
  getMyCertificates,
  getCertificateById,
  generateCertificate
} = require('../controllers/certificate.controller');

const {
  authenticate
} = require('../middlewares/auth.middleware');

router.get(
  '/',
  authenticate,
  getMyCertificates
);

router.get(
  '/:id',
  authenticate,
  getCertificateById
);

router.post(
  '/generate/:courseId',
  authenticate,
  generateCertificate
);

module.exports = router;