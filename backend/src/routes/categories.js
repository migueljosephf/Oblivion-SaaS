const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { authenticate, checkSubscription } = require('../middleware/auth');
const { categoryValidation } = require('../middleware/validator');

// All routes are protected
router.get('/', authenticate, checkSubscription, getCategories);
router.post('/', authenticate, checkSubscription, categoryValidation, createCategory);
router.put('/:id', authenticate, checkSubscription, updateCategory);
router.delete('/:id', authenticate, checkSubscription, deleteCategory);

module.exports = router;
