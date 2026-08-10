import { Link } from 'react-router-dom';
import { CalendarDays, UserRound, MapPin } from 'lucide-react';
import './OrderCard.css';

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-LK')}`;
}

function formatDate(value) {
  return new Date(value).toLocaleString();
}

export default function OrderCard({
  order,
  mode = 'buyer',
  onCancel,
  onStatusChange,
  busy = false,
}) {
  const contact = mode === 'farmer' ? order.buyerId : order.farmerId;

  const nextStatusByCurrent = {
    pending: 'confirmed',
    confirmed: 'processing',
    processing: 'shipped',
    shipped: 'delivered',
  };

  const actionLabelByStatus = {
    pending: 'Confirm order',
    confirmed: 'Start processing',
    processing: 'Mark as shipped',
    shipped: 'Mark as delivered',
  };

  const nextStatus = nextStatusByCurrent[order.status];

  return (
    <article className="order-card">
      <div className="order-card__top">
        <div>
          <span className="order-card__eyebrow">Order</span>
          <h3>#{String(order._id).slice(-8).toUpperCase()}</h3>
        </div>
        <span className={`order-status order-status--${order.status}`}>
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      <div className="order-card__meta">
        <span><CalendarDays size={16} /> {formatDate(order.createdAt)}</span>
        <span><UserRound size={16} /> {contact?.fullName || 'User'}</span>
        <span><MapPin size={16} /> {order.shippingAddress?.district || '-'}</span>
      </div>

      <div className="order-card__items">
        {order.items?.slice(0, 3).map((item) => (
          <div className="order-card__item" key={item.productId}>
            <div>
              <strong>{item.productName}</strong>
              <span>
                {item.quantity} {item.unit} × {formatMoney(item.pricePerUnit)}
              </span>
            </div>
            <strong>{formatMoney(item.subtotal)}</strong>
          </div>
        ))}
        {order.items?.length > 3 && (
          <span className="order-card__more">
            +{order.items.length - 3} more item(s)
          </span>
        )}
      </div>

      <div className="order-card__bottom">
        <div>
          <span className="order-card__total-label">Total</span>
          <strong className="order-card__total">
            {formatMoney(order.totalAmount)}
          </strong>
        </div>

        <div className="order-card__actions">
          <Link to={`/orders/${order._id}`} className="order-btn order-btn--outline">
            View details
          </Link>

          {mode === 'buyer' && order.status === 'pending' && (
            <button
              type="button"
              className="order-btn order-btn--danger"
              onClick={() => onCancel?.(order._id)}
              disabled={busy}
            >
              Cancel
            </button>
          )}

          {mode === 'farmer' && nextStatus && (
            <button
              type="button"
              className="order-btn order-btn--primary"
              onClick={() => onStatusChange?.(order._id, nextStatus)}
              disabled={busy}
            >
              {actionLabelByStatus[order.status]}
            </button>
          )}

          {mode === 'farmer' &&
            ['pending', 'confirmed'].includes(order.status) && (
              <button
                type="button"
                className="order-btn order-btn--danger"
                onClick={() => onStatusChange?.(order._id, 'cancelled')}
                disabled={busy}
              >
                Cancel order
              </button>
            )}
        </div>
      </div>
    </article>
  );
}
