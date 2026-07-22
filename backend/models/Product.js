const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Vegetables',
      'Fruits',
      'Grains & Rice',
      'Spices & Herbs',
      'Livestock Products',
      'Aquaculture',
      'Plantation Crops',
      'Organic & Other'
    ]
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'litre', 'piece', 'bunch', 'dozen']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  images: {
    type: [String],
    default: []
  },
  district: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true 
});

productSchema.index({ name: 'text', category: 'text', district: 'text' });

module.exports = mongoose.model('Product', productSchema);