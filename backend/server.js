const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const farmerRoutes = require('./routes/farmerRoutes');
const productManageRoutes = require('./routes/productManageRoutes');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

//Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/farmer', farmerRoutes);           
app.use('/api/products', productManageRoutes);   

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Error handling middleware 
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('\n📋 Available Routes:');
  console.log(`  POST   /api/auth/register`);
  console.log(`  POST   /api/auth/login`);
  console.log(`  POST   /api/farmer/profile`);
  console.log(`  GET    /api/farmer/profile`);
  console.log(`  PUT    /api/farmer/profile`);
  console.log(`  POST   /api/products`);
  console.log(`  GET    /api/products/my-products`);
  console.log(`  GET    /api/products/:id`);
  console.log(`  PUT    /api/products/:id`);
  console.log(`  DELETE /api/products/:id`);
  console.log(`  PATCH  /api/products/:id/toggle`);
});