const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const FarmerProfile = require('../models/FarmerProfile');
const Category = require('../models/Category');

// GET PLATFORM ANALYTICS (Dashboard)
const getAnalytics = async (req, res, next) => {
  try {
    // Get all counts in parallel for better performance
    const [
      totalUsers,
      totalFarmers,
      totalBuyers,
      totalProducts,
      totalOrders,
      totalReviews,
      pendingFarmers,
      totalCategories
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'buyer' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Review.countDocuments(),
      FarmerProfile.countDocuments({ isVerified: false }),
      Category.countDocuments()
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentUsers, recentOrders, recentReviews] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Review.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    ]);

    // Order status breakdown
    const orderStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Total revenue
    const revenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalFarmers,
          totalBuyers,
          totalProducts,
          totalOrders,
          totalReviews,
          totalCategories,
          pendingFarmers
        },
        recentActivity: {
          recentUsers,
          recentOrders,
          recentReviews
        },
        orderStatus,
        totalRevenue: revenue[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL USERS (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments()
    ]);

    // Get farmer verification status for each user
    const usersWithStatus = await Promise.all(users.map(async (user) => {
      if (user.role === 'farmer') {
        const profile = await FarmerProfile.findOne({ userId: user._id });
        return {
          ...user.toObject(),
          isVerified: profile ? profile.isVerified : false,
          farmName: profile ? profile.farmName : null
        };
      }
      return user;
    }));

    res.status(200).json({
      success: true,
      data: {
        users: usersWithStatus,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE USER STATUS (Suspend/Activate)
const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // Validate input
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean (true or false)'
      });
    }

    // Don't allow admin to suspend themselves
    const userToUpdate = await User.findById(userId);
    if (userToUpdate.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot suspend an admin user'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: `User ${isActive ? 'activated' : 'suspended'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL PRODUCTS (Admin)
const getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find()
        .populate('farmerId', 'fullName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// TOGGLE PRODUCT VISIBILITY (Admin)
const toggleProductVisibility = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    res.status(200).json({
      success: true,
      data: product,
      message: `Product ${product.isAvailable ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// VERIFY FARMER (Admin)
const verifyFarmer = async (req, res, next) => {
  try {
    const { farmerId } = req.params;
    const { isVerified } = req.body;

    // Validate input
    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isVerified must be a boolean (true or false)'
      });
    }

    const farmerProfile = await FarmerProfile.findOne({ userId: farmerId });
    if (!farmerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }

    farmerProfile.isVerified = isVerified;
    await farmerProfile.save();

    res.status(200).json({
      success: true,
      data: farmerProfile,
      message: `Farmer ${isVerified ? 'verified' : 'unverified'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// GET PENDING FARMERS (Admin)
const getPendingFarmers = async (req, res, next) => {
  try {
    const pendingFarmers = await FarmerProfile.find({ isVerified: false })
      .populate('userId', 'fullName email phone district createdAt')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: pendingFarmers
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL ORDERS (Admin)
const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find()
        .populate('buyerId', 'fullName email phone')
        .populate('farmerId', 'fullName email phone')
        .populate('items.productId', 'name pricePerUnit')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE ORDER STATUS (Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'accepted', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, accepted, delivered, cancelled'
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('buyerId', 'fullName email')
     .populate('farmerId', 'fullName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    next(error);
  }
};

// GET ORDER STATISTICS (Admin)
const getOrderStats = async (req, res, next) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalPrice' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// CREATE CATEGORY (Admin)
const createCategory = async (req, res, next) => {
  try {
    const { name, icon, description } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    const category = await Category.create({ name, icon, description });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL CATEGORIES (Admin)
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE CATEGORY (Admin)
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, icon, description, isActive } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name, icon, description, isActive },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// DELETE CATEGORY (Admin)
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};