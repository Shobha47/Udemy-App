const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { courseSlug } = require('../utils/slug');

// ─── Shared Include ───────────────────────────────────────────────────────────
const COURSE_FULL_INCLUDE = {
  instructor: {
    select: { id: true, name: true, avatar: true, headline: true, bio: true },
  },
  category: { select: { id: true, name: true, slug: true } },
  subcategory: { select: { id: true, name: true, slug: true } },
  whatYouWillLearn: { orderBy: { order: 'asc' } },
  requirements: { orderBy: { order: 'asc' } },
  tags: { include: { tag: true } },
  sections: {
    orderBy: { order: 'asc' },
    include: {
      lessons: { orderBy: { order: 'asc' } },
    },
  },
  reviews: {
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      author: { select: { id: true, name: true, avatar: true } },
    },
  },
};
// ─── Shared Include ───────────────────────────────────────────────────────────
const PROTECTED_COURSE_FULL_INCLUDE = {
  instructor: {
    select: { id: true, name: true, avatar: true, headline: true, bio: true },
  },
  category: { select: { id: true, name: true, slug: true } },
  subcategory: { select: { id: true, name: true, slug: true } },
  whatYouWillLearn: { orderBy: { order: 'asc' } },
  requirements: { orderBy: { order: 'asc' } },
  tags: { include: { tag: true } },
  sections: {
    orderBy: { order: 'asc' },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: { 
          assignment: true,
          quiz: {
            include: {
              questions: {
                orderBy: { order: 'asc' },
                include: {
                  options: true // Required for your React Native option mapping loop
                }
              }
            }
          }
        },
      },
    },
  },
  reviews: {
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      author: { select: { id: true, name: true, avatar: true } },
    },
  },
};

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
        content: l.content,
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

// ─── Helper: shape course for response ───────────────────────────────────────
function protectedShapeCourse(course) {
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
        content: l.content,
        videoUrl: l.videoUrl,
        order: l.order,
        quiz: l.quiz || null, 
        assignment: l.assignment || null
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

// ─── GET /courses (Public) ────────────────────────────────────────────────────
async function getAllCourses(req, res, next) {
  try {
    const {
      page = 1, limit = 10, search = '',
      category, level, language, minPrice, maxPrice,
      sortBy = 'createdAt', sortOrder = 'desc', badge, free,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isPublished: true,
      isApproved: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { subtitle: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(category && { category: { slug: category } }),
      ...(level && { level }),
      ...(language && { language: { contains: language, mode: 'insensitive' } }),
      ...(badge && { badge }),
      ...(free === 'true' && { price: 0 }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? { price: { ...(minPrice && { gte: parseFloat(minPrice) }), ...(maxPrice && { lte: parseFloat(maxPrice) }) } }
        : {}),
    };

    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        include: COURSE_LIST_INCLUDE,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: parseInt(limit),
      }),
    ]);

    console.log("courses in getAllCourses Public:", courses);

    return successResponse(res, {
      data: { courses: courses.map((c) => ({ ...c, tags: c.tags.map((ct) => ct.tag.name) })) },
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── GET /courses/:slug (Public) ────────────────────────────────────────────────
async function getCourseBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    console.log('slug in getCourseBySlug:', slug);

    const course = await prisma.course.findFirst({
      where: {
        slug,
        isPublished: true,
        isApproved: true,
      },
      include: COURSE_FULL_INCLUDE,
    });

    if (!course) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Course not found.',
      });
    }

    return successResponse(res, {
      data: {
        course: shapeCourse(course),
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── GET /courses/:id (Public) ────────────────────────────────────────────────
async function getCourseById(req, res, next) {
  try {
    const { id } = req.params;
    console.log("id in getCourseById asdfghjkljhgfdsdcfgbhjmgfdsadfghjugfdsagtfhjk:", id);

    const course = await prisma.course.findFirst({
      where: { id, isPublished: true, isApproved: true },
      include: COURSE_FULL_INCLUDE,
    });

    if (!course) {
      return errorResponse(res, { statusCode: 404, message: 'Course not found.' });
    }

    return successResponse(res, { data: { course: shapeCourse(course) } });
  } catch (error) {
    next(error);
  }
}

// ─── POST /courses (Instructor | SuperAdmin) ──────────────────────────────────
async function createCourse(req, res, next) {
  try {
    const {
      title, subtitle, description, image, previewVideo,
      price, originalPrice, language, level, badge, lastUpdated,
      hasCertificate, hasLifetimeAccess, hasMobileAccess,
      categoryId, subcategoryId,
      whatYouWillLearn = [], requirements = [], tags = [],
    } = req.body;

    const instructorId = req.user.id;

    // Validate category exists
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return errorResponse(res, { statusCode: 404, message: 'Category not found.' });
    }

    // Resolve tags (upsert)
    const tagRecords = await Promise.all(
      tags.map((name) =>
        prisma.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        })
      )
    );

    const slug = courseSlug(title);

    const course = await prisma.course.create({
      data: {
        slug, title, subtitle, description, image, previewVideo,
        price: price ?? 0, originalPrice, language, level,
        badge, lastUpdated, hasCertificate, hasLifetimeAccess, hasMobileAccess,
        instructorId,
        categoryId,
        subcategoryId: subcategoryId || null,
        whatYouWillLearn: {
          create: whatYouWillLearn.map((text, order) => ({ text, order })),
        },
        requirements: {
          create: requirements.map((text, order) => ({ text, order })),
        },
        tags: {
          create: tagRecords.map((tag) => ({ tagId: tag.id })),
        },
      },
      include: COURSE_FULL_INCLUDE,
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Course created successfully.',
      data: { course: shapeCourse(course) },
    });
  } catch (error) {
    next(error);
  }
}

// ─── PUT /courses/:id (Instructor owns course | SuperAdmin) ───────────────────
async function updateCourse(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, { statusCode: 404, message: 'Course not found.' });
    }

    // Instructors can only update their own courses
    if (req.user.role === 'INSTRUCTOR' && existing.instructorId !== req.user.id) {
      return errorResponse(res, { statusCode: 403, message: 'You can only update your own courses.' });
    }

    const {
      whatYouWillLearn, requirements, tags,
      categoryId, subcategoryId, ...rest
    } = req.body;

    // Build update data
    const updateData = { ...rest };

    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) return errorResponse(res, { statusCode: 404, message: 'Category not found.' });
      updateData.categoryId = categoryId;
    }
    if (subcategoryId !== undefined) updateData.subcategoryId = subcategoryId;

    // Replace whatYouWillLearn
    if (whatYouWillLearn) {
      await prisma.whatYouWillLearn.deleteMany({ where: { courseId: id } });
      updateData.whatYouWillLearn = {
        create: whatYouWillLearn.map((text, order) => ({ text, order })),
      };
    }

    // Replace requirements
    if (requirements) {
      await prisma.requirement.deleteMany({ where: { courseId: id } });
      updateData.requirements = {
        create: requirements.map((text, order) => ({ text, order })),
      };
    }

    // Replace tags
    if (tags) {
      await prisma.courseTag.deleteMany({ where: { courseId: id } });
      const tagRecords = await Promise.all(
        tags.map((name) => prisma.tag.upsert({ where: { name }, update: {}, create: { name } }))
      );
      updateData.tags = { create: tagRecords.map((tag) => ({ tagId: tag.id })) };
    }

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
      include: COURSE_FULL_INCLUDE,
    });

    return successResponse(res, {
      message: 'Course updated successfully.',
      data: { course: shapeCourse(course) },
    });
  } catch (error) {
    next(error);
  }
}

// ─── DELETE /courses/:id (Instructor owns | SuperAdmin) ──────────────────────
async function deleteCourse(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, { statusCode: 404, message: 'Course not found.' });
    }

    if (req.user.role === 'INSTRUCTOR' && existing.instructorId !== req.user.id) {
      return errorResponse(res, { statusCode: 403, message: 'You can only delete your own courses.' });
    }

    await prisma.course.delete({ where: { id } });

    return successResponse(res, { message: 'Course deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

// ─── GET /courses/admin/admin-courses ───────────────────────────────────────
async function getAdminCourses(req, res, next) {
  try {
    // const { page = 1, limit = 10 } = req.query;
    // const skip = (parseInt(page) - 1) * parseInt(limit);

    const {
      page = 1, limit = 10, search = '',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      instructorId: req.user.id,
      // isPublished: true,
      // isApproved: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { subtitle: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),

      prisma.course.findMany({
        where,
        include: COURSE_LIST_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
    ]);

    // const [total, courses] = await Promise.all([
    //   prisma.course.count({ where: { instructorId: req.user.id } }),
    //   prisma.course.findMany({
    //     where: { instructorId: req.user.id },
    //     include: COURSE_LIST_INCLUDE,
    //     orderBy: { createdAt: 'desc' },
    //     skip,
    //     take: parseInt(limit),
    //   }),
    // ]);

    console.log("courses in getMyCourses:", courses);

    return successResponse(res, {
      data: { courses: courses.map((c) => ({ ...c, tags: c.tags.map((ct) => ct.tag.name) })) },
      meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
}

// ─── GET /courses/instructor/admin-courses ───────────────────────────────────────
async function getMyCourses(req, res, next) {
  try {
    // const { page = 1, limit = 10 } = req.query;
    // const skip = (parseInt(page) - 1) * parseInt(limit);

    const {
      page = 1, limit = 10, search = '',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      instructorId: req.user.id,
      // isPublished: true,
      // isApproved: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { subtitle: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),

      prisma.course.findMany({
        where,
        include: COURSE_LIST_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
    ]);

    // const [total, courses] = await Promise.all([
    //   prisma.course.count({ where: { instructorId: req.user.id } }),
    //   prisma.course.findMany({
    //     where: { instructorId: req.user.id },
    //     include: COURSE_LIST_INCLUDE,
    //     orderBy: { createdAt: 'desc' },
    //     skip,
    //     take: parseInt(limit),
    //   }),
    // ]);

    console.log("courses in getMyCourses:", courses);

    return successResponse(res, {
      data: { courses: courses.map((c) => ({ ...c, tags: c.tags.map((ct) => ct.tag.name) })) },
      meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
}

// ─── GET /courses/instructor/my-courses ───────────────────────────────────────
async function getProtectedCourseById(req, res, next) {
  try {
    const { id } = req.params;
    console.log("id in getCourseById 11234567876543234567:", req.params);

    const course = await prisma.course.findFirst({
      where: { id },
      include: PROTECTED_COURSE_FULL_INCLUDE,
    });

    if (!course) {
      return errorResponse(res, { statusCode: 404, message: 'Course not found.' });
    }

    console.log("Course getCourseById:", course);

    console.log('UNSHAPED LESSONS:',
      JSON.stringify(course.sections[0].lessons, null, 2)
    );

    const shaped = protectedShapeCourse(course);

    console.log(
      'SHAPED LESSONS:',
      JSON.stringify(
        shaped.curriculum[0].lessons,
        null,
        2
      )
    );

    return successResponse(res, { data: { course: protectedShapeCourse(course) } });
  } catch (error) {
    next(error);
  }
}

// ─── PATCH /courses/:id/publish ────────────────────────────────────────────────
async function togglePublish(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, { statusCode: 404, message: 'Course not found.' });

    console.log("existing.instructorId:", existing.instructorId);
    console.log("req.user.id:", req.user.id);
    console.log("req.user.role:", req.user.role);

    if (req.user.role === 'INSTRUCTOR' && existing.instructorId !== req.user.id) {
      return errorResponse(res, { statusCode: 403, message: 'Forbidden.' });
    }

    const course = await prisma.course.update({
      where: { id },
      data: { isPublished: !existing.isPublished, isDraft: false },
      select: { id: true, isPublished: true, title: true },
    });

    return successResponse(res, {
      message: `Course ${course.isPublished ? 'published' : 'unpublished'}.`,
      data: { course },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
  getAdminCourses,
  togglePublish,
  getProtectedCourseById,
  getCourseBySlug
};
