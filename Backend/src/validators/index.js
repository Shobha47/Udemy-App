const Joi = require('joi');

// ─── Auth Validators ──────────────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('STUDENT', 'INSTRUCTOR').default('STUDENT'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// ─── Course Validators ────────────────────────────────────────────────────────

const createCourseSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  subtitle: Joi.string().max(300).optional().allow(''),
  description: Joi.string().min(20).required(),
  image: Joi.string().uri().optional().allow(''),
  previewVideo: Joi.string().uri().optional().allow(''),
  price: Joi.number().min(0).default(0),
  originalPrice: Joi.number().min(0).optional(),
  language: Joi.string().default('English'),
  level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'AllLevels').default('Beginner'),
  badge: Joi.string().valid('Hot', 'Bestseller', 'New', 'TopRated').optional().allow(null),
  lastUpdated: Joi.string().optional().allow(''),
  hasCertificate: Joi.boolean().default(true),
  hasLifetimeAccess: Joi.boolean().default(true),
  hasMobileAccess: Joi.boolean().default(true),
  categoryId: Joi.string().uuid().required(),
  subcategoryId: Joi.string().uuid().optional().allow(null),
  whatYouWillLearn: Joi.array().items(Joi.string()).optional(),
  requirements: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

const updateCourseSchema = Joi.object({
  title: Joi.string().min(5).max(200),
  subtitle: Joi.string().max(300).allow(''),
  description: Joi.string().min(20),
  image: Joi.string().uri().allow(''),
  previewVideo: Joi.string().uri().allow(''),
  price: Joi.number().min(0),
  originalPrice: Joi.number().min(0).allow(null),
  language: Joi.string(),
  level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'AllLevels'),
  badge: Joi.string().valid('Hot', 'Bestseller', 'New', 'TopRated').allow(null),
  lastUpdated: Joi.string().allow(''),
  hasCertificate: Joi.boolean(),
  hasLifetimeAccess: Joi.boolean(),
  hasMobileAccess: Joi.boolean(),
  categoryId: Joi.string().uuid(),
  subcategoryId: Joi.string().uuid().allow(null),
  whatYouWillLearn: Joi.array().items(Joi.string()),
  requirements: Joi.array().items(Joi.string()),
  tags: Joi.array().items(Joi.string()),
  isPublished: Joi.boolean(),
});

// ─── Section Validators ───────────────────────────────────────────────────────

const createSectionSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  totalDuration: Joi.string().optional().allow(''),
  order: Joi.number().integer().min(0).optional(),
});

// ─── Lesson Validators ────────────────────────────────────────────────────────

const createLessonSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  duration: Joi.string().optional().allow(''),
  isPreview: Joi.boolean().default(false),
  type: Joi.string().valid('video', 'article', 'quiz').default('video'),
  videoUrl: Joi.string().uri().optional().allow(''),
  content: Joi.string().optional().allow(''),
  order: Joi.number().integer().min(0).optional(),
});

// ─── Review Validators ────────────────────────────────────────────────────────

const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  content: Joi.string().min(10).max(2000).required(),
});

// ─── Category Validators ──────────────────────────────────────────────────────

const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  slug: Joi.string().min(2).max(100).required(),
});

const createSubcategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  slug: Joi.string().min(2).max(100).required(),
  categoryId: Joi.string().uuid().required(),
});

// ─── Query Validators ─────────────────────────────────────────────────────────

const courseQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  search: Joi.string().optional().allow(''),
  category: Joi.string().optional(),
  level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'AllLevels').optional(),
  language: Joi.string().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  sortBy: Joi.string().valid('rating', 'studentCount', 'price', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  badge: Joi.string().valid('Hot', 'Bestseller', 'New', 'TopRated').optional(),
  free: Joi.boolean().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  createCourseSchema,
  updateCourseSchema,
  createSectionSchema,
  createLessonSchema,
  createReviewSchema,
  createCategorySchema,
  createSubcategorySchema,
  courseQuerySchema,
};
