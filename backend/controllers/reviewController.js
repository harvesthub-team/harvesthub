const Review = require('../models/Review');
const Order = require('../models/Order');
const FarmerProfile = require('../models/FarmerProfile');

// CREATE A REVIEW (Buyer only)

const createReview = async (req, res, next) => {
  try {
    const { orderId, rating, comment } = req.body;
    const buyerId = req.user.id;

    // Validate input
    if (!orderId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide orderId, rating, and comment'
      });
    }

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify buyer owns this order
    if (order.buyerId.toString() !== buyerId) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own orders'
      });
    }

    // Verify order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'You can only review delivered orders'
      });
    }

    // Check if review already exists for this order
    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this order'
      });
    }

    // Create review
    const review = await Review.create({
      buyerId,
      farmerId: order.farmerId,
      orderId,
      rating,
      comment
    });

    // Update farmer's rating
    await updateFarmerRating(order.farmerId);

    // Populate buyer info for response
    const populatedReview = await Review.findById(review._id)
      .populate('buyerId', 'fullName profileImage')
      .populate('farmerId', 'fullName');

    res.status(201).json({
      success: true,
      data: populatedReview,
      message: 'Review submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};
// UPDATE FARMER RATING (Helper function)
const updateFarmerRating = async (farmerId) => {
  try {
    const allReviews = await Review.find({ farmerId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

    const farmerProfile = await FarmerProfile.findOne({ userId: farmerId });
    if (farmerProfile) {
      farmerProfile.totalRating = averageRating;
      farmerProfile.reviewCount = allReviews.length;
      await farmerProfile.save();
    }
  } catch (error) {
    console.error('Error updating farmer rating:', error);
  }
};

// GET REVIEWS FOR A FARMER
const getFarmerReviews = async (req, res, next) => {
  try {
    const { farmerId } = req.params;

    const reviews = await Review.find({ farmerId })
      .populate('buyerId', 'fullName profileImage')
      .populate('orderId', 'totalPrice createdAt')
      .sort({ createdAt: -1 });

    // Get farmer rating summary
    const farmerProfile = await FarmerProfile.findOne({ userId: farmerId });
    const ratingSummary = {
      averageRating: farmerProfile?.totalRating || 0,
      totalReviews: reviews.length,
      ratingDistribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length
      }
    };

    res.status(200).json({
      success: true,
      data: {
        reviews,
        ratingSummary
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET MY REVIEWS (Buyer)

const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ buyerId: req.user.id })
      .populate('farmerId', 'fullName profileImage')
      .populate('orderId', 'totalPrice createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};


// DELETE REVIEW (Admin only)
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const farmerId = review.farmerId;
    await review.deleteOne();

    // Update farmer's rating after deletion
    await updateFarmerRating(farmerId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// GET REVIEW STATISTICS (Admin)
const getReviewStats = async (req, res, next) => {
  try {
    const totalReviews = await Review.countDocuments();
    const averageRating = await Review.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);

    const ratingDistribution = await Review.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalReviews,
        averageRating: averageRating[0]?.avg || 0,
        ratingDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getFarmerReviews,
  getMyReviews,
  deleteReview,
  getReviewStats,
  updateFarmerRating
};