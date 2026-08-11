const mongoose = require('mongoose');

const checkoutItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },

    productName: {
      type: String,
      required: true
    },

    pricePerUnit: {
      type: Number,
      required: true,
      min: 0
    },

    unit: {
      type: String,
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0
    },

    image: {
      type: String,
      default: ''
    }
  },
  {
    _id: false
  }
);

const farmerGroupSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    originDistrict: {
      type: String,
      required: true,
      trim: true
    },

    items: {
      type: [checkoutItemSchema],
      required: true
    },

    itemSubtotal: {
      type: Number,
      required: true,
      min: 0
    },

    deliveryFee: {
      type: Number,
      required: true,
      min: 0
    },

    serviceFee: {
      type: Number,
      required: true,
      min: 0
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    estimatedDeliveryDate: {
      type: Date,
      default: null
    }
  },
  {
    _id: false
  }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    address: {
      type: String,
      required: true,
      trim: true
    },

    district: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    _id: false
  }
);

const checkoutSchema = new mongoose.Schema(
  {
    checkoutNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },

    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    farmerGroups: {
      type: [farmerGroupSchema],
      required: true,

      validate: {
        validator: function (groups) {
          return (
            Array.isArray(groups) &&
            groups.length > 0
          );
        },

        message:
          'Checkout must contain at least one farmer group'
      }
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true
    },

    itemSubtotal: {
      type: Number,
      required: true,
      min: 0
    },

    deliveryFee: {
      type: Number,
      required: true,
      min: 0
    },

    serviceFee: {
      type: Number,
      required: true,
      min: 0
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: 'LKR',
      enum: ['LKR']
    },

    promoCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true
    },

    paymentMethod: {
      type: String,
      enum: [
        'cash_on_delivery',
        'online'
      ],
      required: true
    },

    paymentProvider: {
      type: String,
      enum: ['payhere'],
      default: null
    },

    paymentStatus: {
      type: String,
      enum: [
        'pending',
        'paid',
        'failed',
        'refunded'
      ],
      default: 'pending'
    },

    paymentReference: {
      type: String,
      default: null
    },

    providerPaymentId: {
      type: String,
      default: null
    },

    checkoutStatus: {
      type: String,

      enum: [
        'created',
        'payment_pending',
        'paid',
        'orders_created',
        'failed',
        'cancelled'
      ],

      default: 'created'
    },

    orderIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      }
    ]
  },
  {
    timestamps: true
  }
);

checkoutSchema.index({
  buyerId: 1,
  createdAt: -1
});

checkoutSchema.index({
  paymentReference: 1
});

module.exports = mongoose.model(
  'Checkout',
  checkoutSchema
);