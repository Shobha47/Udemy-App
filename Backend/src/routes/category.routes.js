const express = require('express');
const router = express.Router();

const { getAllCategories, createCategory, createSubcategory, deleteCategory, getAllSubcategories } = require('../controllers/category.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createCategorySchema, createSubcategorySchema } = require('../validators');

// Public
router.get('/', getAllCategories);

// SuperAdmin only
router.post('/', authenticate, authorize('SUPERADMIN'), validate(createCategorySchema), createCategory);
router.post('/subcategory', authenticate, authorize('SUPERADMIN'), validate(createSubcategorySchema), createSubcategory);
router.delete('/:id', authenticate, authorize('SUPERADMIN'), deleteCategory);

module.exports = router;
