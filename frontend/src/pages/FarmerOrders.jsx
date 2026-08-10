import { useEffect, useMemo, useState } from 'react';

import {
  ShoppingBag,
  Clock3,
  Truck,
  RefreshCw,
  Search,
  UserRound,
  Phone,
  MapPin,
  CalendarDays,
  Package,
  XCircle,
} from 'lucide-react';

import OrderTracker from '../components/OrderTracker';

import {
  getFarmerOrders,
  updateFarmerOrderStatus,
} from '../services/orderService';

import './FarmerOrders.css';

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
  return `IN-${String(id || '')
    .slice(-8)
    .toUpperCase()}`;
}

const NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};

const BUTTON_LABEL = {
  pending: 'Confirm order',
  confirmed: 'Start processing',
  processing: 'Mark as shipped',
  shipped: 'Mark delivered',
};

export default function FarmerOrders() {
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
      const result = await getFarmerOrders();
      setOrders(result.data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to load incoming orders.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    getFarmerOrders()
      .then((result) => {
        if (!ignore) {
          setOrders(result.data || []);
        }
      })
      .catch((requestError) => {
        if (!ignore) {
          setError(
            requestError.response?.data?.message ||
              'Unable to load incoming orders.'
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
      active: orders.filter((order) =>
        activeStatuses.includes(order.status)
      ).length,

      pending: orders.filter(
        (order) => order.status === 'pending'
      ).length,

      readyToShip: orders.filter(
        (order) => order.status === 'processing'
      ).length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const statusMatch =
        filter === 'all' || order.status === filter;

      const searchableText = [
        order._id,
        order.buyerId?.fullName,
        order.buyerId?.phone,
        order.shippingAddress?.district,
        ...(order.items || []).map(
          (item) => item.productName
        ),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        statusMatch &&
        (!query || searchableText.includes(query))
      );
    });
  }, [orders, filter, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / pageSize)
  );

  const visibleOrders = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleStatusChange = async (
    orderId,
    status
  ) => {
    const message =
      status === 'cancelled'
        ? 'Cancel this order?'
        : `Change this order to ${status}?`;

    if (!window.confirm(message)) return;

    setBusyOrderId(orderId);
    setError('');
    setSuccess('');

    try {
      const result =
        await updateFarmerOrderStatus(
          orderId,
          status
        );

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
          'Order status updated successfully.'
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to update this order.'
      );
    } finally {
      setBusyOrderId('');
    }
  };

  return (
    <main className="farmer-orders-page">
      <section className="farmer-orders-container">

        <header className="farmer-orders-header">
          <h1>Incoming Orders</h1>

          <p>
            Confirm and update buyer orders as produce
            moves toward delivery.
          </p>
        </header>

        <div className="farmer-order-stats">

          <div>
            <span className="farmer-stat-icon">
              <ShoppingBag size={24} />
            </span>

            <section>
              <small>Active</small>
              <strong>{stats.active}</strong>
              <p>Orders to fulfill</p>
            </section>
          </div>

          <div>
            <span className="farmer-stat-icon pending">
              <Clock3 size={24} />
            </span>

            <section>
              <small>Pending</small>
              <strong>{stats.pending}</strong>
              <p>Awaiting confirmation</p>
            </section>
          </div>

          <div>
            <span className="farmer-stat-icon">
              <Truck size={24} />
            </span>

            <section>
              <small>Ready to ship</small>
              <strong>
                {stats.readyToShip}
              </strong>
              <p>Processing complete</p>
            </section>
          </div>
        </div>

        <section className="farmer-orders-panel">

          <div className="farmer-orders-toolbar">

            <div className="farmer-filter-list">
              {FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    filter === item ? 'active' : ''
                  }
                  onClick={() => {
                    setFilter(item);
                    setPage(1);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="farmer-toolbar-right">

              <div className="farmer-order-search">
                <Search size={17} />

                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search order, buyer or item..."
                />
              </div>

              <button
                className="farmer-refresh-btn"
                type="button"
                onClick={loadOrders}
              >
                <RefreshCw size={17} />
                Refresh
              </button>
            </div>
          </div>

          {success && (
            <div className="farmer-order-message success">
              {success}
            </div>
          )}

          {error && (
            <div className="farmer-order-message error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="farmer-orders-empty">
              Loading incoming orders...
            </div>
          ) : visibleOrders.length === 0 ? (
            <div className="farmer-orders-empty">
              <Package size={50} />

              <h2>No incoming orders</h2>

              <p>
                New buyer orders will appear here.
              </p>
            </div>
          ) : (
            <div className="farmer-order-list">

              {visibleOrders.map((order) => {
                const nextStatus =
                  NEXT_STATUS[order.status];

                return (
                  <article
                    className="farmer-order-row"
                    key={order._id}
                  >
                    <div className="farmer-buyer-info">

                      <h3>
                        Order #
                        {shortOrderId(order._id)}
                      </h3>

                      <span>
                        <UserRound size={15} />

                        {order.buyerId?.fullName ||
                          order.shippingAddress
                            ?.fullName ||
                          'Buyer'}
                      </span>

                      <span>
                        <Phone size={15} />

                        {order.buyerId?.phone ||
                          order.shippingAddress
                            ?.phone ||
                          '-'}
                      </span>

                      <span>
                        <MapPin size={15} />

                        {order.shippingAddress
                          ?.district || '-'}
                      </span>

                      <span>
                        <CalendarDays size={15} />

                        {formatDate(
                          order.createdAt
                        )}
                      </span>

                      <div
                        className={`farmer-status status-${order.status}`}
                      >
                        {order.status}
                      </div>
                    </div>

                    <div className="farmer-order-products">
                      <span className="farmer-column-title">
                        Ordered items
                      </span>

                      <div>
                        {(order.items || [])
                          .slice(0, 3)
                          .map((item) => (
                            <section
                              key={String(
                                item.productId
                              )}
                            >
                              <div>
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={
                                      item.productName
                                    }
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

                              <small>
                                {item.quantity}{' '}
                                {item.unit}
                              </small>
                            </section>
                          ))}
                      </div>
                    </div>

                    <div className="farmer-order-total">

                      <span className="farmer-column-title">
                        Total Amount
                      </span>

                      <strong>
                        {formatMoney(
                          order.totalAmount
                        )}
                      </strong>

                      <span className="farmer-column-title address">
                        Delivery Address
                      </span>

                      <p>
                        <MapPin size={14} />

                        <span>
                          {order.shippingAddress
                            ?.address}
                          {order.shippingAddress
                            ?.district
                            ? `, ${order.shippingAddress.district}`
                            : ''}
                        </span>
                      </p>
                    </div>

                    <div className="farmer-order-controls">

                      <div
                        className={`farmer-status status-${order.status}`}
                      >
                        {order.status}
                      </div>

                      {nextStatus && (
                        <button
                          className="farmer-primary-action"
                          type="button"
                          disabled={
                            busyOrderId ===
                            order._id
                          }
                          onClick={() =>
                            handleStatusChange(
                              order._id,
                              nextStatus
                            )
                          }
                        >
                          {BUTTON_LABEL[
                            order.status
                          ]}

                          <ArrowRightIcon />
                        </button>
                      )}

                      {['pending', 'confirmed'].includes(
                        order.status
                      ) && (
                        <button
                          className="farmer-cancel-action"
                          type="button"
                          disabled={
                            busyOrderId ===
                            order._id
                          }
                          onClick={() =>
                            handleStatusChange(
                              order._id,
                              'cancelled'
                            )
                          }
                        >
                          <XCircle size={17} />
                          Cancel order
                        </button>
                      )}

                      {order.status !== 'cancelled' && (
                        <div className="farmer-mini-tracker">
                          <OrderTracker
                            status={order.status}
                            statusHistory={
                              order.statusHistory ||
                              []
                            }
                          />
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading &&
            filteredOrders.length > 0 && (
              <div className="farmer-pagination">

                <span>
                  Showing{' '}
                  {(page - 1) * pageSize + 1}{' '}
                  to{' '}
                  {Math.min(
                    page * pageSize,
                    filteredOrders.length
                  )}{' '}
                  of {filteredOrders.length}{' '}
                  orders
                </span>

                <div>
                  <button
                    disabled={page === 1}
                    onClick={() =>
                      setPage((value) => value - 1)
                    }
                  >
                    ‹
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((number) => (
                    <button
                      key={number}
                      className={
                        page === number
                          ? 'active'
                          : ''
                      }
                      onClick={() =>
                        setPage(number)
                      }
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    disabled={
                      page === totalPages
                    }
                    onClick={() =>
                      setPage((value) => value + 1)
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

function ArrowRightIcon() {
  return <span>→</span>;
}