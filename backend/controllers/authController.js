const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register User
const registerUser = async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      password, 
      role, 
      phone, 
      district,
      // Farmer-specific fields
      farmName,
      location,
      description
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // ✅ Validate farmer-specific required fields
    if (role === 'farmer') {
      if (!farmName) {
        return res.status(400).json({
          success: false,
          message: 'Farm name is required for farmers'
        });
      }
      if (!location) {
        return res.status(400).json({
          success: false,
          message: 'Location is required for farmers'
        });
      }
      if (!phone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required for farmers'
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || 'buyer',
      phone: phone || '',
      district: district || ''
    });

    // If user is a farmer, create farmer profile
    if (user.role === 'farmer') {
      const farmerProfile = await FarmerProfile.create({
        userId: user._id,
        farmName: farmName,
        location: location,
        district: district || 'Not specified',
        phone: phone, // Phone is now required
        description: description || `${fullName}'s farm on HarvestHub`,
        isVerified: false,
        totalRating: 0,
        reviewCount: 0
      });

      return res.status(201).json({
        success: true,
        data: {
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role
          },
          farmerProfile: {
            id: farmerProfile._id,
            farmName: farmerProfile.farmName,
            location: farmerProfile.location,
            district: farmerProfile.district,
            phone: farmerProfile.phone,
            isVerified: farmerProfile.isVerified
          }
        },
        message: 'Farmer registered successfully with profile created'
      });
    }

    // For buyer/admin, just return user
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      },
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = { registerUser, loginUser };