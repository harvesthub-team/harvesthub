import api from './api';

/* =========================================
   BUYER ORDER SERVICES
========================================= */

export const createOrder = async ({
  items,
  shippingAddress,
}) => {
  const response = await api.post('/orders', {
    items,
    shippingAddress,
    paymentMethod: 'cash_on_delivery',
  });

  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get(
    '/orders/my-orders'
  );

  return response.data;
};

export const getOrderById = async (
  orderId
) => {
  const response = await api.get(
    `/orders/${orderId}`
  );

  return response.data;
};

export const cancelOrder = async (
  orderId
) => {
  const response = await api.patch(
    `/orders/${orderId}/cancel`
  );

  return response.data;
};


/* =========================================
   FARMER ORDER SERVICES
========================================= */

/*
 * Farmer ge incoming orders gannawa
 */
export const getFarmerOrders =
  async () => {
    const response = await api.get(
      '/orders/farmer-orders'
    );

    return response.data;
  };


/*
 * Farmer order status eka update karanawa
 *
 * Possible statuses:
 * confirmed
 * processing
 * shipped
 * delivered
 */
export const updateOrderStatus =
  async (orderId, status) => {
    const response = await api.patch(
      `/orders/${orderId}/status`,
      {
        status,
      }
    );

    return response.data;
  };