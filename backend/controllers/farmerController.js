const FarmerProfile = require('../models/FarmerProfile');
const User = require('../models/User');

// @desc    Create or update farmer profile
// @route   POST /api/farmer/profile
// @access  Private (Farmer only)
const createFarmerProfile = async (req, res, next) => {
  try {
    const { farmName, location, district, description, phone } = req.body;
    const userId = req.user.id; // From auth middleware

    // Check if farmer profile already exists
    const existingProfile = await FarmerProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Farmer profile already exists for this user'
      });
    }

    // Create farmer profile
    const farmerProfile = await FarmerProfile.create({
      userId,
      farmName,
      location,
      district,
      description,
      phone,
      // If profile image was uploaded, add it
      profileImage: req.file ? req.file.path : ''
    });

    // Update user role to farmer if not already
    await User.findByIdAndUpdate(userId, { role: 'farmer' });

    res.status(201).json({
      success: true,
      data: farmerProfile,
      message: 'Farmer profile created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get farmer profile by user ID
// @route   GET /api/farmer/profile
// @access  Private
const getFarmerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await FarmerProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public farmer profile (for buyers to view)
// @route   GET /api/farmer/profile/:id
// @access  Public
const getPublicFarmerProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await FarmerProfile.findOne({ userId: id })
      .populate('userId', 'fullName email district');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update farmer profile
// @route   PUT /api/farmer/profile
// @access  Private (Farmer only)
const updateFarmerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // If profile image uploaded, add it
    if (req.file) {
      updates.profileImage = req.file.path;
    }

    const updatedProfile = await FarmerProfile.findOneAndUpdate(
      { userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedProfile,
      message: 'Farmer profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFarmerProfile,
  getFarmerProfile,
  getPublicFarmerProfile,
  updateFarmerProfile
};