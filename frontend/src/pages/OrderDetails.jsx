import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  UserRound,
  Banknote,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import OrderTracker from '../components/OrderTracker';
import { getOrderById } from '../services/orderService';
import './OrderDetails.css';

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-LK')}`;
}

export default function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);

      try {
        const result = await getOrderById(id);
        setOrder(result.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            'Unable to load order details.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <main className="orders-page">
        <section className="orders-shell orders-state">
          Loading order details...
        </section>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="orders-page">
        <section className="orders-shell orders-state">
          <h2>Order unavailable</h2>
          <p>{error || 'Order not found.'}</p>
        </section>
      </main>
    );
  }

  const contact =
    user?.role === 'farmer' ? order.buyerId : order.farmerId;

  const backPath =
    user?.role === 'farmer' ? '/farmer/orders' : '/my-orders';

  return (
    <main className="orders-page">
      <section className="orders-shell">
        <Link to={backPath} className="order-details-back">
          <ArrowLeft size={17} /> Back to orders
        </Link>

        <div className="orders-heading order-details-heading">
          <div>
            <span className="orders-kicker">Order details</span>
            <h1>#{String(order._id).slice(-8).toUpperCase()}</h1>
            <p>Placed {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <span className={`order-status order-status--${order.status}`}>
            {order.status}
          </span>
        </div>

        <section className="order-details-card">
          <h2>Track your order</h2>
          <OrderTracker
            status={order.status}
            statusHistory={order.statusHistory}
          />
        </section>

        <div className="order-details-grid">
          <section className="order-details-card">
            <h2>Items</h2>
            <div className="order-detail-items">
              {order.items.map((item) => (
                <div className="order-detail-item" key={item.productId}>
                  <div className="order-detail-item__image">
                    {item.image ? (
                      <img src={item.image} alt={item.productName} />
                    ) : (
                      <span>{item.quantity}×</span>
                    )}
                  </div>
                  <div>
                    <strong>{item.productName}</strong>
                    <span>
                      {item.quantity} {item.unit} ×{' '}
                      {formatMoney(item.pricePerUnit)}
                    </span>
                  </div>
                  <strong>{formatMoney(item.subtotal)}</strong>
                </div>
              ))}
            </div>

            <div className="order-detail-total">
              <span>Total</span>
              <strong>{formatMoney(order.totalAmount)}</strong>
            </div>
          </section>

          <aside className="order-details-card">
            <h2>Delivery</h2>
            <div className="order-contact-line">
              <UserRound size={17} />
              <span>{order.shippingAddress?.fullName}</span>
            </div>
            <div className="order-contact-line">
              <Phone size={17} />
              <span>{order.shippingAddress?.phone}</span>
            </div>
            <div className="order-contact-line">
              <MapPin size={17} />
              <span>
                {order.shippingAddress?.address},{' '}
                {order.shippingAddress?.district}
              </span>
            </div>

            <h2 className="order-details-subtitle">
              {user?.role === 'farmer' ? 'Buyer' : 'Farmer'}
            </h2>
            <p className="order-details-contact-name">
              {contact?.fullName || 'User'}
            </p>
            {contact?.phone && <p>{contact.phone}</p>}
            {contact?.district && <p>{contact.district}</p>}

            <h2 className="order-details-subtitle">Payment</h2>
            <div className="order-payment-pill">
              <Banknote size={18} />
              Cash on Delivery
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
