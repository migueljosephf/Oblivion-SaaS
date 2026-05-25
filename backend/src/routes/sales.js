const express = require('express');
const router = express.Router();
const {
  getSales,
  getSale,
  createSale,
  cancelSale,
} = require('../controllers/saleController');
const { authenticate, checkSubscription } = require('../middleware/auth');

// All routes are protected
router.get('/', authenticate, checkSubscription, getSales);
router.get('/:id', authenticate, checkSubscription, getSale);
router.post('/', authenticate, checkSubscription, createSale);
router.post('/:id/cancel', authenticate, checkSubscription, cancelSale);

module.exports = router;
