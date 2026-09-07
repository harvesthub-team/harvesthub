import api from './api';

/**
 * services/productManageService.js — create/read/update/delete side of the
 * Product collection, matching productManageRoutes.js exactly:
 *   POST   /api/products              createProduct
 *   GET    /api/products/my-products  getMyProducts
 *   GET    /api/products/:id          getProductById
 *   PUT    /api/products/:id          updateProduct
 *   DELETE /api/products/:id          deleteProduct
 *   PATCH  /api/products/:id/toggle   toggleProductAvailability
 *
 * Field names here match the real Product.js schema exactly:
 *   name, category, pricePerUnit, unit, quantity, district, description
 * Product docs come back with Mongo's `_id`, not `id`.
 *
 * All responses follow the shared shape: { success, data, message }.
 */

// Category list for the Add/Edit Product forms — matches the `category`
// enum on the backend Product.js schema exactly (by `name`; `slug`/`icon`
// are UI-only and never sent to the API). Moved here from the old
// data/products.js, which has been removed — this is the one place both
// AddProduct.jsx and EditProduct.jsx import it from now.
export const categories = [
  { slug: 'vegetables', name: 'Vegetables', icon: 'Carrot' },
  { slug: 'fruits', name: 'Fruits', icon: 'Apple' },
  { slug: 'grains', name: 'Grains & Rice', icon: 'Wheat' },
  { slug: 'spices', name: 'Spices & Herbs', icon: 'Leaf' },
  { slug: 'livestock', name: 'Livestock Products', icon: 'Egg' },
  { slug: 'aquaculture', name: 'Aquaculture', icon: 'Fish' },
  { slug: 'plantation', name: 'Plantation Crops', icon: 'TreePine' },
  { slug: 'organic', name: 'Organic & Other', icon: 'Flower2' },
];

// Builds the FormData both createProduct and updateProduct send.
function buildProductFormData(fields, files = []) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });
  files.forEach((file) => formData.append('images', file));
  return formData;
}

export async function createProduct(fields, files) {
  // Do NOT set 'Content-Type': 'multipart/form-data' manually — axios/the
  // browser needs to generate the boundary itself.
  const formData = buildProductFormData(fields, files);
  const res = await api.post('/products', formData);
  return res.data; // { success, data: product, message }
}

export async function getMyProducts() {
  const res = await api.get('/products/my-products');
  return res.data; // { success, count, data: [products] }
}

export async function getProductById(id) {
  const res = await api.get(`/products/${id}`);
  return res.data;
}

export async function updateProduct(id, fields, files) {
  const formData = buildProductFormData(fields, files);
  const res = await api.put(`/products/${id}`, formData);
  return res.data;
}

export async function deleteProduct(id) {
  const res = await api.delete(`/products/${id}`);
  return res.data;
}

export async function toggleProductAvailability(id) {
  // Matches PATCH /api/products/:id/toggle — the backend flips
  // isAvailable itself, no body needed.
  const res = await api.patch(`/products/${id}/toggle`);
  return res.data;
}
