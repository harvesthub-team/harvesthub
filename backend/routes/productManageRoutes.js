const express = require('express');
const router = express.Router();
const {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
  getProductById
} = require('../controllers/productManageController');
const { authMiddleware }  = require('../middleware/authMiddleware');
const { roleMiddleware }  = require('../middleware/roleMiddleware');
const { uploadMultiple } = require('../middleware/uploadMiddleware');

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Farmer only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('farmer'),
  uploadMultiple,
  createProduct
);

// @route   GET /api/products/my-products
// @desc    Get all products for logged-in farmer
// @access  Private (Farmer only)
router.get(
  '/my-products',
  authMiddleware,
  roleMiddleware('farmer'),
  getMyProducts
);

// @route   GET /api/products/:id
// @desc    Get a single product by ID
// @access  Public
router.get('/:id', getProductById);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Farmer only)
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('farmer'),
  uploadMultiple,
  updateProduct
);

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (Farmer only)
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('farmer'),
  deleteProduct
);

// @route   PATCH /api/products/:id/toggle
// @desc    Toggle product availability
// @access  Private (Farmer only)
router.patch(
  '/:id/toggle',
  authMiddleware,
  roleMiddleware('farmer'),
  toggleProductAvailability
);

module.exports = router;