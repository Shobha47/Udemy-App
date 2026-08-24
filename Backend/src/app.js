const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Routes
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const reviewRoutes = require('./routes/review.routes');
const categoryRoutes = require('./routes/category.routes');
const paymentRoutes = require('./routes/payment.routes');
const publicRoutes = require('./routes/instructor.routes');
const certificateRoutes = require('./routes/certificate.routes');
const courseQuizAssignmentRoutes = require('./routes/quizAssignment.routes');

const app = express();

// ─── Security & Utility Middleware ───────────────────────────────────────────
app.use(helmet());
app.use(compression());

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:8081',
      'https://udemy-web.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again after 15 minutes.' },
});

// Stripe webhook FIRST
app.use(
  '/api/v1/payments/webhook',
  express.raw({ type: 'application/json' })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Udemy Clone API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authLimiter, authRoutes);
app.use(`${API_PREFIX}/courses`, courseRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/enrollments`, enrollmentRoutes);
app.use(`${API_PREFIX}/reviews`, reviewRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/public`, publicRoutes);
app.use(`${API_PREFIX}/certificates`, certificateRoutes);
app.use(`${API_PREFIX}/quizzes`, courseQuizAssignmentRoutes);
app.use(`${API_PREFIX}/assignments`, courseQuizAssignmentRoutes);


// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
