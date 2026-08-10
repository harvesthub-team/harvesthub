import api from './api';

export async function placeOrder(cartItems, shippingAddress) {
  const payload = {
    items: cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
    shippingAddress,
    paymentMethod: 'cash_on_delivery',
  };

  const response = await api.post('/orders', payload);
  return response.data;
}

export async function getMyOrders() {
  const response = await api.get('/orders/my-orders');
  return response.data;
}

export async function getFarmerOrders() {
  const response = await api.get('/orders/farmer-orders');
  return response.data;
}

export async function getOrderById(orderId) {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
}

export async function cancelBuyerOrder(orderId) {
  const response = await api.patch(`/orders/${orderId}/cancel`);
  return response.data;
}

export async function updateFarmerOrderStatus(orderId, status) {
  const response = await api.patch(`/orders/${orderId}/status`, { status });
  return response.data;
}
