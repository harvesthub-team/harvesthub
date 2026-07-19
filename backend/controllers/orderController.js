const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Restore product stock when an order is cancelled
const restoreOrderStock = async (order) => {
  const restoreOperations = order.items.map((item) =>
    Product.findByIdAndUpdate(item.productId, {
      $inc: { quantity: item.quantity },
      $set: { isAvailable: true }
    })
  );

  await Promise.all(restoreOperations);
};

// Create orders using actual product data from MongoDB
const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = 'cash_on_delivery'
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.district
    ) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required'
      });
    }

    if (paymentMethod !== 'cash_on_delivery') {
      return res.status(400).json({
        success: false,
        message: 'Only cash on delivery is currently supported'
      });
    }

    /*
      Combine duplicate products.

      Example:
      Product A quantity 1
      Product A quantity 2

      Becomes:
      Product A quantity 3
    */
    const requestedProductMap = new Map();

    for (const item of items) {
      if (
        !item.productId ||
        !mongoose.Types.ObjectId.isValid(item.productId)
      ) {
        return res.status(400).json({
          success: false,
          message: 'A valid product ID is required for every item'
        });
      }

      const requestedQuantity = Number(item.quantity);

      if (
        !Number.isInteger(requestedQuantity) ||
        requestedQuantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: 'Product quantity must be a positive whole number'
        });
      }

      const productId = item.productId.toString();

      requestedProductMap.set(
        productId,
        (requestedProductMap.get(productId) || 0) + requestedQuantity
      );
    }

    const requestedItems = Array.from(
      requestedProductMap,
      ([productId, quantity]) => ({
        productId,
        quantity
      })
    );

    const productIds = requestedItems.map((item) => item.productId);

    const products = await Product.find({
      _id: { $in: productIds }
    });

    if (products.length !== requestedItems.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more selected products were not found'
      });
    }

    const productMap = new Map(
      products.map((product) => [
        product._id.toString(),
        product
      ])
    );

    /*
      One cart can contain products belonging to multiple farmers.

      The backend groups products by farmer and creates a separate
      Order document for each farmer.
    */
    const farmerOrderMap = new Map();

    for (const requestedItem of requestedItems) {
      const product = productMap.get(requestedItem.productId);

      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is currently unavailable`
        });
      }

      if (product.quantity < requestedItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.quantity} ${product.unit} of ${product.name} is available`
        });
      }

      const farmerId = product.farmerId.toString();

      if (!farmerOrderMap.has(farmerId)) {
        farmerOrderMap.set(farmerId, {
          farmerId,
          items: [],
          totalAmount: 0
        });
      }

      const subtotal =
        product.pricePerUnit * requestedItem.quantity;

      const farmerOrder = farmerOrderMap.get(farmerId);

      farmerOrder.items.push({
        productId: product._id,
        productName: product.name,
        pricePerUnit: product.pricePerUnit,
        unit: product.unit,
        quantity: requestedItem.quantity,
        subtotal,
        image:
          Array.isArray(product.images) &&
          product.images.length > 0
            ? product.images[0]
            : ''
      });

      farmerOrder.totalAmount += subtotal;
    }

    /*
      Reduce actual stock from MongoDB.

      This happens only after all products and quantities have
      been validated.
    */
    for (const requestedItem of requestedItems) {
      const product = productMap.get(requestedItem.productId);

      product.quantity -= requestedItem.quantity;

      if (product.quantity === 0) {
        product.isAvailable = false;
      }

      await product.save();
    }

    const orderDocuments = Array.from(
      farmerOrderMap.values()
    ).map((farmerOrder) => ({
      buyerId: req.user.id,
      farmerId: farmerOrder.farmerId,
      items: farmerOrder.items,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        district: shippingAddress.district
      },
      paymentMethod,
      totalAmount: farmerOrder.totalAmount
    }));

    const createdOrders = await Order.insertMany(orderDocuments);

    res.status(201).json({
      success: true,
      data: createdOrders,
      message:
        createdOrders.length === 1
          ? 'Order placed successfully'
          : `${createdOrders.length} orders placed successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get orders belonging to the logged-in buyer
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      buyerId: req.user.id
    })
      .populate(
        'farmerId',
        'fullName email phone district'
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
      message: 'Buyer orders retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get incoming orders belonging to the logged-in farmer
const getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      farmerId: req.user.id
    })
      .populate(
        'buyerId',
        'fullName email phone district'
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
      message: 'Farmer orders retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get one order
const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const isBuyer =
      order.buyerId.toString() === req.user.id;

    const isFarmer =
      order.farmerId.toString() === req.user.id;

    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isFarmer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to view this order'
      });
    }

    await order.populate([
      {
        path: 'buyerId',
        select: 'fullName email phone district'
      },
      {
        path: 'farmerId',
        select: 'fullName email phone district'
      }
    ]);

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Farmer updates the status of their own order
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.farmerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You cannot update this order'
      });
    }

    const allowedTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: []
    };

    if (
      !status ||
      !allowedTransitions[order.status].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order status from ${order.status} to ${status}`
      });
    }

    if (status === 'cancelled') {
      await restoreOrderStock(order);
    }

    order.status = status;

    order.statusHistory.push({
      status,
      changedAt: new Date()
    });

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Buyer cancels their own pending order
const cancelOrder = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.buyerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You cannot cancel this order'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be cancelled'
      });
    }

    await restoreOrderStock(order);

    order.status = 'cancelled';

    order.statusHistory.push({
      status: 'cancelled',
      changedAt: new Date()
    });

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getFarmerOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};