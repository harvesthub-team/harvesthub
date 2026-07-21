const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  getProductsByFarmer
} = require('../controllers/productBrowseController');

// 📍 YOUR ROUTES - All READ operations
router.get('/', getAllProducts);                         // GET /api/products/browse/
router.get('/search', searchProducts);                  // GET /api/products/browse/search?q=apple
router.get('/category/:category', getProductsByCategory); // GET /api/products/browse/category/Vegetables
router.get('/farmer/:farmerId', getProductsByFarmer);   // GET /api/products/browse/farmer/123
router.get('/:id', getProductById);                     // GET /api/products/browse/123

module.exports = router;