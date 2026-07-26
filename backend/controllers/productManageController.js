const Product = require('../models/Product');

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Farmer only)
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      pricePerUnit,
      unit,
      quantity,
      district,
      description
    } = req.body;

    const farmerId = req.user.id;

    // Get image URLs from uploaded files
    const images = req.files ? req.files.map(file => file.path) : [];

    // Create product
    const product = await Product.create({
      farmerId,
      name,
      category,
      pricePerUnit,
      unit,
      quantity,
      images,
      district,
      description
    });

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products for a farmer
// @route   GET /api/products/my-products
// @access  Private (Farmer only)
const getMyProducts = async (req, res, next) => {
  try {
    const farmerId = req.user.id;
    
    const products = await Product.find({ farmerId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Farmer only - owner of product)
const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const farmerId = req.user.id;
    const updates = req.body;

    // Find product and check ownership
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if farmer owns this product
    if (product.farmerId.toString() !== farmerId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // If new images uploaded, add them
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      updates.images = [...product.images, ...newImages];
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Farmer only - owner of product)
const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const farmerId = req.user.id;

    // Find product and check ownership
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if farmer owns this product
    if (product.farmerId.toString() !== farmerId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product availability
// @route   PATCH /api/products/:id/toggle
// @access  Private (Farmer only - owner of product)
const toggleProductAvailability = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const farmerId = req.user.id;

    // Find product and check ownership
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if farmer owns this product
    if (product.farmerId.toString() !== farmerId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Toggle availability
    product.isAvailable = !product.isAvailable;
    await product.save();

    res.status(200).json({
      success: true,
      data: product,
      message: `Product ${product.isAvailable ? 'available' : 'unavailable'}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmerId', 'fullName email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
  getProductById
};