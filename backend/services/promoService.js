const PromoCode = require('../models/PromoCode');

const normalizePromoCode = (code = '') => {
  return code.toString().trim().toUpperCase();
};

const validatePromoCode = async ({
  code,
  itemSubtotal
}) => {
  const normalizedCode =
    normalizePromoCode(code);

  if (!normalizedCode) {
    return {
      valid: false,
      promo: null,
      discountAmount: 0,
      message: 'Promo code is required'
    };
  }

  const promo = await PromoCode.findOne({
    code: normalizedCode
  });

  if (!promo) {
    return {
      valid: false,
      promo: null,
      discountAmount: 0,
      message: 'Invalid promo code'
    };
  }

  if (!promo.isValidPromo(itemSubtotal)) {
    const now = new Date();

    let message =
      'This promo code is not available';

    if (!promo.isActive) {
      message =
        'This promo code is inactive';
    } else if (now < promo.startDate) {
      message =
        'This promo code is not active yet';
    } else if (now > promo.expiryDate) {
      message =
        'This promo code has expired';
    } else if (
      promo.usageLimit !== null &&
      promo.usedCount >= promo.usageLimit
    ) {
      message =
        'This promo code has reached its usage limit';
    } else if (
      Number(itemSubtotal) <
      Number(promo.minimumOrderAmount)
    ) {
      message =
        `Minimum order amount is LKR ${promo.minimumOrderAmount}`;
    }

    return {
      valid: false,
      promo: null,
      discountAmount: 0,
      message
    };
  }

  const discountAmount =
    promo.calculateDiscount(
      itemSubtotal
    );

  return {
    valid: true,

    promo,

    discountAmount,

    message:
      'Promo code applied successfully'
  };
};

const markPromoAsUsed = async (
  promoId
) => {
  if (!promoId) {
    return null;
  }

  return PromoCode.findByIdAndUpdate(
    promoId,

    {
      $inc: {
        usedCount: 1
      }
    },

    {
      new: true
    }
  );
};

module.exports = {
  normalizePromoCode,
  validatePromoCode,
  markPromoAsUsed
};