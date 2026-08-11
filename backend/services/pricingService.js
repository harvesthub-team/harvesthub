const SERVICE_FEE_PERCENT = 2;

const DELIVERY_FEES = {
  SAME_DISTRICT: 400,
  SAME_PROVINCE: 450,
  DIFFERENT_PROVINCE: 550,
  REMOTE_ROUTE: 650
};

const DELIVERY_DAYS = {
  SAME_DISTRICT: 2,
  SAME_PROVINCE: 3,
  DIFFERENT_PROVINCE: 4,
  REMOTE_ROUTE: 5
};

const DISTRICT_PROVINCES = {
  colombo: 'western',
  gampaha: 'western',
  kalutara: 'western',

  kandy: 'central',
  matale: 'central',
  'nuwara eliya': 'central',

  galle: 'southern',
  matara: 'southern',
  hambantota: 'southern',

  jaffna: 'northern',
  kilinochchi: 'northern',
  mannar: 'northern',
  mullaitivu: 'northern',
  vavuniya: 'northern',

  batticaloa: 'eastern',
  ampara: 'eastern',
  trincomalee: 'eastern',

  kurunegala: 'north western',
  puttalam: 'north western',

  anuradhapura: 'north central',
  polonnaruwa: 'north central',

  badulla: 'uva',
  monaragala: 'uva',

  ratnapura: 'sabaragamuwa',
  kegalle: 'sabaragamuwa'
};

const REMOTE_DISTRICTS = new Set([
  'jaffna',
  'kilinochchi',
  'mannar',
  'mullaitivu',
  'vavuniya',
  'batticaloa',
  'ampara',
  'trincomalee',
  'monaragala'
]);

const normalizeDistrict = (district = '') => {
  return district
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
};

const roundMoney = (value) => {
  return Math.round(
    (Number(value) + Number.EPSILON) * 100
  ) / 100;
};

const getProvince = (district) => {
  const normalizedDistrict =
    normalizeDistrict(district);

  return DISTRICT_PROVINCES[normalizedDistrict] || null;
};

const isRemoteRoute = (
  originDistrict,
  destinationDistrict
) => {
  const origin =
    normalizeDistrict(originDistrict);

  const destination =
    normalizeDistrict(destinationDistrict);

  return (
    REMOTE_DISTRICTS.has(origin) ||
    REMOTE_DISTRICTS.has(destination)
  );
};

const getDeliveryCategory = (
  originDistrict,
  destinationDistrict
) => {
  const origin =
    normalizeDistrict(originDistrict);

  const destination =
    normalizeDistrict(destinationDistrict);

  if (!origin || !destination) {
    return 'DIFFERENT_PROVINCE';
  }

  if (origin === destination) {
    return 'SAME_DISTRICT';
  }

  if (
    isRemoteRoute(
      originDistrict,
      destinationDistrict
    )
  ) {
    return 'REMOTE_ROUTE';
  }

  const originProvince =
    getProvince(originDistrict);

  const destinationProvince =
    getProvince(destinationDistrict);

  if (
    originProvince &&
    destinationProvince &&
    originProvince === destinationProvince
  ) {
    return 'SAME_PROVINCE';
  }

  return 'DIFFERENT_PROVINCE';
};

const calculateDeliveryFee = (
  originDistrict,
  destinationDistrict
) => {
  const category =
    getDeliveryCategory(
      originDistrict,
      destinationDistrict
    );

  return DELIVERY_FEES[category];
};

const getEstimatedDeliveryDays = (
  originDistrict,
  destinationDistrict
) => {
  const category =
    getDeliveryCategory(
      originDistrict,
      destinationDistrict
    );

  return DELIVERY_DAYS[category];
};

const getEstimatedDeliveryDate = (
  originDistrict,
  destinationDistrict
) => {
  const days =
    getEstimatedDeliveryDays(
      originDistrict,
      destinationDistrict
    );

  const estimatedDate = new Date();

  estimatedDate.setDate(
    estimatedDate.getDate() + days
  );

  return estimatedDate;
};

const calculateItemSubtotal = (items = []) => {
  return roundMoney(
    items.reduce((total, item) => {
      const price = Number(
        item.pricePerUnit ?? 0
      );

      const quantity = Number(
        item.quantity ?? 0
      );

      return total + price * quantity;
    }, 0)
  );
};

const calculateServiceFee = (
  itemSubtotal
) => {
  return roundMoney(
    Number(itemSubtotal) *
      (SERVICE_FEE_PERCENT / 100)
  );
};

const calculateDiscount = ({
  itemSubtotal,
  discountType = null,
  discountValue = 0
}) => {
  const subtotal =
    Number(itemSubtotal);

  const value =
    Number(discountValue);

  if (
    !discountType ||
    !value ||
    value <= 0
  ) {
    return 0;
  }

  let discount = 0;

  if (discountType === 'percentage') {
    discount =
      subtotal * (value / 100);
  }

  if (discountType === 'fixed') {
    discount = value;
  }

  return roundMoney(
    Math.min(discount, subtotal)
  );
};

const calculateOrderPricing = ({
  items = [],
  originDistrict,
  destinationDistrict,
  discountAmount = 0
}) => {
  const itemSubtotal =
    calculateItemSubtotal(items);

  const deliveryFee =
    calculateDeliveryFee(
      originDistrict,
      destinationDistrict
    );

  const serviceFee =
    calculateServiceFee(itemSubtotal);

  const safeDiscount =
    Math.min(
      Number(discountAmount) || 0,
      itemSubtotal
    );

  const totalAmount =
    roundMoney(
      itemSubtotal +
        deliveryFee +
        serviceFee -
        safeDiscount
    );

  return {
    itemSubtotal,
    deliveryFee,
    serviceFee,
    discountAmount:
      roundMoney(safeDiscount),
    totalAmount,
    estimatedDeliveryDate:
      getEstimatedDeliveryDate(
        originDistrict,
        destinationDistrict
      )
  };
};

const calculateCheckoutPricing = ({
  farmerGroups = [],
  destinationDistrict,
  discountType = null,
  discountValue = 0
}) => {
  const preparedGroups =
    farmerGroups.map((group) => {
      const itemSubtotal =
        calculateItemSubtotal(
          group.items
        );

      const deliveryFee =
        calculateDeliveryFee(
          group.originDistrict,
          destinationDistrict
        );

      const serviceFee =
        calculateServiceFee(
          itemSubtotal
        );

      return {
        ...group,
        itemSubtotal,
        deliveryFee,
        serviceFee,
        estimatedDeliveryDate:
          getEstimatedDeliveryDate(
            group.originDistrict,
            destinationDistrict
          )
      };
    });

  const checkoutItemSubtotal =
    roundMoney(
      preparedGroups.reduce(
        (sum, group) =>
          sum + group.itemSubtotal,
        0
      )
    );

  const checkoutDeliveryFee =
    roundMoney(
      preparedGroups.reduce(
        (sum, group) =>
          sum + group.deliveryFee,
        0
      )
    );

  const checkoutServiceFee =
    roundMoney(
      preparedGroups.reduce(
        (sum, group) =>
          sum + group.serviceFee,
        0
      )
    );

  const checkoutDiscount =
    calculateDiscount({
      itemSubtotal:
        checkoutItemSubtotal,
      discountType,
      discountValue
    });

  let distributedDiscount = 0;

  const pricedGroups =
    preparedGroups.map(
      (group, index) => {
        let groupDiscount = 0;

        if (
          checkoutDiscount > 0 &&
          checkoutItemSubtotal > 0
        ) {
          if (
            index ===
            preparedGroups.length - 1
          ) {
            groupDiscount =
              roundMoney(
                checkoutDiscount -
                  distributedDiscount
              );
          } else {
            groupDiscount =
              roundMoney(
                checkoutDiscount *
                  (
                    group.itemSubtotal /
                    checkoutItemSubtotal
                  )
              );

            distributedDiscount =
              roundMoney(
                distributedDiscount +
                  groupDiscount
              );
          }
        }

        const totalAmount =
          roundMoney(
            group.itemSubtotal +
              group.deliveryFee +
              group.serviceFee -
              groupDiscount
          );

        return {
          ...group,
          discountAmount:
            groupDiscount,
          totalAmount
        };
      }
    );

  const totalAmount =
    roundMoney(
      checkoutItemSubtotal +
        checkoutDeliveryFee +
        checkoutServiceFee -
        checkoutDiscount
    );

  return {
    orders: pricedGroups,

    summary: {
      itemSubtotal:
        checkoutItemSubtotal,

      deliveryFee:
        checkoutDeliveryFee,

      serviceFee:
        checkoutServiceFee,

      discountAmount:
        checkoutDiscount,

      totalAmount,

      currency: 'LKR'
    }
  };
};

module.exports = {
  SERVICE_FEE_PERCENT,
  DELIVERY_FEES,

  normalizeDistrict,
  getProvince,
  getDeliveryCategory,

  calculateDeliveryFee,
  getEstimatedDeliveryDays,
  getEstimatedDeliveryDate,

  calculateItemSubtotal,
  calculateServiceFee,
  calculateDiscount,

  calculateOrderPricing,
  calculateCheckoutPricing
};