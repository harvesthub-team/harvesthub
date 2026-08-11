const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },

    description: {
      type: String,
      trim: true,
      default: ''
    },

    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0
    },

    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    maximumDiscountAmount: {
      type: Number,
      default: null,
      min: 0
    },

    usageLimit: {
      type: Number,
      default: null,
      min: 1
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },

    startDate: {
      type: Date,
      default: Date.now
    },

    expiryDate: {
      type: Date,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

promoCodeSchema.methods.isValidPromo = function (
  orderAmount
) {
  const now = new Date();

  if (!this.isActive) {
    return false;
  }

  if (now < this.startDate) {
    return false;
  }

  if (now > this.expiryDate) {
    return false;
  }

  if (
    this.usageLimit !== null &&
    this.usedCount >= this.usageLimit
  ) {
    return false;
  }

  if (
    Number(orderAmount) <
    Number(this.minimumOrderAmount)
  ) {
    return false;
  }

  return true;
};

promoCodeSchema.methods.calculateDiscount =
  function (orderAmount) {
    const amount = Number(orderAmount);

    let discount = 0;

    if (this.discountType === 'percentage') {
      discount =
        amount *
        (Number(this.discountValue) / 100);
    }

    if (this.discountType === 'fixed') {
      discount =
        Number(this.discountValue);
    }

    if (
      this.maximumDiscountAmount !== null &&
      discount >
        Number(this.maximumDiscountAmount)
    ) {
      discount =
        Number(this.maximumDiscountAmount);
    }

    return Math.min(
      Math.round(
        (discount + Number.EPSILON) * 100
      ) / 100,
      amount
    );
  };

module.exports = mongoose.model(
  'PromoCode',
  promoCodeSchema
);