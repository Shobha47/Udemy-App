const { prisma } = require('../config/database');
const {
  successResponse,
  errorResponse,
} = require('../utils/response');

// ─────────────────────────────────────────────
// SHAPE INSTRUCTOR
// ─────────────────────────────────────────────

function shapeInstructor(instructor) {
  return {
    id: instructor.id,
    name: instructor.name,
    email: instructor.email,
    avatar: instructor.avatar,
    headline: instructor.headline,
    bio: instructor.bio,
    website: instructor.website,
    socialLinks: instructor.socialLinks,

    totalCourses:
      instructor._count?.instructorCourses || 0,

    totalStudents:
      instructor.instructorCourses?.reduce(
        (acc, course) =>
          acc + (course.studentCount || 0),
        0
      ) || 0,

    totalReviews:
      instructor.instructorCourses?.reduce(
        (acc, course) =>
          acc + (course.reviewCount || 0),
        0
      ) || 0,

    averageRating:
      instructor.instructorCourses?.length > 0
        ? (
            instructor.instructorCourses.reduce(
              (acc, course) =>
                acc + (course.rating || 0),
              0
            ) /
            instructor.instructorCourses.length
          ).toFixed(1)
        : 0,

    courses:
      instructor.instructorCourses?.map(
        (course) => ({
          id: course.id,
          title: course.title,
          slug: course.slug,
          image: course.image,
          price: course.price,
          rating: course.rating,
          reviewCount: course.reviewCount,
          studentCount: course.studentCount,
          totalHours: course.totalHours,
          level: course.level,
          badge: course.badge,

          category: course.category,
          subcategory: course.subcategory,
        })
      ) || [],
  };
}

// ─────────────────────────────────────────────
// GET ALL INSTRUCTORS
// ─────────────────────────────────────────────

async function getAllInstructors(
  req,
  res,
  next
) {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
    } = req.query;

    const skip =
      (parseInt(page) - 1) *
      parseInt(limit);

    const where = {
      role: 'INSTRUCTOR',

      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },

          {
            headline: {
              contains: search,
              mode: 'insensitive',
            },
          },

          {
            bio: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const [total, instructors] =
      await Promise.all([
        prisma.user.count({
          where,
        }),

        prisma.user.findMany({
          where,

          skip,

          take: parseInt(limit),

          orderBy: {
            createdAt: 'desc',
          },

          include: {
            _count: {
              select: {
                instructorCourses: true,
              },
            },

            instructorCourses: {
              where: {
                isPublished: true,
                isApproved: true,
              },

              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },

                subcategory: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        }),
      ]);

    return successResponse(res, {
      data: {
        instructors:
          instructors.map(shapeInstructor),
      },

      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),

        totalPages: Math.ceil(
          total / parseInt(limit)
        ),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET INSTRUCTOR BY ID
// ─────────────────────────────────────────────

async function getInstructorById(
  req,
  res,
  next
) {
  try {
    const { id } = req.params;

    const instructor =
      await prisma.user.findFirst({
        where: {
          id,
          role: 'INSTRUCTOR',
        },

        include: {
          _count: {
            select: {
              instructorCourses: true,
            },
          },

          instructorCourses: {
            where: {
              isPublished: true,
              isApproved: true,
            },

            orderBy: {
              createdAt: 'desc',
            },

            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },

              subcategory: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

    if (!instructor) {
      return errorResponse(res, {
        statusCode: 404,
        message:
          'Instructor not found.',
      });
    }

    return successResponse(res, {
      data: {
        instructor:
          shapeInstructor(instructor),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// UPDATE INSTRUCTOR PROFILE
// ─────────────────────────────────────────────

async function updateInstructorProfile(
  req,
  res,
  next
) {
  try {
    const userId = req.user.id;

    const {
      name,
      avatar,
      bio,
      headline,
      website,
      socialLinks,
    } = req.body;

    const instructor =
      await prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          name,
          avatar,
          bio,
          headline,
          website,
          socialLinks,
        },
      });

    return successResponse(res, {
      message:
        'Instructor profile updated successfully.',

      data: {
        instructor,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET MY INSTRUCTOR PROFILE
// ─────────────────────────────────────────────

async function getMyInstructorProfile(
  req,
  res,
  next
) {
  try {
    const instructor =
      await prisma.user.findUnique({
        where: {
          id: req.user.id,
        },

        include: {
          _count: {
            select: {
              instructorCourses: true,
            },
          },

          instructorCourses: true,
        },
      });

    return successResponse(res, {
      data: {
        instructor:
          shapeInstructor(instructor),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllInstructors,
  getInstructorById,
  updateInstructorProfile,
  getMyInstructorProfile,
};