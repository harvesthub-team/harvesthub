import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock3,
  CircleCheckBig,
  CircleX,
  Search,
  RefreshCw,
  CalendarDays,
  MapPin,
  Store,
  ArrowRight,
  Trash2,
} from 'lucide-react';

import OrderTracker from '../components/OrderTracker';
import {
  cancelBuyerOrder,
  getMyOrders,
} from '../services/orderService';

import './MyOrders.css';

const FILTERS = [
  'all',
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

function formatMoney(value) {
  return `LKR ${Number(value || 0).toLocaleString('en-LK')}`;
}

function formatDate(value) {
  if (!value) return '-';

  return new Date(value).toLocaleString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function shortOrderId(id) {
  if (!id) return 'ORDER';

  return `ORD-${String(id).slice(-8).toUpperCase()}`;
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [busyOrderId, setBusyOrderId] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [page, setPage] = useState(1);

  const pageSize = 4;

  const loadOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await getMyOrders();
      setOrders(result.data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to load your orders.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    getMyOrders()
      .then((result) => {
        if (!ignore) {
          setOrders(result.data || []);
        }
      })
      .catch((requestError) => {
        if (!ignore) {
          setError(
            requestError.response?.data?.message ||
              'Unable to load your orders.'
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const stats = useMemo(() => {
    const activeStatuses = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
    ];

    return {
      total: orders.length,

      active: orders.filter((order) =>
        activeStatuses.includes(order.status)
      ).length,

      delivered: orders.filter(
        (order) => order.status === 'delivered'
      ).length,

      cancelled: orders.filter(
        (order) => order.status === 'cancelled'
      ).length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        filter === 'all' || order.status === filter;

      const searchableText = [
        order._id,
        order.farmerId?.fullName,
        order.farmerId?.district,
        ...(order.items || []).map(
          (item) => item.productName
        ),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [orders, filter, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / pageSize)
  );

  const paginatedOrders = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleFilter = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleCancel = async (orderId) => {
    const confirmed = window.confirm(
      'Cancel this pending order? Product stock will be restored.'
    );

    if (!confirmed) return;

    setBusyOrderId(orderId);
    setError('');
    setSuccess('');

    try {
      const result = await cancelBuyerOrder(orderId);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: result.data.status,
                statusHistory:
                  result.data.statusHistory,
                updatedAt: result.data.updatedAt,
              }
            : order
        )
      );

      setSuccess(
        result.message ||
          'Order cancelled successfully.'
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to cancel this order.'
      );
    } finally {
      setBusyOrderId('');
    }
  };

  return (
    <main className="my-orders-page">
      <section className="my-orders-container">

        <div className="my-orders-header">
          <div>
            <h1>My Orders</h1>
            <p>
              Track and manage every order from placement
              to delivery.
            </p>
          </div>
        </div>

        <div className="orders-stats-grid">
          <div className="orders-stat-card">
            <div className="stat-icon">
              <Package size={24} />
            </div>

            <div>
              <span>Total Orders</span>
              <strong>{stats.total}</strong>
              <small>All time orders</small>
            </div>
          </div>

          <div className="orders-stat-card">
            <div className="stat-icon">
              <Clock3 size={24} />
            </div>

            <div>
              <span>Active Orders</span>
              <strong>{stats.active}</strong>
              <small>In progress</small>
            </div>
          </div>

          <div className="orders-stat-card">
            <div className="stat-icon">
              <CircleCheckBig size={24} />
            </div>

            <div>
              <span>Delivered</span>
              <strong>{stats.delivered}</strong>
              <small>Completed orders</small>
            </div>
          </div>

          <div className="orders-stat-card">
            <div className="stat-icon">
              <CircleX size={24} />
            </div>

            <div>
              <span>Cancelled</span>
              <strong>{stats.cancelled}</strong>
              <small>Orders cancelled</small>
            </div>
          </div>
        </div>

        <section className="orders-main-panel">

          <div className="orders-toolbar">
            <div className="orders-filters">
              {FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    filter === item ? 'active' : ''
                  }
                  onClick={() => handleFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="orders-toolbar-right">
              <div className="orders-search">
                <Search size={17} />

                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search order, farmer or item..."
                />
              </div>

              <button
                className="orders-refresh"
                type="button"
                onClick={loadOrders}
                disabled={loading}
              >
                <RefreshCw size={17} />
                Refresh
              </button>
            </div>
          </div>

          {success && (
            <div className="orders-message success">
              {success}
            </div>
          )}

          {error && (
            <div className="orders-message error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="orders-empty">
              Loading orders...
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="orders-empty">
              <Package size={48} />

              <h2>No orders found</h2>

              <p>
                {filter === 'all'
                  ? 'You have not placed any orders yet.'
                  : `You do not have any ${filter} orders.`}
              </p>
            </div>
          ) : (
            <div className="advanced-orders-list">
              {paginatedOrders.map((order) => (
                <article
                  className="advanced-order-row"
                  key={order._id}
                >
                  <div className="order-basic-info">
                    <h3>
                      Order #{shortOrderId(order._id)}
                    </h3>

                    <span>
                      <CalendarDays size={15} />
                      {formatDate(order.createdAt)}
                    </span>

                    <span>
                      <Store size={15} />

                      {order.farmerId?.fullName ||
                        'HarvestHub Farmer'}
                    </span>

                    {order.farmerId?.district && (
                      <span>
                        <MapPin size={15} />
                        {order.farmerId.district}
                      </span>
                    )}

                    <div
                      className={`status-pill status-${order.status}`}
                    >
                      {order.status}
                    </div>
                  </div>

                  <div className="order-products-preview">
                    <span className="order-column-title">
                      Ordered items
                    </span>

                    <div className="order-product-images">
                      {(order.items || [])
                        .slice(0, 3)
                        .map((item) => (
                          <div
                            className="order-product-preview"
                            key={String(item.productId)}
                          >
                            <div className="order-product-image">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.productName}
                                />
                              ) : (
                                <span>
                                  {item.productName
                                    ?.charAt(0)
                                    ?.toUpperCase()}
                                </span>
                              )}

                              <small>
                                {item.quantity}
                              </small>
                            </div>

                            <strong>
                              {item.productName}
                            </strong>

                            <span>
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                        ))}

                      {(order.items?.length || 0) > 3 && (
                        <div className="more-products">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="order-payment-info">
                    <span className="order-column-title">
                      Total Amount
                    </span>

                    <strong>
                      {formatMoney(order.totalAmount)}
                    </strong>

                    <span className="order-column-title address-title">
                      Delivery Address
                    </span>

                    <p>
                      <MapPin size={14} />

                      <span>
                        {order.shippingAddress?.address}
                        {order.shippingAddress?.district
                          ? `, ${order.shippingAddress.district}`
                          : ''}
                      </span>
                    </p>
                  </div>

                  <div className="order-row-actions">
                    <Link
                      to={`/orders/${order._id}`}
                      className="view-order-btn"
                    >
                      View details
                      <ArrowRight size={17} />
                    </Link>

                    {order.status === 'pending' && (
                      <button
                        type="button"
                        className="cancel-order-btn"
                        disabled={
                          busyOrderId === order._id
                        }
                        onClick={() =>
                          handleCancel(order._id)
                        }
                      >
                        <Trash2 size={16} />
                        Cancel order
                      </button>
                    )}

                    {order.status !== 'cancelled' && (
                      <div className="order-mini-tracker">
                        <OrderTracker
                          status={order.status}
                          statusHistory={
                            order.statusHistory || []
                          }
                        />
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading &&
            filteredOrders.length > 0 && (
              <div className="orders-pagination">
                <span>
                  Showing{' '}
                  {(page - 1) * pageSize + 1} -{' '}
                  {Math.min(
                    page * pageSize,
                    filteredOrders.length
                  )}{' '}
                  of {filteredOrders.length}
                </span>

                <div>
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() =>
                      setPage((current) => current - 1)
                    }
                  >
                    ‹
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((number) => (
                    <button
                      type="button"
                      key={number}
                      className={
                        page === number ? 'active' : ''
                      }
                      onClick={() => setPage(number)}
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() =>
                      setPage((current) => current + 1)
                    }
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
        </section>
      </section>
    </main>
  );
}