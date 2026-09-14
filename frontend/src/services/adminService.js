import api from "./api";

const adminService = {
  getAnalytics: () => api.get("/admin/analytics"),
  getUsers: (page = 1, limit = 50) =>
    api.get("/admin/users", { params: { page, limit } }),
  getPendingFarmers: () => api.get("/admin/farmers/pending"),
  verifyFarmer: (farmerId, isVerified) =>
    api.put(`/admin/farmers/${farmerId}/verify`, { isVerified }),
  getProducts: (page = 1, limit = 50) =>
    api.get("/admin/products", { params: { page, limit } }),
  toggleProductVisibility: (productId) =>
    api.put(`/admin/products/${productId}/visibility`),
  getOrders: (page = 1, limit = 50) =>
    api.get("/admin/orders", { params: { page, limit } }),
  getCategories: () => api.get("/admin/categories"),
  createCategory: (payload) => api.post("/admin/categories", payload),
  updateCategory: (categoryId, payload) =>
    api.put(`/admin/categories/${categoryId}`, payload),
  deleteCategory: (categoryId) => api.delete(`/admin/categories/${categoryId}`),
};

export default adminService;
