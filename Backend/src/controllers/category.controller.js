const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

async function getAllCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true,

        courses: {
          include: {
            instructor: true,
            subcategory: true,
          },
        },

        _count: {
          select: {
            courses: true,
          },
        },
      },

      orderBy: {
        name: 'asc',
      },
    });
    return successResponse(res, { data: { categories } });
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, slug } = req.body;
    const category = await prisma.category.create({
      data: { name, slug },
    });
    return successResponse(res, { statusCode: 201, message: 'Category created.', data: { category } });
  } catch (error) {
    next(error);
  }
}

async function createSubcategory(req, res, next) {
  try {
    const { name, slug, categoryId } = req.body;
    const sub = await prisma.subcategory.create({
      data: { name, slug, categoryId },
    });
    return successResponse(res, { statusCode: 201, message: 'Subcategory created.', data: { subcategory: sub } });
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    return successResponse(res, { message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
}


module.exports = { getAllCategories, createCategory, createSubcategory, deleteCategory };
