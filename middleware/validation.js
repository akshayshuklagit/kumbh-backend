const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

const validateSubscriber = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  handleValidationErrors
];

const validateContact = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .isLength({ max: 20 })
    .withMessage('Phone number must be less than 20 characters'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  body('inquiryType')
    .isIn(['general', 'registration', 'speaker', 'exhibitor', 'media', 'sponsorship'])
    .withMessage('Invalid inquiry type'),
  handleValidationErrors
];

const validateEmail = [
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be between 10 and 5000 characters'),
  body('recipients')
    .custom((value) => {
      if (value === 'all' || Array.isArray(value)) {
        return true;
      }
      throw new Error('Recipients must be "all" or an array of emails');
    }),
  handleValidationErrors
];

module.exports = {
  validateSubscriber,
  validateContact,
  validateEmail,
  handleValidationErrors
};