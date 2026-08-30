import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import { cancelOrder, getMyOrders } from "../services/orderService";

import "./MyOrders.css";

/* =========================================
   ORDER STATUS CONSTANTS
========================================= */

const ORDER_STATUSES = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const ACTIVE_STATUSES = ["pending", "confirmed", "processing", "shipped"];

const TRACKING_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

/* =========================================
   HELPERS
========================================= */

const formatCurrency = (amount) =>
  `LKR ${Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatTime = (date) => {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDisplayOrderNumber = (order) => {
  if (!order?._id) {
    return "ORD-PENDING";
  }

  const year = order.createdAt
    ? new Date(order.createdAt).getFullYear()
    : new Date().getFullYear();

  const shortId = order._id.slice(-6).toUpperCase();

  return `ORD-${year}-${shortId}`;
};

const getStatusIndex = (status) => TRACKING_STATUSES.indexOf(status);

/* =========================================
   COMPONENT
========================================= */

export default function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState("all");

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [cancelTarget, setCancelTarget] = useState(null);

  const [isCancelling, setIsCancelling] = useState(false);

  /* =========================================
     LOAD REAL ORDERS
  ========================================= */

  const loadOrders = useCallback(async () => {
    try {
      const response = await getMyOrders();

      setOrders(Array.isArray(response.data) ? response.data : []);

      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to load your orders.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================
     INITIAL PAGE LOAD
  ========================================= */

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, [loadOrders]);

  /* =========================================
     REFRESH
  ========================================= */

  const handleRefresh = async () => {
    setLoading(true);

    setErrorMessage("");

    await loadOrders();
  };

  /* =========================================
     ORDER STATISTICS
  ========================================= */

  const statistics = useMemo(() => {
    return {
      total: orders.length,

      active: orders.filter((order) => ACTIVE_STATUSES.includes(order.status))
        .length,

      delivered: orders.filter((order) => order.status === "delivered").length,

      cancelled: orders.filter((order) => order.status === "cancelled").length,
    };
  }, [orders]);

  /* =========================================
     SEARCH + STATUS FILTER
  ========================================= */

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        selectedStatus === "all" || order.status === selectedStatus;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const orderNumber = getDisplayOrderNumber(order).toLowerCase();

      const farmerName = order.farmerId?.fullName?.toLowerCase() || "";

      const itemNames = Array.isArray(order.items)
        ? order.items
            .map((item) => String(item.productName || "").toLowerCase())
            .join(" ")
        : "";

      return (
        orderNumber.includes(normalizedSearch) ||
        farmerName.includes(normalizedSearch) ||
        itemNames.includes(normalizedSearch)
      );
    });
  }, [orders, selectedStatus, searchTerm]);

  /* =========================================
     CANCEL REAL ORDER
  ========================================= */

  const handleCancelOrder = async () => {
    if (!cancelTarget?._id) {
      return;
    }

    try {
      setIsCancelling(true);

      setErrorMessage("");

      const response = await cancelOrder(cancelTarget._id);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === cancelTarget._id ? response.data : order,
        ),
      );

      setCancelTarget(null);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to cancel this order.",
      );
    } finally {
      setIsCancelling(false);
    }
  };

  /* =========================================
     UI
  ========================================= */

  return (
    <>
      <main className="my-orders-page">
        {/* =================================
            HERO BANNER
        ================================= */}

        <section className="my-orders-hero">
          <div className="my-orders-hero-content">
            <div className="orders-breadcrumb">
              <span>Marketplace</span>

              <span>›</span>

              <strong>My Orders</strong>
            </div>

            <h1>My Orders</h1>

            <p>Track and manage every order from placement to delivery.</p>
          </div>
        </section>

        {/* =================================
            MAIN CONTENT
        ================================= */}

        <div className="my-orders-container">
          {/* =================================
              STATISTICS
          ================================= */}

          <section className="orders-stat-grid">
            {/* TOTAL */}

            <article className="orders-stat-card">
              <div className="orders-stat-icon">
                <ShoppingBag size={26} />
              </div>

              <div>
                <span>Total Orders</span>

                <strong>{statistics.total}</strong>

                <small>All time orders</small>
              </div>
            </article>

            {/* ACTIVE */}

            <article className="orders-stat-card">
              <div className="orders-stat-icon">
                <Clock3 size={26} />
              </div>

              <div>
                <span>Active Orders</span>

                <strong>{statistics.active}</strong>

                <small>In progress</small>
              </div>
            </article>

            {/* DELIVERED */}

            <article className="orders-stat-card">
              <div className="orders-stat-icon">
                <CheckCircle2 size={26} />
              </div>

              <div>
                <span>Delivered</span>

                <strong>{statistics.delivered}</strong>

                <small>Completed</small>
              </div>
            </article>

            {/* CANCELLED */}

            <article className="orders-stat-card">
              <div className="orders-stat-icon">
                <XCircle size={26} />
              </div>

              <div>
                <span>Cancelled</span>

                <strong>{statistics.cancelled}</strong>

                <small>Orders cancelled</small>
              </div>
            </article>
          </section>

          {/* =================================
              ORDERS CARD
          ================================= */}

          <section className="orders-main-card">
            {/* ===============================
                TOOLBAR
            =============================== */}

            <div className="orders-toolbar">
              {/* STATUS FILTERS */}

              <div className="orders-status-tabs">
                {ORDER_STATUSES.map((status) => (
                  <button
                    type="button"
                    key={status}
                    className={
                      selectedStatus === status
                        ? "order-tab order-tab-active"
                        : "order-tab"
                    }
                    onClick={() => setSelectedStatus(status)}
                  >
                    {status === "all"
                      ? "All"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {/* SEARCH + REFRESH */}

              <div className="orders-toolbar-actions">
                <label className="orders-search-box">
                  <Search size={18} />

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by order ID, farmer or item..."
                  />
                </label>

                <button
                  type="button"
                  className="orders-refresh-button"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw
                    size={17}
                    className={loading ? "refresh-spin" : ""}
                  />
                  Refresh
                </button>
              </div>
            </div>

            {/* ===============================
                ERROR
            =============================== */}

            {errorMessage && (
              <div className="orders-error" role="alert">
                {errorMessage}
              </div>
            )}

            {/* ===============================
                LOADING / EMPTY / ORDERS
            =============================== */}

            {loading ? (
              <div className="orders-loading">
                <RefreshCw size={28} className="refresh-spin" />

                <span>Loading your orders...</span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="orders-empty">
                <div className="orders-empty-icon">
                  <Package size={35} />
                </div>

                <h2>No orders found</h2>

                <p>
                  Try changing your filters or continue shopping for fresh
                  produce.
                </p>

                <button type="button" onClick={() => navigate("/products")}>
                  Browse Products
                  <ArrowRight size={17} />
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {filteredOrders.map((order) => {
                  const visibleItems = order.items?.slice(0, 3) || [];

                  const remainingItems = Math.max(
                    0,
                    (order.items?.length || 0) - 3,
                  );

                  const currentStatusIndex = getStatusIndex(order.status);

                  return (
                    <article className="buyer-order-card" key={order._id}>
                      {/* =====================
                            ORDER INFO
                        ===================== */}

                      <div className="buyer-order-info">
                        <h3>Order #{getDisplayOrderNumber(order)}</h3>

                        <div className="order-info-line">
                          <Clock3 size={15} />

                          <span>
                            {formatDate(order.createdAt)}

                            {" • "}

                            {formatTime(order.createdAt)}
                          </span>
                        </div>

                        <div className="order-farmer">
                          <span>Farmer</span>

                          <strong>
                            {order.farmerId?.fullName || "Local Farmer"}
                          </strong>

                          {order.farmerId?.district && (
                            <small>{order.farmerId.district}, Sri Lanka</small>
                          )}
                        </div>
                      </div>

                      {/* =====================
                            PRODUCTS
                        ===================== */}

                      <div className="buyer-order-products">
                        <span className="order-column-label">
                          Ordered items
                        </span>

                        <div className="order-product-preview-list">
                          {visibleItems.map((item, index) => (
                            <div
                              className="order-product-preview"
                              key={`${order._id}-${item.productId || index}`}
                            >
                              <div className="order-product-image">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.productName}
                                  />
                                ) : (
                                  <Package size={22} />
                                )}

                                <span>{item.quantity}</span>
                              </div>

                              <strong>{item.productName}</strong>

                              <small>
                                {item.quantity} {item.unit}
                              </small>
                            </div>
                          ))}

                          {remainingItems > 0 && (
                            <div className="remaining-products">
                              +{remainingItems}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* =====================
                            TOTAL + ADDRESS
                        ===================== */}

                      <div className="buyer-order-summary">
                        <span className="order-column-label">Total Amount</span>

                        <strong className="order-total-amount">
                          {formatCurrency(order.totalAmount)}
                        </strong>

                        <div className="order-address">
                          <span>Delivery Address</span>

                          <div>
                            <MapPin size={15} />

                            <p>
                              {order.shippingAddress?.address ||
                                "Address not available"}

                              <br />

                              {order.shippingAddress?.district || ""}

                              {order.shippingAddress?.district
                                ? ", Sri Lanka"
                                : ""}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* =====================
                            ACTIONS
                        ===================== */}

                      <div className="buyer-order-actions">
                        <span
                          className={`order-status-badge status-${order.status}`}
                        >
                          {order.status}
                        </span>

                        <button
                          type="button"
                          className="view-order-button"
                          onClick={() =>
                            navigate(`/marketplace/my-orders/${order._id}`)
                          }
                        >
                          View details
                          <ArrowRight size={17} />
                        </button>

                        {/* PENDING ONLY */}

                        {order.status === "pending" && (
                          <button
                            type="button"
                            className="cancel-order-button"
                            onClick={() => setCancelTarget(order)}
                          >
                            Cancel order
                            <Trash2 size={17} />
                          </button>
                        )}

                        {/* PROGRESS TRACKER */}

                        {order.status !== "pending" &&
                          order.status !== "cancelled" && (
                            <div className="compact-order-tracker">
                              {TRACKING_STATUSES.map((status, index) => {
                                const complete = index <= currentStatusIndex;

                                return (
                                  <div className="tracker-step" key={status}>
                                    <span
                                      className={
                                        complete
                                          ? "tracker-dot tracker-dot-complete"
                                          : "tracker-dot"
                                      }
                                    >
                                      {complete ? "✓" : ""}
                                    </span>

                                    <small>
                                      {status.charAt(0).toUpperCase() +
                                        status.slice(1)}
                                    </small>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* ===============================
                FOOTER
            =============================== */}

            {!loading && filteredOrders.length > 0 && (
              <footer className="orders-footer">
                Showing {filteredOrders.length} of {orders.length} orders
              </footer>
            )}
          </section>
        </div>
      </main>

      {/* =====================================
          CANCEL ORDER MODAL
      ===================================== */}

      {cancelTarget && (
        <div
          className="cancel-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-order-title"
        >
          <div className="cancel-modal">
            <button
              type="button"
              className="cancel-modal-close"
              onClick={() => setCancelTarget(null)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="cancel-modal-icon">
              <Trash2 size={26} />
            </div>

            <h2 id="cancel-order-title">Cancel Order?</h2>

            <p>
              Are you sure you want to cancel{" "}
              <strong>#{getDisplayOrderNumber(cancelTarget)}</strong>?
            </p>

            <small>
              The reserved product stock will be restored automatically.
            </small>

            <div className="cancel-modal-actions">
              <button
                type="button"
                className="keep-order-button"
                onClick={() => setCancelTarget(null)}
                disabled={isCancelling}
              >
                No, Keep It
              </button>

              <button
                type="button"
                className="confirm-cancel-button"
                onClick={handleCancelOrder}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
