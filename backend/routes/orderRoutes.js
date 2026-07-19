const express = require('express');

const {
  createOrder,
  getMyOrders,
  getFarmerOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Buyer routes
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['buyer']),
  createOrder
);

router.get(
  '/my-orders',
  authMiddleware,
  roleMiddleware(['buyer']),
  getMyOrders
);

router.patch(
  '/:id/cancel',
  authMiddleware,
  roleMiddleware(['buyer']),
  cancelOrder
);

// Farmer routes
router.get(
  '/farmer-orders',
  authMiddleware,
  roleMiddleware(['farmer']),
  getFarmerOrders
);

router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware(['farmer']),
  updateOrderStatus
);

// Buyer, farmer or admin can access a relevant single order
router.get(
  '/:id',
  authMiddleware,
  getOrderById
);

module.exports = router;