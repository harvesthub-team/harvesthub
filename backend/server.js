const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const farmerRoutes = require('./routes/farmerRoutes');
const productManageRoutes = require('./routes/productManageRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ============================================
// ROUTES - IN CORRECT ORDER!
// ============================================

// 1️⃣ AUTH - Kaumini
app.use('/api/auth', require('./routes/authRoutes'));

// 2️⃣ BROWSE ROUTES - Viranja (MUST COME BEFORE /api/products!)
app.use('/api/products/browse', require('./routes/productBrowseRoutes'));

// 3️⃣ FARMER & PRODUCT MANAGEMENT - Zahida
app.use('/api/farmer', farmerRoutes);
app.use('/api/products', productManageRoutes);

// 4️⃣ ORDERS - Hashini
app.use('/api/orders', orderRoutes);

// 5️⃣ REVIEWS - Krishani (YOURS)
app.use('/api/reviews', require('./routes/reviewRoutes'));

// 6️⃣ ADMIN - Krishani (YOURS)
app.use('/api/admin', require('./routes/adminRoutes'));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  
  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', ')
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('\n📋 ALL ROUTES:');
  console.log('\n=== AUTH (Kaumini) ===');
  console.log(`  POST   /api/auth/register`);
  console.log(`  POST   /api/auth/login`);
  console.log('\n=== BROWSE (Viranja) ===');
  console.log(`  GET    /api/products/browse/`);
  console.log(`  GET    /api/products/browse/search`);
  console.log(`  GET    /api/products/browse/category/:category`);
  console.log(`  GET    /api/products/browse/farmer/:farmerId`);
  console.log(`  GET    /api/products/browse/:id`);
  console.log('\n=== FARMER & PRODUCTS (Zahida) ===');
  console.log(`  POST   /api/farmer/profile`);
  console.log(`  GET    /api/farmer/profile`);
  console.log(`  PUT    /api/farmer/profile`);
  console.log(`  POST   /api/products`);
  console.log(`  GET    /api/products/my-products`);
  console.log(`  GET    /api/products/:id`);
  console.log(`  PUT    /api/products/:id`);
  console.log(`  DELETE /api/products/:id`);
  console.log(`  PATCH  /api/products/:id/toggle`);
  console.log('\n=== ORDERS (Hashini) ===');
  console.log(`  POST   /api/orders`);
  console.log(`  GET    /api/orders/my-orders`);
  console.log(`  GET    /api/orders/farmer-orders`);
  console.log(`  GET    /api/orders/:id`);
  console.log(`  PATCH  /api/orders/:id/status`);
  console.log(`  PATCH  /api/orders/:id/cancel`);
  console.log('\n=== REVIEWS (Krishani) ===');
  console.log(`  POST   /api/reviews`);
  console.log(`  GET    /api/reviews/farmer/:farmerId`);
  console.log(`  GET    /api/reviews/my-reviews`);
  console.log(`  GET    /api/reviews/stats`);
  console.log(`  DELETE /api/reviews/:id`);
  console.log('\n=== ADMIN (Krishani) ===');
  console.log(`  GET    /api/admin/analytics`);
  console.log(`  GET    /api/admin/users`);
  console.log(`  PUT    /api/admin/users/:userId/status`);
  console.log(`  GET    /api/admin/farmers/pending`);
  console.log(`  PUT    /api/admin/farmers/:farmerId/verify`);
  console.log(`  GET    /api/admin/products`);
  console.log(`  PUT    /api/admin/products/:id/visibility`);
  console.log(`  GET    /api/admin/orders`);
  console.log(`  PUT    /api/admin/orders/:orderId/status`);
  console.log(`  GET    /api/admin/order-stats`);
  console.log(`  POST   /api/admin/categories`);
  console.log(`  GET    /api/admin/categories`);
  console.log(`  PUT    /api/admin/categories/:id`);
  console.log(`  DELETE /api/admin/categories/:id`);
});