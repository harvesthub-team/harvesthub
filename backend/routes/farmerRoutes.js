const express = require('express');
const router = express.Router();
const {
  createFarmerProfile,
  getFarmerProfile,
  getPublicFarmerProfile,
  updateFarmerProfile
} = require('../controllers/farmerController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

// @route   POST /api/farmer/profile
// @desc    Create farmer profile
// @access  Private (Farmer only)
router.post(
  '/profile',
  authMiddleware,
  roleMiddleware('farmer'),
  uploadSingle,
  createFarmerProfile
);

// @route   GET /api/farmer/profile
// @desc    Get own farmer profile
// @access  Private
router.get(
  '/profile',
  authMiddleware,
  getFarmerProfile
);

// @route   GET /api/farmer/profile/:id
// @desc    Get public farmer profile
// @access  Public
router.get('/profile/:id', getPublicFarmerProfile);

// @route   PUT /api/farmer/profile
// @desc    Update farmer profile
// @access  Private (Farmer only)
router.put(
  '/profile',
  authMiddleware,
  roleMiddleware('farmer'),
  uploadSingle,
  updateFarmerProfile
);

module.exports = router;