const express = require('express');
const router = express.Router();
const {
  createReview,
  getFarmerReviews,
  getMyReviews,
  deleteReview,
  getReviewStats
} = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// ALL ROUTES REQUIRE AUTHENTICATION
router.use(authMiddleware);

// PUBLIC ROUTES (Authenticated users)

// Get reviews for a specific farmer
router.get('/farmer/:farmerId', getFarmerReviews);

// BUYER ONLY ROUTES

// Create a review (Buyer only)
router.post('/', roleMiddleware(['buyer']), createReview);

// Get my reviews (Buyer)
router.get('/my-reviews', roleMiddleware(['buyer']), getMyReviews);

// ADMIN ONLY ROUTES

// Get review statistics (Admin)
router.get('/stats', roleMiddleware(['admin']), getReviewStats);

// Delete a review (Admin only)
router.delete('/:id', roleMiddleware(['admin']), deleteReview);

module.exports = router;