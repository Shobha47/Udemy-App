const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Users ─────────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('password123', 12);

  const superadmin = await prisma.user.upsert({
    where: { email: 'admin@udemy-clone.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@udemy-clone.com',
      password: hashedPassword,
      role: 'SUPERADMIN',
      headline: 'Platform Administrator',
      emailVerified: true,
    },
  });

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@udemy-clone.com' },
    update: {},
    create: {
      name: 'Rajesh Kumar',
      email: 'instructor@udemy-clone.com',
      password: hashedPassword,
      role: 'INSTRUCTOR',
      headline: 'Tally & Accounting Expert | CA | 15+ years',
      bio: 'Chartered Accountant with 15+ years of experience in financial accounting, GST, and Tally.',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Rajesh',
      emailVerified: true,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@udemy-clone.com' },
    update: {},
    create: {
      name: 'Rahul Sharma',
      email: 'student@udemy-clone.com',
      password: hashedPassword,
      role: 'STUDENT',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Rahul',
      emailVerified: true,
    },
  });

  // ─── Categories ───────────────────────────────────────────────────────────
  const category = await prisma.category.upsert({
    where: { slug: 'tally' },
    update: {},
    create: { name: 'Tally', slug: 'tally' },
  });

  const subcategory = await prisma.subcategory.upsert({
    where: { slug_categoryId: { slug: 'accounting', categoryId: category.id } },
    update: {},
    create: { name: 'Accounting', slug: 'accounting', categoryId: category.id },
  });

  // ─── Tags ─────────────────────────────────────────────────────────────────
  const tagNames = ['Tally', 'Accounting', 'GST', 'Finance', 'Bookkeeping'];
  const tags = await Promise.all(
    tagNames.map((name) => prisma.tag.upsert({ where: { name }, update: {}, create: { name } }))
  );

  // ─── Course ───────────────────────────────────────────────────────────────
  const existingCourse = await prisma.course.findFirst({ where: { title: 'Tally Prime' } });

  if (!existingCourse) {
    const course = await prisma.course.create({
      data: {
        title: 'GST in Tally Prime',
        slug: 'tally-prime',
        subtitle: 'Learn Tally Prime from basics to advanced accounting with GST, inventory, and payroll management',
        description: 'Master Tally Prime with practical accounting workflows, GST filing, inventory handling, payroll management, voucher entries, banking, and financial reporting.',
        image: 'https://res.cloudinary.com/dvy2kjhg0/image/upload/q_auto/f_auto/v1779788731/course-thumbnails/hqod7wiwyxzg6hd6wrp3.jpg',
        previewVideo: 'https://res.cloudinary.com/dvy2kjhg0/video/upload/q_auto/f_auto/v1779789003/course-previews/rboa4gtq4kfuhieunpiu.mp4',
        price: 0,
        originalPrice: 999,
        language: 'English',
        level: 'Beginner',
        badge: 'Hot',
        lastUpdated: 'May 2026',
        rating: 4.7,
        reviewCount: 8420,
        studentCount: 45210,
        totalHours: 18,
        totalLectures: 86,
        totalArticles: 12,
        hasCertificate: true,
        hasLifetimeAccess: true,
        hasMobileAccess: true,
        isPublished: true,
        isApproved: true,
        instructorId: instructor.id,
        categoryId: category.id,
        subcategoryId: subcategory.id,
        whatYouWillLearn: {
          create: [
            { text: 'How to Set GST Details in TallyPrime - Tally Learning Hub', order: 0 },
            { text: 'GST Invoice in Tallys', order: 1 },
          ],
        },
        requirements: {
          create: [
            { text: 'No accounting experience required', order: 0 },
            { text: 'Basic computer knowledge', order: 1 },
            { text: 'Windows laptop or desktop recommended', order: 2 },
          ],
        },
        tags: {
          create: tags.map((tag) => ({ tagId: tag.id })),
        },
        sections: {
          create: [
            {
              title: 'Introduction to Tally Prime',
              totalDuration: '7m 13s',
              order: 0,
              lessons: {
                create: [
                  { title: 'Welcome to Tally Prime', duration: '7:13', isPreview: true, type: 'video', videoUrl: 'https://res.cloudinary.com/dvy2kjhg0/video/upload/q_auto/f_auto/v1779789560/course-lessons/wyzehgpnbjmvmouvawi8.mp4', order: 0 },
                ],
              },
            },
            {
              title: 'Accounting Masters',
              totalDuration: '12m 27s',
              order: 1,
              lessons: {
                create: [
                  { title: 'GST invoice in Tally Prime', duration: '12:27', isPreview: false, type: 'video', videoUrl: 'https://res.cloudinary.com/dvy2kjhg0/video/upload/q_auto/f_auto/v1779970582/course-lessons/bwjl5vnttrqgiydhnzt6.mp4', order: 0 },
                ],
              },
            },
          ],
        },
      },
    });

    // Seed enrollment and review
    await prisma.enrollment.create({
      data: { studentId: student.id, courseId: course.id, progress: 25 },
    });

    await prisma.review.create({
      data: {
        rating: 5,
        content: 'Very beginner friendly course. I learned accounting and GST filing step by step.',
        date: 'April 2026',
        helpful: 312,
        authorId: student.id,
        courseId: course.id,
      },
    });

    console.log(`✅ Course created: ${course.id}`);
  }

  console.log(`✅ SuperAdmin: admin@udemy-clone.com / password123`);
  console.log(`✅ Instructor: instructor@udemy-clone.com / password123`);
  console.log(`✅ Student:    student@udemy-clone.com / password123`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());