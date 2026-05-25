const express = require('express');
const router = express.Router();
const {
  getSubscription,
  getPlans,
  createSubscription,
  executeSubscription,
  cancelSubscription,
} = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/plans', getPlans);

// Protected routes
router.get('/', authenticate, getSubscription);
router.post('/create', authenticate, createSubscription);
router.post('/execute', authenticate, executeSubscription);
router.post('/cancel', authenticate, cancelSubscription);

module.exports = router;
