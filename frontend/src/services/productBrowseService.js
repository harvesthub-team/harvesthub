// src/services/productBrowseService.js
import api from './api';

// ✅ CHANGE THIS TO false - Use real backend API
const USE_MOCK = false;

// Simulate network delay (only for mock)
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Format response to match real backend structure
const createApiResponse = (data) => ({
  success: true,
  data: data,
  message: 'Products fetched successfully',
});

/**
 * Fetch all products with optional filters
 */
export const getProducts = async (params = {}) => {
  if (USE_MOCK) {
    await delay(600);
    
    let filtered = [...mockProducts];
    
    // Filter by category
    if (params.category && params.category !== '') {
      filtered = filtered.filter(p => p.category === params.category);
    }
    
    // Filter by search query
    if (params.search && params.search.trim()) {
      const query = params.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.farmerId.farmName.toLowerCase().includes(query)
      );
    }
    
    // Sort
    if (params.sort) {
      switch (params.sort) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        default:
          break;
      }
    }
    
    return createApiResponse(filtered);
  }
  
  // ✅ REAL API CALL - This runs when USE_MOCK = false
  try {
    const response = await api.get('/products/browse', { params });
    
    if (response.data && response.data.success) {
      const products = response.data.data || [];
      // Transform products to match frontend expectations
      const transformedProducts = products.map(product => ({
        _id: product._id,
        name: product.name,
        description: product.description || '',
        price: product.pricePerUnit || product.price || 0,
        pricePerUnit: product.pricePerUnit || product.price || 0,
        quantity: product.quantity || 0,
        unit: product.unit || 'kg',
        category: product.category || '',
        farmerName: product.farmerName || product.farmerId?.fullName || 'Unknown Farmer',
        farmerDistrict: product.district || product.farmerDistrict || '',
        district: product.district || '',
        isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
        organic: product.organic || false,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        images: product.images || [],
        createdAt: product.createdAt || new Date().toISOString(),
        farmerId: product.farmerId || null
      }));
      
      return {
        success: true,
        data: transformedProducts,
        pagination: response.data.pagination || { total: 0, page: 1, pages: 1, limit: 12 },
        message: response.data.message || 'Products fetched successfully'
      };
    }
    
    return {
      success: false,
      data: [],
      message: 'Failed to fetch products'
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Failed to fetch products'
    };
  }
};

/**
 * Fetch a single product by ID
 */
export const getProductById = async (id) => {
  if (USE_MOCK) {
    await delay(400);
    const product = mockProducts.find(p => p._id === id);
    if (!product) {
      return {
        success: false,
        message: 'Product not found',
        data: null,
      };
    }
    return createApiResponse(product);
  }
  
  // ✅ REAL API CALL - Get product by ID
  try {
    const response = await api.get(`/products/browse/${id}`);
    
    if (response.data && response.data.success) {
      const product = response.data.data;
      const transformedProduct = {
        _id: product._id,
        name: product.name,
        description: product.description || '',
        price: product.pricePerUnit || product.price || 0,
        pricePerUnit: product.pricePerUnit || product.price || 0,
        quantity: product.quantity || 0,
        unit: product.unit || 'kg',
        category: product.category || '',
        farmerName: product.farmerName || product.farmerId?.fullName || 'Unknown Farmer',
        farmerDistrict: product.district || product.farmerDistrict || '',
        district: product.district || '',
        isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
        organic: product.organic || false,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        images: product.images || [],
        createdAt: product.createdAt || new Date().toISOString(),
        farmerId: product.farmerId || null
      };
      
      return {
        success: true,
        data: transformedProduct,
        message: 'Product found'
      };
    }
    
    return {
      success: false,
      data: null,
      message: 'Product not found'
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to fetch product'
    };
  }
};

/**
 * Search products by query
 */
export const searchProducts = async (query, params = {}) => {
  if (USE_MOCK) {
    await delay(500);
    const filtered = mockProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );
    return createApiResponse(filtered);
  }
  
  // ✅ REAL API CALL - Search products
  try {
    const response = await api.get('/products/browse/search', { params: { q: query, ...params } });
    
    if (response.data && response.data.success) {
      const products = response.data.data || [];
      const transformedProducts = products.map(product => ({
        _id: product._id,
        name: product.name,
        description: product.description || '',
        price: product.pricePerUnit || product.price || 0,
        pricePerUnit: product.pricePerUnit || product.price || 0,
        quantity: product.quantity || 0,
        unit: product.unit || 'kg',
        category: product.category || '',
        farmerName: product.farmerName || product.farmerId?.fullName || 'Unknown Farmer',
        farmerDistrict: product.district || product.farmerDistrict || '',
        district: product.district || '',
        isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
        organic: product.organic || false,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        images: product.images || [],
        createdAt: product.createdAt || new Date().toISOString(),
        farmerId: product.farmerId || null
      }));
      
      return {
        success: true,
        data: transformedProducts,
        pagination: response.data.pagination || { total: 0, page: 1, pages: 1, limit: 12 },
        message: response.data.message || 'Search results'
      };
    }
    
    return {
      success: false,
      data: [],
      message: 'Search failed'
    };
  } catch (error) {
    console.error('Error searching products:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Search failed'
    };
  }
};