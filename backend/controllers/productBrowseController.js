const Product = require('../models/Product');

//  GET ALL PRODUCTS with filtering, sorting, pagination
const getAllProducts = async (req, res, next) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      district,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter - only show available products
    const filter = { isAvailable: true };
    if (category) filter.category = category;
    if (district) filter.district = district;
    
    // Price filter
    if (minPrice || maxPrice) {
      filter.pricePerUnit = {};
      if (minPrice) filter.pricePerUnit.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerUnit.$lte = Number(maxPrice);
    }

    // Sort configuration
    const sortObj = {};
    if (sort === 'price') {
      sortObj.pricePerUnit = order === 'desc' ? -1 : 1;
    } else if (sort === 'name') {
      sortObj.name = order === 'desc' ? -1 : 1;
    } else {
      sortObj.createdAt = order === 'desc' ? -1 : 1;
    }

    // Pagination
    const skip = (page - 1) * limit;
    const limitNum = Number(limit);

    // Execute query with population
    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .populate('farmerId', 'fullName email phone district');

    // Get total count
    const total = await Product.countDocuments(filter);

    // Format response for frontend
    const formattedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.pricePerUnit,
      pricePerUnit: product.pricePerUnit,
      category: product.category,
      quantity: product.quantity,
      unit: product.unit,
      images: product.images,
      farmerId: product.farmerId,
      farmerName: product.farmerId?.fullName || 'Unknown Farmer',
      farmerDistrict: product.farmerId?.district || product.district,
      district: product.district,
      isAvailable: product.isAvailable,
      createdAt: product.createdAt
    }));

    res.status(200).json({
      success: true,
      data: formattedProducts,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      },
      message: 'Products retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

//  GET SINGLE PRODUCT by ID
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmerId', 'fullName email phone district');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const formattedProduct = {
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.pricePerUnit,
      pricePerUnit: product.pricePerUnit,
      category: product.category,
      quantity: product.quantity,
      unit: product.unit,
      images: product.images,
      farmerId: product.farmerId,
      farmerName: product.farmerId?.fullName || 'Unknown Farmer',
      farmerDistrict: product.farmerId?.district || product.district,
      district: product.district,
      isAvailable: product.isAvailable,
      createdAt: product.createdAt
    };

    res.status(200).json({
      success: true,
      data: formattedProduct,
      message: 'Product retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

//  SEARCH PRODUCTS
const searchProducts = async (req, res, next) => {
  try {
    const { q, category, page = 1, limit = 12 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const filter = {
      isAvailable: true,
      $text: { $search: q }
    };
    if (category) filter.category = category;

    const skip = (page - 1) * limit;
    const limitNum = Number(limit);

    const products = await Product.find(filter)
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limitNum)
      .populate('farmerId', 'fullName district');

    const total = await Product.countDocuments(filter);

    const formattedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.pricePerUnit,
      pricePerUnit: product.pricePerUnit,
      category: product.category,
      quantity: product.quantity,
      unit: product.unit,
      images: product.images,
      farmerName: product.farmerId?.fullName || 'Unknown Farmer',
      farmerDistrict: product.farmerId?.district || product.district,
      district: product.district,
      isAvailable: product.isAvailable,
      createdAt: product.createdAt
    }));

    res.status(200).json({
      success: true,
      data: formattedProducts,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      },
      message: `Found ${total} products matching "${q}"`
    });
  } catch (error) {
    next(error);
  }
};

//  GET PRODUCTS BY CATEGORY
const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const filter = { category, isAvailable: true };
    const skip = (page - 1) * limit;
    const limitNum = Number(limit);

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('farmerId', 'fullName district');

    const total = await Product.countDocuments(filter);

    const formattedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.pricePerUnit,
      pricePerUnit: product.pricePerUnit,
      category: product.category,
      quantity: product.quantity,
      unit: product.unit,
      images: product.images,
      farmerName: product.farmerId?.fullName || 'Unknown Farmer',
      farmerDistrict: product.farmerId?.district || product.district,
      district: product.district,
      isAvailable: product.isAvailable,
      createdAt: product.createdAt
    }));

    res.status(200).json({
      success: true,
      data: formattedProducts,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      },
      message: `Products in category: ${category}`
    });
  } catch (error) {
    next(error);
  }
};

//  GET PRODUCTS BY FARMER
const getProductsByFarmer = async (req, res, next) => {
  try {
    const { farmerId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const filter = { farmerId: farmerId, isAvailable: true };
    const skip = (page - 1) * limit;
    const limitNum = Number(limit);

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('farmerId', 'fullName district phone');

    const total = await Product.countDocuments(filter);

    const formattedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.pricePerUnit,
      pricePerUnit: product.pricePerUnit,
      category: product.category,
      quantity: product.quantity,
      unit: product.unit,
      images: product.images,
      farmerName: product.farmerId?.fullName || 'Unknown Farmer',
      farmerDistrict: product.farmerId?.district || product.district,
      district: product.district,
      isAvailable: product.isAvailable,
      createdAt: product.createdAt
    }));

    res.status(200).json({
      success: true,
      data: formattedProducts,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      },
      message: `Products from this farmer`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  getProductsByFarmer
};