const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
} = require('../controllers/productController');
const { authenticate, checkSubscription } = require('../middleware/auth');
const { productValidation } = require('../middleware/validator');

// All routes are protected
router.get('/', authenticate, checkSubscription, getProducts);
router.get('/:id', authenticate, checkSubscription, getProduct);
router.post('/', authenticate, checkSubscription, productValidation, createProduct);
router.put('/:id', authenticate, checkSubscription, updateProduct);
router.delete('/:id', authenticate, checkSubscription, deleteProduct);
router.post('/:id/adjust-stock', authenticate, checkSubscription, adjustStock);

module.exports = router;
