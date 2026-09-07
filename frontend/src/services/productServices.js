import api from './api';

// ===== CATEGORIES =====
export const categories = [
  'Vegetables',
  'Fruits',
  'Grains & Rice',
  'Spices & Herbs',
  'Livestock Products',
  'Aquaculture',
  'Plantation Crops',
  'Organic & Other'
];

export const districts = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Kurunegala', 'Matale', 'Badulla', 'Matara', 'Polonnaruwa', 'Ampara'];

// ===== GET PRODUCTS =====
export const getProducts = async (filters = {}) => {
  try {
    // Build query params
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    // ✅ Use the browse endpoint
    const response = await api.get(`/products/browse?${params.toString()}`);
    
    // Transform response to match frontend expectations
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

// ===== GET PRODUCT BY ID =====
export const getProductById = async (id) => {
  try {
    // ✅ Use the browse endpoint with ID
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

// ===== SEARCH PRODUCTS =====
export const searchProducts = async (query, filters = {}) => {
  try {
    const params = new URLSearchParams({ q: query, ...filters });
    // ✅ Use the search endpoint
    const response = await api.get(`/products/browse/search?${params.toString()}`);
    
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

// ===== GET PRODUCTS BY CATEGORY =====
export const getProductsByCategory = async (category) => {
  try {
    // ✅ Use the category endpoint
    const response = await api.get(`/products/browse/category/${category}`);
    
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
        message: response.data.message || 'Products by category'
      };
    }
    
    return {
      success: false,
      data: [],
      message: 'No products in this category'
    };
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Failed to fetch products'
    };
  }
};