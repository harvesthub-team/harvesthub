const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  getProductsByFarmer
} = require('../controllers/productBrowseController');

// ⚠️ ORDER MATTERS! Specific routes BEFORE generic :id

// 1️⃣ SPECIFIC ROUTES (no :id parameter)
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/farmer/:farmerId', getProductsByFarmer);

// 2️⃣ BASE ROUTE
router.get('/', getAllProducts);

// 3️⃣ GENERIC ROUTE (MUST BE LAST!)
router.get('/:id', getProductById);

module.exports = router;