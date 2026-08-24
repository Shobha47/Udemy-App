const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const COURSE_LIST_INCLUDE = {
  instructor: { select: { id: true, name: true, avatar: true, headline: true } },
  category: { select: { id: true, name: true, slug: true } },
  subcategory: { select: { id: true, name: true, slug: true } },
  tags: { include: { tag: true } },
};

// ─── Helper: shape course for response ───────────────────────────────────────
function shapeCourse(course) {
  return {
    ...course,
    whatYouWillLearn: course.whatYouWillLearn?.map((w) => w.text) ?? [],
    requirements: course.requirements?.map((r) => r.text) ?? [],
    tags: course.tags?.map((ct) => ct.tag.name) ?? [],
    curriculum: course.sections?.map((sec) => ({
      id: sec.id,
      title: sec.title,
      totalDuration: sec.totalDuration,
      order: sec.order,
      lessons: sec.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        duration: l.duration,
        isPreview: l.isPreview,
        type: l.type,
        videoUrl: l.isPreview ? l.videoUrl : undefined,
        order: l.order,
      })),
    })) ?? [],
    reviews: course.reviews?.map((r) => ({
      id: r.id,
      author: r.author.name,
      avatar: r.author.avatar,
      rating: r.rating,
      date: r.date,
      content: r.content,
      helpful: r.helpful,
    })) ?? [],
    sections: undefined,
  };
}

// ─── Dashboard Stats ───────────────────────────────────────────────────────────
async function getDashboardStats(req, res, next) {
  try {
    const [
      totalUsers, totalCourses, totalEnrollments,
      pendingCourses, totalRevenue,
      recentUsers, recentCourses,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.course.count({ where: { isApproved: false, isPublished: true } }),
      prisma.course.aggregate({ _sum: { price: true } }), // simplified revenue
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.course.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { instructor: { select: { id: true, name: true } } },
      }),
    ]);

    return successResponse(res, {
      data: {
        stats: { totalUsers, totalCourses, totalEnrollments, pendingCourses },
        recentUsers,
        recentCourses,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── User Management ───────────────────────────────────────────────────────────
async function getAllUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, role: true,
          avatar: true, isActive: true, emailVerified: true, createdAt: true,
          _count: { select: { enrollments: true, instructorCourses: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
    ]);

    return successResponse(res, {
      data: { users },
      meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, email: true, role: true, avatar: true,
        bio: true, headline: true, isActive: true, emailVerified: true,
        createdAt: true, updatedAt: true,
        _count: { select: { enrollments: true, instructorCourses: true, reviews: true } },
        instructorCourses: {
          select: { id: true, title: true, isPublished: true, isApproved: true, studentCount: true },
        },
      },
    });

    if (!user) return errorResponse(res, { statusCode: 404, message: 'User not found.' });
    return successResponse(res, { data: { user } });
  } catch (error) {
    next(error);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    const validRoles = ['STUDENT', 'INSTRUCTOR', 'SUPERADMIN'];
    if (!validRoles.includes(role)) {
      return errorResponse(res, { statusCode: 422, message: `Role must be one of: ${validRoles.join(', ')}.` });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return successResponse(res, { message: 'User role updated.', data: { user } });
  } catch (error) {
    next(error);
  }
}

async function toggleUserStatus(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return errorResponse(res, { statusCode: 404, message: 'User not found.' });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });

    return successResponse(res, {
      message: `User ${updated.isActive ? 'activated' : 'deactivated'}.`,
      data: { user: updated },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Course Approval ───────────────────────────────────────────────────────────
async function getPendingCourses(req, res, next) {
  try {
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        isApproved: false,
      },
      include: COURSE_LIST_INCLUDE,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(res, {
      data: {
        courses: courses.map((c) => ({
          ...c,
          tags: c.tags?.map((ct) => ct.tag.name) ?? [],
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function approveCourse(req, res, next) {
  try {
    const { id } = req.params;
    console.log("id in approveCourse:", id);

    const course = await prisma.course.update({
      where: { id },
      data: { isApproved: true },
      select: { id: true, title: true, isApproved: true },
    });

    return successResponse(res, { message: 'Course approved.', data: { course } });
  } catch (error) {
    next(error);
  }
}

async function rejectCourse(req, res, next) {
  try {
    const { id } = req.params;
    const course = await prisma.course.update({
      where: { id },
      data: { isApproved: false, isPublished: false },
      select: { id: true, title: true, isApproved: true, isPublished: true },
    });

    return successResponse(res, { message: 'Course rejected and unpublished.', data: { course } });
  } catch (error) {
    next(error);
  }
}

// ─── Admin force-delete course ────────────────────────────────────────────────
async function adminDeleteCourse(req, res, next) {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    return successResponse(res, { message: 'Course permanently deleted.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  getPendingCourses,
  approveCourse,
  rejectCourse,
  adminDeleteCourse,
};
