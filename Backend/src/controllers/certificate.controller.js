const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

// GET /certificates
async function getMyCertificates(req, res, next) {
  try {
    const certificates = await prisma.certificate.findMany({
      where: {
        studentId: req.user.id
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            image: true,
            instructor: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        issuedAt: 'desc'
      }
    });

    return successResponse(res, {
      data: {
        certificates
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /certificates/:id
async function getCertificateById(req, res, next) {
  try {
    const { id } = req.params;

    const certificate = await prisma.certificate.findFirst({
      where: {
        id,
        studentId: req.user.id
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!certificate) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Certificate not found.'
      });
    }

    return successResponse(res, {
      data: {
        certificate
      }
    });
  } catch (error) {
    next(error);
  }
}

// POST /certificates/generate/:courseId
async function generateCertificate(req, res, next) {
  try {
    const { courseId } = req.params;

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: req.user.id,
        courseId
      },
      include: {
        course: true
      }
    });

    if (!enrollment) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'You are not enrolled in this course.'
      });
    }

    if ((enrollment.progress || 0) < 100) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Course must be completed before generating certificate.'
      });
    }

    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        studentId: req.user.id,
        courseId
      }
    });

    if (existingCertificate) {
      return successResponse(res, {
        message: 'Certificate already generated.',
        data: {
          certificate: existingCertificate
        }
      });
    }

    const certificateNo =
      `CERT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const certificate = await prisma.certificate.create({
      data: {
        certificateNo,
        studentId: req.user.id,
        courseId
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Certificate generated successfully.',
      data: {
        certificate
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyCertificates,
  getCertificateById,
  generateCertificate
};