const { body, validationResult } = require('express-validator');

/**
 * Validation middleware - Check for validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Registration validation rules
 */
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  validate,
];

/**
 * Login validation rules
 */
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

/**
 * Business validation rules
 */
const businessValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Business name is required'),
  body('ownerName')
    .trim()
    .notEmpty()
    .withMessage('Owner name is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required'),
  body('businessType')
    .isIn(['COLMADO', 'MINIMARKET', 'TIENDA', 'CAFETERIA', 'SURTIDORA', 'CAR_WASH', 'OTRO'])
    .withMessage('Invalid business type'),
  body('schedule')
    .trim()
    .notEmpty()
    .withMessage('Schedule is required'),
  validate,
];

/**
 * Product validation rules
 */
const productValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('cost')
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('categoryId')
    .notEmpty()
    .withMessage('Category is required'),
  validate,
];

/**
 * Category validation rules
 */
const categoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required'),
  validate,
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  businessValidation,
  productValidation,
  categoryValidation,
};
