const crypto = require('crypto');
const mongoose = require('mongoose');

const Product = require('../models/Product');
const Order = require('../models/Order');
const Checkout = require('../models/Checkout');
const PromoCode = require('../models/PromoCode');

const {
  calculateCheckoutPricing
} = require('./pricingService');

const {
  validatePromoCode
} = require('./promoService');

const createServiceError = (
  message,
  status = 400
) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const generateReference = (
  prefix
) => {
  const year =
    new Date().getFullYear();

  const timePart =
    Date.now()
      .toString()
      .slice(-6);

  const randomPart =
    crypto
      .randomBytes(3)
      .toString('hex')
      .toUpperCase();

  return `${prefix}-${year}-${timePart}${randomPart}`;
};

const generateCheckoutNumber = () => {
  return generateReference('CHK');
};

const generateOrderNumber = () => {
  return generateReference('ORD');
};

const validateShippingAddress = (
  shippingAddress
) => {
  if (
    !shippingAddress ||
    !shippingAddress.fullName ||
    !shippingAddress.phone ||
    !shippingAddress.address ||
    !shippingAddress.district
  ) {
    throw createServiceError(
      'Complete shipping address is required'
    );
  }

  return {
    fullName:
      shippingAddress.fullName.trim(),

    phone:
      shippingAddress.phone.trim(),

    address:
      shippingAddress.address.trim(),

    district:
      shippingAddress.district.trim()
  };
};

const combineRequestedItems = (
  items
) => {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw createServiceError(
      'Checkout must contain at least one item'
    );
  }

  const requestedProductMap =
    new Map();

  for (const item of items) {
    if (
      !item.productId ||
      !mongoose.Types.ObjectId.isValid(
        item.productId
      )
    ) {
      throw createServiceError(
        'A valid product ID is required for every item'
      );
    }

    const quantity =
      Number(item.quantity);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      throw createServiceError(
        'Product quantity must be a positive whole number'
      );
    }

    const productId =
      item.productId.toString();

    requestedProductMap.set(
      productId,

      (
        requestedProductMap.get(
          productId
        ) || 0
      ) + quantity
    );
  }

  return Array.from(
    requestedProductMap,
    ([productId, quantity]) => ({
      productId,
      quantity
    })
  );
};

const buildFarmerGroups = async (
  items
) => {
  const requestedItems =
    combineRequestedItems(items);

  const productIds =
    requestedItems.map(
      (item) => item.productId
    );

  const products =
    await Product.find({
      _id: {
        $in: productIds
      }
    });

  if (
    products.length !==
    requestedItems.length
  ) {
    throw createServiceError(
      'One or more selected products were not found',
      404
    );
  }

  const productMap =
    new Map(
      products.map(
        (product) => [
          product._id.toString(),
          product
        ]
      )
    );

  const farmerGroupMap =
    new Map();

  for (
    const requestedItem
    of requestedItems
  ) {
    const product =
      productMap.get(
        requestedItem.productId
      );

    if (!product.isAvailable) {
      throw createServiceError(
        `${product.name} is currently unavailable`
      );
    }

    if (
      product.quantity <
      requestedItem.quantity
    ) {
      throw createServiceError(
        `Only ${product.quantity} ${product.unit} of ${product.name} is available`
      );
    }

    const farmerId =
      product.farmerId.toString();

    if (
      !farmerGroupMap.has(
        farmerId
      )
    ) {
      farmerGroupMap.set(
        farmerId,
        {
          farmerId:
            product.farmerId,

          originDistrict:
            product.district,

          items: []
        }
      );
    }

    const farmerGroup =
      farmerGroupMap.get(
        farmerId
      );

    const subtotal =
      Number(
        product.pricePerUnit
      ) *
      requestedItem.quantity;

    farmerGroup.items.push({
      productId:
        product._id,

      productName:
        product.name,

      pricePerUnit:
        product.pricePerUnit,

      unit:
        product.unit,

      quantity:
        requestedItem.quantity,

      subtotal,

      image:
        Array.isArray(
          product.images
        ) &&
        product.images.length > 0
          ? product.images[0]
          : ''
    });
  }

  return Array.from(
    farmerGroupMap.values()
  );
};

const prepareCheckout = async ({
  items,
  shippingAddress,
  promoCode = ''
}) => {
  const cleanShippingAddress =
    validateShippingAddress(
      shippingAddress
    );

  const farmerGroups =
    await buildFarmerGroups(
      items
    );

  const rawItemSubtotal =
    farmerGroups.reduce(
      (checkoutTotal, group) =>
        checkoutTotal +
        group.items.reduce(
          (
            farmerTotal,
            item
          ) =>
            farmerTotal +
            Number(
              item.subtotal
            ),
          0
        ),
      0
    );

  let promo = null;
  let discountAmount = 0;

  if (
    promoCode &&
    promoCode.trim()
  ) {
    const promoResult =
      await validatePromoCode({
        code: promoCode,
        itemSubtotal:
          rawItemSubtotal
      });

    if (
      !promoResult.valid
    ) {
      throw createServiceError(
        promoResult.message
      );
    }

    promo =
      promoResult.promo;

    discountAmount =
      promoResult.discountAmount;
  }

  const pricing =
    calculateCheckoutPricing({
      farmerGroups,

      destinationDistrict:
        cleanShippingAddress.district,

      discountType:
        discountAmount > 0
          ? 'fixed'
          : null,

      discountValue:
        discountAmount
    });

  return {
    shippingAddress:
      cleanShippingAddress,

    farmerGroups:
      pricing.orders,

    summary:
      pricing.summary,

    promo
  };
};

const createCheckout = async ({
  buyerId,
  items,
  shippingAddress,
  promoCode = '',
  paymentMethod
}) => {
  if (
    ![
      'cash_on_delivery',
      'online'
    ].includes(
      paymentMethod
    )
  ) {
    throw createServiceError(
      'Invalid payment method'
    );
  }

  const prepared =
    await prepareCheckout({
      items,
      shippingAddress,
      promoCode
    });

  const checkout =
    await Checkout.create({
      checkoutNumber:
        generateCheckoutNumber(),

      buyerId,

      farmerGroups:
        prepared.farmerGroups,

      shippingAddress:
        prepared.shippingAddress,

      itemSubtotal:
        prepared.summary.itemSubtotal,

      deliveryFee:
        prepared.summary.deliveryFee,

      serviceFee:
        prepared.summary.serviceFee,

      discountAmount:
        prepared.summary.discountAmount,

      totalAmount:
        prepared.summary.totalAmount,

      currency: 'LKR',

      promoCode:
        prepared.promo
          ? prepared.promo.code
          : null,

      paymentMethod,

      paymentProvider:
        paymentMethod === 'online'
          ? 'payhere'
          : null,

      paymentStatus:
        'pending',

      checkoutStatus:
        paymentMethod === 'online'
          ? 'payment_pending'
          : 'created'
    });

  return checkout;
};

const createOrdersFromCheckout =
  async (checkoutId) => {
    const existingCheckout =
      await Checkout.findById(
        checkoutId
      );

    if (!existingCheckout) {
      throw createServiceError(
        'Checkout not found',
        404
      );
    }

    /*
      Important for online payment callbacks.

      PayHere can send the same notification
      more than once. If orders already exist,
      do not create duplicate orders or reduce
      stock again.
    */
    if (
      Array.isArray(
        existingCheckout.orderIds
      ) &&
      existingCheckout.orderIds
        .length > 0
    ) {
      return Order.find({
        _id: {
          $in:
            existingCheckout.orderIds
        }
      });
    }

    const session =
      await mongoose.startSession();

    let createdOrders = [];

    try {
      await session.withTransaction(
        async () => {
          const checkout =
            await Checkout.findById(
              checkoutId
            ).session(session);

          if (!checkout) {
            throw createServiceError(
              'Checkout not found',
              404
            );
          }

          if (
            checkout.orderIds.length > 0
          ) {
            createdOrders =
              await Order.find({
                _id: {
                  $in:
                    checkout.orderIds
                }
              }).session(session);

            return;
          }

          const orderDocuments = [];

          for (
            const group
            of checkout.farmerGroups
          ) {
            for (
              const item
              of group.items
            ) {
              const updatedProduct =
                await Product.findOneAndUpdate(
                  {
                    _id:
                      item.productId,

                    isAvailable:
                      true,

                    quantity: {
                      $gte:
                        item.quantity
                    }
                  },

                  {
                    $inc: {
                      quantity:
                        -item.quantity
                    }
                  },

                  {
                    new: true,
                    session
                  }
                );

              if (
                !updatedProduct
              ) {
                throw createServiceError(
                  `${item.productName} does not have enough stock`
                );
              }

              if (
                updatedProduct.quantity ===
                0
              ) {
                updatedProduct.isAvailable =
                  false;

                await updatedProduct.save({
                  session
                });
              }
            }

            orderDocuments.push({
              orderNumber:
                generateOrderNumber(),

              checkoutId:
                checkout._id,

              buyerId:
                checkout.buyerId,

              farmerId:
                group.farmerId,

              items:
                group.items,

              shippingAddress:
                checkout.shippingAddress,

              itemSubtotal:
                group.itemSubtotal,

              deliveryFee:
                group.deliveryFee,

              serviceFee:
                group.serviceFee,

              discountAmount:
                group.discountAmount,

              totalAmount:
                group.totalAmount,

              paymentMethod:
                checkout.paymentMethod,

              paymentStatus:
                checkout.paymentStatus,

              paymentReference:
                checkout.paymentReference,

              estimatedDeliveryDate:
                group.estimatedDeliveryDate,

              status: 'pending'
            });
          }

          createdOrders =
            await Order.insertMany(
              orderDocuments,
              {
                session
              }
            );

          checkout.orderIds =
            createdOrders.map(
              (order) =>
                order._id
            );

          checkout.checkoutStatus =
            'orders_created';

          await checkout.save({
            session
          });

          if (
            checkout.promoCode
          ) {
            await PromoCode.updateOne(
              {
                code:
                  checkout.promoCode
              },

              {
                $inc: {
                  usedCount: 1
                }
              },

              {
                session
              }
            );
          }
        }
      );
    } finally {
      await session.endSession();
    }

    return createdOrders;
  };

const restoreOrderStock =
  async (order) => {
    const restoreOperations =
      order.items.map(
        (item) =>
          Product.findByIdAndUpdate(
            item.productId,

            {
              $inc: {
                quantity:
                  item.quantity
              },

              $set: {
                isAvailable:
                  true
              }
            }
          )
      );

    await Promise.all(
      restoreOperations
    );
  };

module.exports = {
  generateCheckoutNumber,
  generateOrderNumber,

  validateShippingAddress,
  combineRequestedItems,
  buildFarmerGroups,

  prepareCheckout,
  createCheckout,
  createOrdersFromCheckout,

  restoreOrderStock
};