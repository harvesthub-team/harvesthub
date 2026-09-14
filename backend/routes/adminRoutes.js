const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getAllUsers,
  updateUserStatus,
  getAllProducts,
  toggleProductVisibility,
  verifyFarmer,
  getPendingFarmers,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} = require('../controllers/adminController');
const {authMiddleware} = require('../middleware/authMiddleware');
const {roleMiddleware} = require('../middleware/roleMiddleware');

// ALL ADMIN ROUTES REQUIRE AUTHENTICATION AND ADMIN ROLE
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// DASHBOARD & ANALYTICS
router.get('/analytics', getAnalytics);
router.get('/order-stats', getOrderStats);

// USER MANAGEMENT
router.get('/users', getAllUsers);
router.put('/users/:userId/status', updateUserStatus);
router.get('/farmers/pending', getPendingFarmers);
router.put('/farmers/:farmerId/verify', verifyFarmer);

// PRODUCT MANAGEMENT
router.get('/products', getAllProducts);
router.put('/products/:id/visibility', toggleProductVisibility);

// ORDER MANAGEMENT
router.get('/orders', getAllOrders);
router.put('/orders/:orderId/status', updateOrderStatus);

// CATEGORY MANAGEMENT
router.post('/categories', createCategory);
router.get('/categories', getCategories);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;