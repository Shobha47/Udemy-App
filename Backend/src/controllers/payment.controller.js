// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const { prisma } = require('../config/database');
// const { successResponse, errorResponse } = require('../utils/response');
 
// // ─────────────────────────────────────────────────────────────────────────────
// // HELPER: Create free enrollment directly (price = 0)
// // ─────────────────────────────────────────────────────────────────────────────
// async function createFreeEnrollment(studentId, courseId, course) {
//   // Create order record for free course
//   const order = await prisma.order.create({
//     data: {
//       amount: 0,
//       currency: 'inr',
//       originalAmount: 0,
//       status: 'COMPLETED',
//       paymentMethod: 'FREE',
//       courseTitle: course.title,
//       coursePriceSnapshot: 0,
//       studentId,
//       courseId,
//     },
//   });
 
//   // Create enrollment
//   const enrollment = await prisma.enrollment.create({
//     data: { studentId, courseId },
//   });
 
//   // Link order ↔ enrollment
//   await prisma.order.update({
//     where: { id: order.id },
//     data: { enrollmentId: enrollment.id },
//   });
 
//   // Bump student count
//   await prisma.course.update({
//     where: { id: courseId },
//     data: { studentCount: { increment: 1 } },
//   });
 
//   return { order, enrollment };
// }
 
// // ─────────────────────────────────────────────────────────────────────────────
// // POST /payments/checkout/:courseId
// // Creates Stripe Checkout Session (paid) or free enrollment
// // ─────────────────────────────────────────────────────────────────────────────
// async function createCheckoutSession(req, res, next) {
//   try {
//     const { courseId } = req.params;
//     const studentId = req.user.id;
 
//     // ── 1. Fetch course ──────────────────────────────────────────────────────
//     const course = await prisma.course.findFirst({
//       where: { id: courseId, isPublished: true, isApproved: true },
//       include: { instructor: { select: { id: true, name: true } } },
//     });
 
//     if (!course) {
//       return errorResponse(res, { statusCode: 404, message: 'Course not found.' });
//     }
 
//     // ── 2. Already enrolled? ─────────────────────────────────────────────────
//     const existingEnrollment = await prisma.enrollment.findUnique({
//       where: { studentId_courseId: { studentId, courseId } },
//     });
//     if (existingEnrollment) {
//       return errorResponse(res, { statusCode: 409, message: 'You are already enrolled in this course.' });
//     }
 
//     // ── 3. Free course → enroll directly ────────────────────────────────────
//     if (course.price === 0) {
//       const { order, enrollment } = await createFreeEnrollment(studentId, courseId, course);
//       return successResponse(res, {
//         statusCode: 201,
//         message: 'Enrolled successfully (free course).',
//         data: { type: 'free', order, enrollment },
//       });
//     }
 
//     // ── 4. Paid course → create Stripe Checkout Session ─────────────────────
//     const student = await prisma.user.findUnique({
//       where: { id: studentId },
//       select: { email: true, name: true },
//     });
 
//     // Convert price to paise (INR smallest unit) or cents (USD)
//     const currency = process.env.STRIPE_CURRENCY || 'inr';
//     const unitAmount = Math.round(course.price * 100); // ₹999 → 99900 paise
 
//     // ── 5. Create pending Order record BEFORE stripe session ─────────────────
//     const order = await prisma.order.create({
//       data: {
//         amount: unitAmount,
//         currency,
//         originalAmount: course.originalPrice ? Math.round(course.originalPrice * 100) : unitAmount,
//         status: 'PENDING',
//         paymentMethod: 'STRIPE',
//         courseTitle: course.title,
//         coursePriceSnapshot: course.price,
//         studentId,
//         courseId,
//       },
//     });
 
//     // ── 6. Create Stripe Checkout Session ─────────────────────────────────────
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       mode: 'payment',
//       customer_email: student.email,
//       client_reference_id: order.id, // our internal order ID
//       line_items: [
//         {
//           price_data: {
//             currency,
//             unit_amount: unitAmount,
//             product_data: {
//               name: course.title,
//               description: course.subtitle || course.description.slice(0, 200),
//               images: course.image ? [course.image] : [],
//               metadata: {
//                 courseId: course.id,
//                 instructorId: course.instructorId,
//               },
//             },
//           },
//           quantity: 1,
//         },
//       ],
//       metadata: {
//         orderId: order.id,
//         courseId: course.id,
//         studentId,
//       },
//       success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&courseId=${courseId}`,
//       cancel_url: `${process.env.CLIENT_URL}/payment/cancel?courseId=${courseId}`,
//       expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min expiry
//     });
 
//     // ── 7. Store Stripe session ID on order ──────────────────────────────────
//     await prisma.order.update({
//       where: { id: order.id },
//       data: { stripeSessionId: session.id },
//     });
 
//     return successResponse(res, {
//       statusCode: 201,
//       message: 'Checkout session created.',
//       data: {
//         type: 'paid',
//         sessionId: session.id,
//         sessionUrl: session.url, // redirect user here
//         orderId: order.id,
//         amount: course.price,
//         currency,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// }
 
// // ─────────────────────────────────────────────────────────────────────────────
// // POST /payments/webhook
// // Stripe sends events here — handles checkout.session.completed etc.
// // ─────────────────────────────────────────────────────────────────────────────
// async function stripeWebhook(req, res, next) {
//   const sig = req.headers['stripe-signature'];
//   const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
 
//   let event;
 
//   // ── 1. Verify webhook signature ───────────────────────────────────────────
//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//   } catch (err) {
//     console.error('❌ Webhook signature verification failed:', err.message);
//     return res.status(400).json({ error: `Webhook Error: ${err.message}` });
//   }
 
//   // ── 2. Idempotency check — skip if already processed ─────────────────────
//   const existingOrder = await prisma.order.findFirst({
//     where: { webhookEventId: event.id },
//   });
//   if (existingOrder) {
//     console.log(`ℹ️  Webhook event ${event.id} already processed. Skipping.`);
//     return res.status(200).json({ received: true });
//   }
 
//   console.log(`📨 Stripe webhook: ${event.type}`);
 
//   // ── 3. Handle events ──────────────────────────────────────────────────────
//   try {
//     switch (event.type) {
 
//       // ✅ Payment Successful
//       case 'checkout.session.completed': {
//         const session = event.data.object;
//         const orderId = session.metadata?.orderId;
 
//         if (!orderId) break;
 
//         const order = await prisma.order.findUnique({ where: { id: orderId } });
//         if (!order || order.status === 'COMPLETED') break;
 
//         // Create enrollment
//         const enrollment = await prisma.enrollment.create({
//           data: {
//             studentId: order.studentId,
//             courseId: order.courseId,
//           },
//         });
 
//         // Update order: COMPLETED, link enrollment, store stripe IDs
//         await prisma.order.update({
//           where: { id: orderId },
//           data: {
//             status: 'COMPLETED',
//             stripeSessionId: session.id,
//             stripePaymentIntentId: session.payment_intent,
//             stripeCustomerId: session.customer,
//             enrollmentId: enrollment.id,
//             webhookEventId: event.id,
//           },
//         });
 
//         // Increment student count
//         await prisma.course.update({
//           where: { id: order.courseId },
//           data: { studentCount: { increment: 1 } },
//         });
 
//         console.log(`✅ Enrollment created for order ${orderId}`);
//         break;
//       }
 
//       // ❌ Payment Failed
//       case 'checkout.session.expired': {
//         const session = event.data.object;
//         const orderId = session.metadata?.orderId;
//         if (!orderId) break;
 
//         await prisma.order.update({
//           where: { id: orderId },
//           data: {
//             status: 'CANCELLED',
//             failureReason: 'Checkout session expired',
//             webhookEventId: event.id,
//           },
//         });
//         console.log(`⏰ Order ${orderId} expired`);
//         break;
//       }
 
//       // ❌ Payment Intent Failed
//       case 'payment_intent.payment_failed': {
//         const intent = event.data.object;
//         const order = await prisma.order.findFirst({
//           where: { stripePaymentIntentId: intent.id },
//         });
//         if (order) {
//           await prisma.order.update({
//             where: { id: order.id },
//             data: {
//               status: 'FAILED',
//               failureReason: intent.last_payment_error?.message || 'Payment failed',
//               webhookEventId: event.id,
//             },
//           });
//         }
//         break;
//       }
 
//       // 💸 Refund Issued
//       case 'charge.refunded': {
//         const charge = event.data.object;
//         const paymentIntentId = charge.payment_intent;
 
//         const order = await prisma.order.findFirst({
//           where: { stripePaymentIntentId: paymentIntentId },
//         });
 
//         if (order) {
//           // Remove enrollment
//           if (order.enrollmentId) {
//             await prisma.enrollment.delete({ where: { id: order.enrollmentId } }).catch(() => {});
//             await prisma.course.update({
//               where: { id: order.courseId },
//               data: { studentCount: { decrement: 1 } },
//             });
//           }
 
//           await prisma.order.update({
//             where: { id: order.id },
//             data: {
//               status: 'REFUNDED',
//               refundId: charge.refunds?.data?.[0]?.id,
//               refundedAt: new Date(),
//               enrollmentId: null,
//               webhookEventId: event.id,
//             },
//           });
//           console.log(`💸 Refund processed for order ${order.id}`);
//         }
//         break;
//       }
 
//       default:
//         console.log(`Unhandled event type: ${event.type}`);
//     }
//   } catch (error) {
//     console.error('❌ Webhook handler error:', error);
//     // Still return 200 to Stripe — don't let our error cause retries
//   }
 
//   return res.status(200).json({ received: true });
// }
 
// // ─────────────────────────────────────────────────────────────────────────────
// // GET /payments/verify-session/:sessionId
// // Frontend calls this after redirect from Stripe success page
// // ─────────────────────────────────────────────────────────────────────────────
// async function verifySession(req, res, next) {
//   try {
//     const { sessionId } = req.params;
 
//     // Check our DB first
//     const order = await prisma.order.findUnique({
//       where: { stripeSessionId: sessionId },
//       include: {
//         course: { select: { id: true, title: true, image: true } },
//         enrollment: { select: { id: true, enrolledAt: true } },
//       },
//     });
 
//     if (!order) {
//       return errorResponse(res, { statusCode: 404, message: 'Order not found.' });
//     }
 
//     // Security: only the student who made this order can verify it
//     if (order.studentId !== req.user.id) {
//       return errorResponse(res, { statusCode: 403, message: 'Forbidden.' });
//     }
 
//     // If webhook hasn't fired yet, poll Stripe directly
//     if (order.status === 'PENDING') {
//       const session = await stripe.checkout.sessions.retrieve(sessionId);
 
//       if (session.payment_status === 'paid') {
//         // Webhook may be delayed — handle it here too
//         let enrollment = await prisma.enrollment.findUnique({
//           where: { studentId_courseId: { studentId: order.studentId, courseId: order.courseId } },
//         });
 
//         if (!enrollment) {
//           enrollment = await prisma.enrollment.create({
//             data: { studentId: order.studentId, courseId: order.courseId },
//           });
//           await prisma.order.update({
//             where: { id: order.id },
//             data: {
//               status: 'COMPLETED',
//               stripePaymentIntentId: session.payment_intent,
//               stripeCustomerId: session.customer,
//               enrollmentId: enrollment.id,
//             },
//           });
//           await prisma.course.update({
//             where: { id: order.courseId },
//             data: { studentCount: { increment: 1 } },
//           });
//         }
 
//         return successResponse(res, {
//           data: {
//             status: 'COMPLETED',
//             enrolled: true,
//             course: order.course,
//             orderId: order.id,
//           },
//         });
//       }
//     }
 
//     return successResponse(res, {
//       data: {
//         status: order.status,
//         enrolled: order.status === 'COMPLETED',
//         course: order.course,
//         orderId: order.id,
//         enrolledAt: order.enrollment?.enrolledAt ?? null,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// }
 
// // ─────────────────────────────────────────────────────────────────────────────
// // GET /payments/orders — Student's purchase history
// // ─────────────────────────────────────────────────────────────────────────────
// async function getMyOrders(req, res, next) {
//   try {
//     const { page = 1, limit = 10 } = req.query;
//     const skip = (parseInt(page) - 1) * parseInt(limit);
 
//     const [total, orders] = await Promise.all([
//       prisma.order.count({ where: { studentId: req.user.id } }),
//       prisma.order.findMany({
//         where: { studentId: req.user.id },
//         include: {
//           course: {
//             select: { id: true, title: true, image: true, instructor: { select: { name: true } } },
//           },
//         },
//         orderBy: { createdAt: 'desc' },
//         skip,
//         take: parseInt(limit),
//       }),
//     ]);
 
//     // Format amounts back to rupees/dollars
//     const formatted = orders.map((o) => ({
//       ...o,
//       amountFormatted: `${o.currency.toUpperCase()} ${(o.amount / 100).toFixed(2)}`,
//     }));
 
//     return successResponse(res, {
//       data: { orders: formatted },
//       meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
//     });
//   } catch (error) {
//     next(error);
//   }
// }
 
// // ─────────────────────────────────────────────────────────────────────────────
// // GET /payments/orders/:orderId — Single order detail
// // ─────────────────────────────────────────────────────────────────────────────
// async function getOrderById(req, res, next) {
//   try {
//     const order = await prisma.order.findUnique({
//       where: { id: req.params.orderId },
//       include: {
//         course: { select: { id: true, title: true, image: true } },
//         enrollment: { select: { id: true, enrolledAt: true, progress: true } },
//       },
//     });
 
//     if (!order) return errorResponse(res, { statusCode: 404, message: 'Order not found.' });
 
//     if (order.studentId !== req.user.id && req.user.role !== 'SUPERADMIN') {
//       return errorResponse(res, { statusCode: 403, message: 'Forbidden.' });
//     }
 
//     return successResponse(res, {
//       data: {
//         order: {
//           ...order,
//           amountFormatted: `${order.currency.toUpperCase()} ${(order.amount / 100).toFixed(2)}`,
//         },
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// }
 
// // ─────────────────────────────────────────────────────────────────────────────
// // POST /payments/refund/:orderId  (SuperAdmin only)
// // ─────────────────────────────────────────────────────────────────────────────
// async function issueRefund(req, res, next) {
//   try {
//     const { orderId } = req.params;
//     const { reason } = req.body;
 
//     const order = await prisma.order.findUnique({ where: { id: orderId } });
//     if (!order) return errorResponse(res, { statusCode: 404, message: 'Order not found.' });
 
//     if (order.status !== 'COMPLETED') {
//       return errorResponse(res, { statusCode: 400, message: `Cannot refund order with status: ${order.status}` });
//     }
 
//     if (order.paymentMethod === 'FREE') {
//       return errorResponse(res, { statusCode: 400, message: 'Cannot refund a free course.' });
//     }
 
//     if (!order.stripePaymentIntentId) {
//       return errorResponse(res, { statusCode: 400, message: 'No payment intent found for this order.' });
//     }
 
//     // Issue refund via Stripe
//     const refund = await stripe.refunds.create({
//       payment_intent: order.stripePaymentIntentId,
//       reason: reason || 'requested_by_customer',
//     });
 
//     // Update order (webhook will also fire charge.refunded, but we handle here too)
//     if (order.enrollmentId) {
//       await prisma.enrollment.delete({ where: { id: order.enrollmentId } }).catch(() => {});
//       await prisma.course.update({
//         where: { id: order.courseId },
//         data: { studentCount: { decrement: 1 } },
//       });
//     }
 
//     await prisma.order.update({
//       where: { id: orderId },
//       data: {
//         status: 'REFUNDED',
//         refundId: refund.id,
//         refundedAt: new Date(),
//         enrollmentId: null,
//         failureReason: reason,
//       },
//     });
 
//     return successResponse(res, {
//       message: 'Refund issued successfully.',
//       data: { refundId: refund.id, amount: refund.amount, status: refund.status },
//     });
//   } catch (error) {
//     if (error.type === 'StripeInvalidRequestError') {
//       return errorResponse(res, { statusCode: 400, message: error.message });
//     }
//     next(error);
//   }
// }
 
// // ─────────────────────────────────────────────────────────────────────────────
// // GET /payments/admin/orders  (SuperAdmin only)
// // ─────────────────────────────────────────────────────────────────────────────
// async function adminGetAllOrders(req, res, next) {
//   try {
//     const { page = 1, limit = 20, status, courseId, studentId } = req.query;
//     const skip = (parseInt(page) - 1) * parseInt(limit);
 
//     const where = {
//       ...(status && { status }),
//       ...(courseId && { courseId }),
//       ...(studentId && { studentId }),
//     };
 
//     const [total, orders] = await Promise.all([
//       prisma.order.count({ where }),
//       prisma.order.findMany({
//         where,
//         include: {
//           student: { select: { id: true, name: true, email: true } },
//           course: { select: { id: true, title: true } },
//         },
//         orderBy: { createdAt: 'desc' },
//         skip,
//         take: parseInt(limit),
//       }),
//     ]);
 
//     const revenue = await prisma.order.aggregate({
//       where: { status: 'COMPLETED' },
//       _sum: { amount: true },
//     });
 
//     return successResponse(res, {
//       data: {
//         orders: orders.map((o) => ({
//           ...o,
//           amountFormatted: `${o.currency.toUpperCase()} ${(o.amount / 100).toFixed(2)}`,
//         })),
//         totalRevenue: ((revenue._sum.amount || 0) / 100).toFixed(2),
//       },
//       meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
//     });
//   } catch (error) {
//     next(error);
//   }
// }
 
// module.exports = {
//   createCheckoutSession,
//   stripeWebhook,
//   verifySession,
//   getMyOrders,
//   getOrderById,
//   issueRefund,
//   adminGetAllOrders,
// };

// Razorpay Payment Getway other controllers
// const Razorpay = require('razorpay');
// const crypto = require('crypto');
// const { prisma } = require('../config/database');
// const { successResponse, errorResponse } = require('../utils/response');

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // ... keep createCheckoutSession, verifyPayment, razorpayWebhook exactly as they are ...

// // ── GET /payments/orders ──────────────────────────────────────────────────────
// async function getMyOrders(req, res, next) {
//   try {
//     const { page = 1, limit = 10 } = req.query;
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const [total, orders] = await Promise.all([
//       prisma.order.count({ where: { studentId: req.user.id } }),
//       prisma.order.findMany({
//         where: { studentId: req.user.id },
//         include: {
//           course: {
//             select: {
//               id: true, title: true, image: true,
//               instructor: { select: { name: true } },
//             },
//           },
//         },
//         orderBy: { createdAt: 'desc' },
//         skip,
//         take: parseInt(limit),
//       }),
//     ]);

//     const formatted = orders.map((o) => ({
//       ...o,
//       amountFormatted: `${o.currency} ${(o.amount / 100).toFixed(2)}`,
//     }));

//     return successResponse(res, {
//       data: { orders: formatted },
//       meta: {
//         total,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         totalPages: Math.ceil(total / parseInt(limit)),
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// // ── GET /payments/orders/:orderId ─────────────────────────────────────────────
// async function getOrderById(req, res, next) {
//   try {
//     const order = await prisma.order.findUnique({
//       where: { id: req.params.orderId },
//       include: {
//         course: { select: { id: true, title: true, image: true } },
//         enrollment: { select: { id: true, enrolledAt: true, progress: true } },
//       },
//     });

//     if (!order) return errorResponse(res, { statusCode: 404, message: 'Order not found.' });

//     if (order.studentId !== req.user.id && req.user.role !== 'SUPERADMIN') {
//       return errorResponse(res, { statusCode: 403, message: 'Forbidden.' });
//     }

//     return successResponse(res, {
//       data: {
//         order: {
//           ...order,
//           amountFormatted: `${order.currency} ${(order.amount / 100).toFixed(2)}`,
//         },
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// // ── POST /payments/refund/:orderId (SuperAdmin) ───────────────────────────────
// async function issueRefund(req, res, next) {
//   try {
//     const { orderId } = req.params;
//     const { reason } = req.body;

//     const order = await prisma.order.findUnique({ where: { id: orderId } });
//     if (!order) return errorResponse(res, { statusCode: 404, message: 'Order not found.' });

//     if (order.status !== 'COMPLETED') {
//       return errorResponse(res, { statusCode: 400, message: `Cannot refund order with status: ${order.status}` });
//     }
//     if (order.paymentMethod === 'FREE') {
//       return errorResponse(res, { statusCode: 400, message: 'Cannot refund a free course.' });
//     }

//     // stripePaymentIntentId field holds razorpay_payment_id in our schema
//     const razorpayPaymentId = order.stripePaymentIntentId;
//     if (!razorpayPaymentId) {
//       return errorResponse(res, { statusCode: 400, message: 'No payment ID found for this order.' });
//     }

//     // Issue refund via Razorpay
//     const refund = await razorpay.payments.refund(razorpayPaymentId, {
//       amount: order.amount, // full refund; pass partial amount for partial refund
//       notes: { reason: reason || 'requested_by_customer' },
//     });

//     // Remove enrollment
//     if (order.enrollmentId) {
//       await prisma.enrollment.delete({ where: { id: order.enrollmentId } }).catch(() => {});
//       await prisma.course.update({
//         where: { id: order.courseId },
//         data: { studentCount: { decrement: 1 } },
//       });
//     }

//     await prisma.order.update({
//       where: { id: orderId },
//       data: {
//         status: 'REFUNDED',
//         refundId: refund.id,
//         refundedAt: new Date(),
//         enrollmentId: null,
//         failureReason: reason,
//       },
//     });

//     return successResponse(res, {
//       message: 'Refund issued successfully.',
//       data: { refundId: refund.id, amount: refund.amount, status: refund.status },
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// // ── GET /payments/admin/orders (SuperAdmin) ───────────────────────────────────
// async function adminGetAllOrders(req, res, next) {
//   try {
//     const { page = 1, limit = 20, status, courseId, studentId } = req.query;
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const where = {
//       ...(status && { status }),
//       ...(courseId && { courseId }),
//       ...(studentId && { studentId }),
//     };

//     const [total, orders, revenue] = await Promise.all([
//       prisma.order.count({ where }),
//       prisma.order.findMany({
//         where,
//         include: {
//           student: { select: { id: true, name: true, email: true } },
//           course: { select: { id: true, title: true } },
//         },
//         orderBy: { createdAt: 'desc' },
//         skip,
//         take: parseInt(limit),
//       }),
//       prisma.order.aggregate({
//         where: { status: 'COMPLETED' },
//         _sum: { amount: true },
//       }),
//     ]);

//     return successResponse(res, {
//       data: {
//         orders: orders.map((o) => ({
//           ...o,
//           amountFormatted: `INR ${(o.amount / 100).toFixed(2)}`,
//         })),
//         totalRevenue: `INR ${((revenue._sum.amount || 0) / 100).toFixed(2)}`,
//       },
//       meta: {
//         total,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         totalPages: Math.ceil(total / parseInt(limit)),
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// // ── EXPORTS ───────────────────────────────────────────────────────────────────
// module.exports = {
//   createCheckoutSession,
//   verifyPayment,
//   razorpayWebhook,
//   getMyOrders,
//   getOrderById,
//   issueRefund,
//   adminGetAllOrders,
// };

const Razorpay = require('../utils/razorpay');
const crypto = require('crypto');
const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

// ── POST /payments/checkout/:courseId ────────────────────────────────────────
// Creates a Razorpay Order (not enrollment yet — that happens after payment verify)
async function createCheckoutSession(req, res, next) {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const course = await prisma.course.findFirst({
      where: { id: courseId, isPublished: true, isApproved: true },
    });
    if (!course) return errorResponse(res, { statusCode: 404, message: 'Course not found.' });

    // Already enrolled?
    const existing = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (existing) return errorResponse(res, { statusCode: 409, message: 'Already enrolled.' });

    // Free course → enroll directly
    if (course.price === 0) {
      const order = await prisma.order.create({
        data: {
          amount: 0, currency: 'INR', status: 'COMPLETED',
          paymentMethod: 'FREE', courseTitle: course.title,
          coursePriceSnapshot: 0, studentId, courseId,
        },
      });
      const enrollment = await prisma.enrollment.create({ data: { studentId, courseId } });
      await prisma.order.update({ where: { id: order.id }, data: { enrollmentId: enrollment.id } });
      await prisma.course.update({ where: { id: courseId }, data: { studentCount: { increment: 1 } } });

      return successResponse(res, {
        statusCode: 201,
        message: 'Enrolled successfully (free course).',
        data: { type: 'free', enrollment },
      });
    }

    // Paid course → create Razorpay order
    const amountInPaise = Math.round(course.price * 100); // ₹999 → 99900

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: process.env.RAZORPAY_CURRENCY || 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { courseId, studentId },
    });

    // Save pending order in our DB
    const dbOrder = await prisma.order.create({
      data: {
        amount: amountInPaise,
        currency: 'INR',
        status: 'PENDING',
        paymentMethod: 'RAZORPAY',         // change enum value (see schema note below)
        courseTitle: course.title,
        coursePriceSnapshot: course.price,
        stripeSessionId: razorpayOrder.id,  // reuse field to store razorpay order id
        studentId,
        courseId,
      },
    });

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { name: true, email: true },
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Razorpay order created.',
      data: {
        type: 'paid',
        // Frontend uses these to open Razorpay checkout popup
        razorpayOrderId: razorpayOrder.id,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: 'INR',
        courseName: course.title,
        courseImage: course.image,
        studentName: student.name,
        studentEmail: student.email,
        dbOrderId: dbOrder.id,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ── POST /payments/verify ─────────────────────────────────────────────────────
// Frontend calls this after Razorpay popup succeeds with the 3 payment IDs
async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

    // 1. Verify signature — HMAC SHA256
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return errorResponse(res, { statusCode: 400, message: 'Invalid payment signature. Possible tampering.' });
    }

    // 2. Find our pending order
    const order = await prisma.order.findUnique({ where: { id: dbOrderId } });
    if (!order) return errorResponse(res, { statusCode: 404, message: 'Order not found.' });
    if (order.studentId !== req.user.id) return errorResponse(res, { statusCode: 403, message: 'Forbidden.' });
    if (order.status === 'COMPLETED') {
      return errorResponse(res, { statusCode: 409, message: 'Payment already verified.' });
    }

    // 3. Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: { studentId: order.studentId, courseId: order.courseId },
    });

    // 4. Mark order complete
    await prisma.order.update({
      where: { id: dbOrderId },
      data: {
        status: 'COMPLETED',
        stripePaymentIntentId: razorpay_payment_id, // reuse field for razorpay payment id
        enrollmentId: enrollment.id,
      },
    });

    // 5. Increment student count
    await prisma.course.update({
      where: { id: order.courseId },
      data: { studentCount: { increment: 1 } },
    });

    return successResponse(res, {
      message: 'Payment verified. Enrolled successfully.',
      data: { enrolled: true, courseId: order.courseId, enrollmentId: enrollment.id },
    });
  } catch (error) {
    next(error);
  }
}

// ── POST /payments/webhook ─────────────────────────────────────────────────────
// Razorpay webhook (optional but recommended for reliability)
async function razorpayWebhook(req, res, next) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  // Verify webhook signature
  const expectedSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (expectedSig !== signature) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const event = req.body.event;
  const payload = req.body.payload?.payment?.entity;

  if (event === 'payment.captured') {
    // Backup: if /verify was never called (rare), handle it here
    const razorpayOrderId = payload?.order_id;
    const order = await prisma.order.findFirst({
      where: { stripeSessionId: razorpayOrderId, status: 'PENDING' },
    });

    if (order) {
      const existing = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: order.studentId, courseId: order.courseId } },
      });
      if (!existing) {
        const enrollment = await prisma.enrollment.create({
          data: { studentId: order.studentId, courseId: order.courseId },
        });
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'COMPLETED', enrollmentId: enrollment.id },
        });
        await prisma.course.update({
          where: { id: order.courseId },
          data: { studentCount: { increment: 1 } },
        });
      }
    }
  }

  if (event === 'payment.failed') {
    const razorpayOrderId = payload?.order_id;
    await prisma.order.updateMany({
      where: { stripeSessionId: razorpayOrderId },
      data: { status: 'FAILED', failureReason: payload?.error_description },
    });
  }

  return res.status(200).json({ received: true });
}

// ── GET /payments/orders ──────────────────────────────────────────────────────
async function getMyOrders(req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [total, orders] = await Promise.all([
      prisma.order.count({ where: { studentId: req.user.id } }),
      prisma.order.findMany({
        where: { studentId: req.user.id },
        include: {
          course: {
            select: {
              id: true, title: true, image: true,
              instructor: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
    ]);

    const formatted = orders.map((o) => ({
      ...o,
      amountFormatted: `${o.currency} ${(o.amount / 100).toFixed(2)}`,
    }));

    return successResponse(res, {
      data: { orders: formatted },
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

// ── GET /payments/orders/:orderId ─────────────────────────────────────────────
async function getOrderById(req, res, next) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      include: {
        course: { select: { id: true, title: true, image: true } },
        enrollment: { select: { id: true, enrolledAt: true, progress: true } },
      },
    });

    if (!order) return errorResponse(res, { statusCode: 404, message: 'Order not found.' });

    if (order.studentId !== req.user.id && req.user.role !== 'SUPERADMIN') {
      return errorResponse(res, { statusCode: 403, message: 'Forbidden.' });
    }

    return successResponse(res, {
      data: {
        order: {
          ...order,
          amountFormatted: `${order.currency} ${(order.amount / 100).toFixed(2)}`,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// ── POST /payments/refund/:orderId (SuperAdmin) ───────────────────────────────
async function issueRefund(req, res, next) {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return errorResponse(res, { statusCode: 404, message: 'Order not found.' });

    if (order.status !== 'COMPLETED') {
      return errorResponse(res, { statusCode: 400, message: `Cannot refund order with status: ${order.status}` });
    }
    if (order.paymentMethod === 'FREE') {
      return errorResponse(res, { statusCode: 400, message: 'Cannot refund a free course.' });
    }

    // stripePaymentIntentId field holds razorpay_payment_id in our schema
    const razorpayPaymentId = order.stripePaymentIntentId;
    if (!razorpayPaymentId) {
      return errorResponse(res, { statusCode: 400, message: 'No payment ID found for this order.' });
    }

    // Issue refund via Razorpay
    const refund = await razorpay.payments.refund(razorpayPaymentId, {
      amount: order.amount, // full refund; pass partial amount for partial refund
      notes: { reason: reason || 'requested_by_customer' },
    });

    // Remove enrollment
    if (order.enrollmentId) {
      await prisma.enrollment.delete({ where: { id: order.enrollmentId } }).catch(() => {});
      await prisma.course.update({
        where: { id: order.courseId },
        data: { studentCount: { decrement: 1 } },
      });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'REFUNDED',
        refundId: refund.id,
        refundedAt: new Date(),
        enrollmentId: null,
        failureReason: reason,
      },
    });

    return successResponse(res, {
      message: 'Refund issued successfully.',
      data: { refundId: refund.id, amount: refund.amount, status: refund.status },
    });
  } catch (error) {
    next(error);
  }
}

// ── GET /payments/admin/orders (SuperAdmin) ───────────────────────────────────
async function adminGetAllOrders(req, res, next) {
  try {
    const { page = 1, limit = 20, status, courseId, studentId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(status && { status }),
      ...(courseId && { courseId }),
      ...(studentId && { studentId }),
    };

    const [total, orders, revenue] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          student: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    return successResponse(res, {
      data: {
        orders: orders.map((o) => ({
          ...o,
          amountFormatted: `INR ${o.amount.toFixed(2)}`,
        })),
        totalRevenue: `INR ${(revenue._sum.amount || 0).toFixed(2)}`,
      },
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

module.exports = { createCheckoutSession, verifyPayment, razorpayWebhook, getMyOrders, getOrderById, issueRefund, adminGetAllOrders };