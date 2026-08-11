const crypto = require('crypto');

const PAYHERE_STATUS = {
  SUCCESS: '2',
  PENDING: '0',
  CANCELLED: '-1',
  FAILED: '-2',
  CHARGEBACK: '-3'
};

const md5 = (value) => {
  return crypto
    .createHash('md5')
    .update(String(value))
    .digest('hex')
    .toUpperCase();
};

const formatAmount = (amount) => {
  return Number(amount).toFixed(2);
};

const getPayHereConfig = () => {
  const merchantId =
    process.env.PAYHERE_MERCHANT_ID;

  const merchantSecret =
    process.env.PAYHERE_MERCHANT_SECRET;

  const frontendUrl =
    process.env.FRONTEND_URL ||
    'http://localhost:5173';

  const backendPublicUrl =
    process.env.BACKEND_PUBLIC_URL || '';

  if (!merchantId) {
    throw new Error(
      'PAYHERE_MERCHANT_ID is not configured'
    );
  }

  if (!merchantSecret) {
    throw new Error(
      'PAYHERE_MERCHANT_SECRET is not configured'
    );
  }

  return {
    merchantId,
    merchantSecret,
    frontendUrl,
    backendPublicUrl
  };
};

const generatePaymentHash = ({
  orderId,
  amount,
  currency = 'LKR'
}) => {
  const {
    merchantId,
    merchantSecret
  } = getPayHereConfig();

  const formattedAmount =
    formatAmount(amount);

  const hashedSecret =
    md5(merchantSecret);

  return md5(
    merchantId +
      orderId +
      formattedAmount +
      currency +
      hashedSecret
  );
};

const generateNotificationSignature = ({
  merchantId,
  orderId,
  payhereAmount,
  payhereCurrency,
  statusCode
}) => {
  const {
    merchantSecret
  } = getPayHereConfig();

  const hashedSecret =
    md5(merchantSecret);

  return md5(
    merchantId +
      orderId +
      payhereAmount +
      payhereCurrency +
      statusCode +
      hashedSecret
  );
};

const verifyPaymentNotification = ({
  merchant_id,
  order_id,
  payhere_amount,
  payhere_currency,
  status_code,
  md5sig
}) => {
  const {
    merchantId
  } = getPayHereConfig();

  if (
    String(merchant_id) !==
    String(merchantId)
  ) {
    return false;
  }

  const localSignature =
    generateNotificationSignature({
      merchantId: merchant_id,
      orderId: order_id,
      payhereAmount: payhere_amount,
      payhereCurrency:
        payhere_currency,
      statusCode: status_code
    });

  return (
    localSignature ===
    String(md5sig || '').toUpperCase()
  );
};

const mapPayHereStatus = (
  statusCode
) => {
  const code =
    String(statusCode);

  if (
    code ===
    PAYHERE_STATUS.SUCCESS
  ) {
    return 'paid';
  }

  if (
    code ===
    PAYHERE_STATUS.PENDING
  ) {
    return 'pending';
  }

  if (
    code ===
    PAYHERE_STATUS.CHARGEBACK
  ) {
    return 'refunded';
  }

  return 'failed';
};

const buildPayHerePayment = ({
  checkout,
  buyer,
  shippingAddress
}) => {
  const {
    merchantId,
    frontendUrl,
    backendPublicUrl
  } = getPayHereConfig();

  if (!checkout) {
    throw new Error(
      'Checkout is required'
    );
  }

  if (!buyer) {
    throw new Error(
      'Buyer details are required'
    );
  }

  if (!shippingAddress) {
    throw new Error(
      'Shipping address is required'
    );
  }

  const orderId =
    checkout.checkoutNumber;

  const amount =
    formatAmount(
      checkout.totalAmount
    );

  const currency =
    checkout.currency || 'LKR';

  const hash =
    generatePaymentHash({
      orderId,
      amount,
      currency
    });

  const fullName =
    String(
      shippingAddress.fullName ||
      buyer.fullName ||
      ''
    ).trim();

  const nameParts =
    fullName.split(/\s+/);

  const firstName =
    nameParts[0] || 'Customer';

  const lastName =
    nameParts.slice(1).join(' ') ||
    'Customer';

  return {
    sandbox: true,

    merchant_id:
      merchantId,

    return_url:
      `${frontendUrl}/checkout/payment-success`,

    cancel_url:
      `${frontendUrl}/checkout/payment-cancelled`,

    notify_url:
      `${backendPublicUrl}/api/payments/payhere/notify`,

    order_id:
      orderId,

    items:
      `HarvestHub ${orderId}`,

    amount,

    currency,

    hash,

    first_name:
      firstName,

    last_name:
      lastName,

    email:
      buyer.email,

    phone:
      shippingAddress.phone,

    address:
      shippingAddress.address,

    city:
      shippingAddress.district,

    country:
      'Sri Lanka',

    delivery_address:
      shippingAddress.address,

    delivery_city:
      shippingAddress.district,

    delivery_country:
      'Sri Lanka'
  };
};

module.exports = {
  PAYHERE_STATUS,
  formatAmount,
  generatePaymentHash,
  verifyPaymentNotification,
  mapPayHereStatus,
  buildPayHerePayment
};