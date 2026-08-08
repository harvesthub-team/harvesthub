const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
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
  icon: {
    type: String,
    default: '🌾'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('Category', categorySchema);