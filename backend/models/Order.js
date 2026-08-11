const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
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


const shippingAddressSchema =
  new mongoose.Schema(
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


const statusHistorySchema =
  new mongoose.Schema(
    {
      status: {
        type: String,

        enum: [
          'pending',
          'confirmed',
          'processing',
          'shipped',
          'delivered',
          'cancelled'
        ],

        required: true
      },

      changedAt: {
        type: Date,
        default: Date.now
      }
    },
    {
      _id: false
    }
  );


const orderSchema =
  new mongoose.Schema(
    {
      orderNumber: {
        type: String,
        unique: true,
        sparse: true,
        index: true
      },

      checkoutId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: 'Checkout',

        default: null
      },

      buyerId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: 'User',

        required: true
      },

      farmerId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: 'User',

        required: true
      },

      items: {
        type: [orderItemSchema],

        required: true,

        validate: {
          validator: function (items) {
            return (
              Array.isArray(items) &&
              items.length > 0
            );
          },

          message:
            'Order must contain at least one item'
        }
      },

      shippingAddress: {
        type: shippingAddressSchema,

        required: true
      },

      itemSubtotal: {
        type: Number,

        min: 0,

        default: 0
      },

      deliveryFee: {
        type: Number,

        min: 0,

        default: 0
      },

      serviceFee: {
        type: Number,

        min: 0,

        default: 0
      },

      discountAmount: {
        type: Number,

        min: 0,

        default: 0
      },

      totalAmount: {
        type: Number,

        required: true,

        min: 0
      },

      paymentMethod: {
        type: String,

        enum: [
          'cash_on_delivery',
          'online'
        ],

        default:
          'cash_on_delivery'
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

      estimatedDeliveryDate: {
        type: Date,

        default: null
      },

      status: {
        type: String,

        enum: [
          'pending',
          'confirmed',
          'processing',
          'shipped',
          'delivered',
          'cancelled'
        ],

        default: 'pending'
      },

      statusHistory: {
        type: [statusHistorySchema],

        default: () => [
          {
            status: 'pending',

            changedAt:
              new Date()
          }
        ]
      }
    },
    {
      timestamps: true
    }
  );


orderSchema.index({
  buyerId: 1,
  createdAt: -1
});

orderSchema.index({
  farmerId: 1,
  createdAt: -1
});


module.exports =
  mongoose.model(
    'Order',
    orderSchema
  );