const express = require('express');
const router = express.Router();
const {
  getBusiness,
  updateBusiness,
  getAnalytics,
} = require('../controllers/businessController');
const { authenticate, checkSubscription } = require('../middleware/auth');
const { businessValidation } = require('../middleware/validator');

// All routes are protected
router.get('/', authenticate, checkSubscription, getBusiness);
router.put('/', authenticate, checkSubscription, businessValidation, updateBusiness);
router.get('/analytics', authenticate, checkSubscription, getAnalytics);

module.exports = router;
