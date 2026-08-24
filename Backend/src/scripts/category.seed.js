const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categoriesData = [
  {
    name: 'Tally',
    slug: 'tally',
    subcategories: [
      'Tally Prime',
      'GST in Tally',
      'Tally ERP',
      'Accounting Basics',
      'Payroll in Tally',
    ],
  },

  {
    name: 'SPEFL',
    slug: 'spefl',
    subcategories: [
      'Spoken English',
      'Personality Development',
      'Soft Skills',
      'Communication Skills',
      'Interview Preparation',
    ],
  },

  {
    name: 'IT-ITeS',
    slug: 'it-ites',
    subcategories: [
      'Computer Basics',
      'Digital Literacy',
      'Internet & Email',
      'Typing Skills',
      'Office Tools',
    ],
  },

  {
    name: 'Excel',
    slug: 'excel',
    subcategories: [
      'Basic Excel',
      'Advanced Excel',
      'Excel Formulas',
      'Pivot Tables',
      'Excel Dashboard',
    ],
  },

  {
    name: 'ES',
    slug: 'es',
    subcategories: [
      'Employability Skills',
      'Resume Building',
      'Interview Skills',
      'Workplace Communication',
      'Professional Ethics',
    ],
  },

  {
    name: 'CSD',
    slug: 'csd',
    subcategories: [
      'Customer Service',
      'Sales Skills',
      'Retail Operations',
      'Client Communication',
      'CRM Basics',
    ],
  },

  {
    name: 'B&W',
    slug: 'b-and-w',
    subcategories: [
      'Beauty Basics',
      'Wellness Training',
      'Salon Management',
      'Hair Styling',
      'Skin Care',
    ],
  },

  {
    name: 'AS',
    slug: 'as',
    subcategories: [
      'Aptitude Skills',
      'Reasoning',
      'Quantitative Aptitude',
      'Logical Thinking',
      'Problem Solving',
    ],
  },

  {
    name: 'AIR - TALLY',
    slug: 'air-tally',
    subcategories: [
      'Advanced Tally',
      'Industry Accounting',
      'Tally Projects',
      'Business Accounting',
      'Financial Reporting',
    ],
  },

  {
    name: 'AIR - EXCEL',
    slug: 'air-excel',
    subcategories: [
      'Advanced Excel Reports',
      'Data Analysis',
      'Excel Automation',
      'MIS Reporting',
      'Business Dashboards',
    ],
  },
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

async function main() {
  console.log(
    '🌱 Seeding categories & subcategories...'
  );

  for (const categoryData of categoriesData) {
    const category =
      await prisma.category.upsert({
        where: {
          slug: categoryData.slug,
        },

        update: {},

        create: {
          name: categoryData.name,
          slug: categoryData.slug,
        },
      });

    console.log(
      `✅ Category: ${category.name}`
    );

    for (const subcategoryName of categoryData.subcategories) {
      const subcategorySlug =
        slugify(subcategoryName);

      await prisma.subcategory.upsert({
        where: {
          slug_categoryId: {
            slug: subcategorySlug,
            categoryId: category.id,
          },
        },

        update: {},

        create: {
          name: subcategoryName,
          slug: subcategorySlug,
          categoryId: category.id,
        },
      });

      console.log(
        `   ↳ Subcategory: ${subcategoryName}`
      );
    }
  }

  console.log(
    '🎉 Categories seeded successfully'
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });