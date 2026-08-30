import { useEffect, useMemo, useState } from "react";

import {
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  UserRound,
  X,
} from "lucide-react";

import { getFarmerOrders, updateOrderStatus } from "../services/orderService";

import "./FarmerIncomingOrders.css";

/* =========================================
   STATUS CONFIG
========================================= */

const STATUS_FILTERS = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_FLOW = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

const NEXT_STATUS = {
  pending: {
    status: "confirmed",
    label: "Confirm Order",
  },

  confirmed: {
    status: "processing",
    label: "Start Processing",
  },

  processing: {
    status: "shipped",
    label: "Mark as Shipped",
  },

  shipped: {
    status: "delivered",
    label: "Mark Delivered",
  },
};

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

/* =========================================
   COMPONENT
========================================= */

export default function FarmerIncomingOrders() {
  const [orders, setOrders] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState("all");

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [statusTarget, setStatusTarget] = useState(null);

  const [updatingStatus, setUpdatingStatus] = useState(false);

  /* =========================================
     INITIAL REAL BACKEND LOAD
  ========================================= */

  useEffect(() => {
    let ignore = false;

    getFarmerOrders()
      .then((response) => {
        if (!ignore) {
          setOrders(Array.isArray(response.data) ? response.data : []);

          setErrorMessage("");
        }
      })
      .catch((error) => {
        if (!ignore) {
          setOrders([]);

          setErrorMessage(
            error.response?.data?.message || "Unable to load incoming orders.",
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

  /* =========================================
     REFRESH REAL ORDERS
  ========================================= */

  const handleRefresh = async () => {
    try {
      setLoading(true);

      setErrorMessage("");

      const response = await getFarmerOrders();

      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to load incoming orders.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     STATISTICS
  ========================================= */

  const statistics = useMemo(() => {
    const activeStatuses = ["pending", "confirmed", "processing", "shipped"];

    return {
      total: orders.length,

      pending: orders.filter((order) => order.status === "pending").length,

      active: orders.filter((order) => activeStatuses.includes(order.status))
        .length,

      readyToDeliver: orders.filter((order) => order.status === "shipped")
        .length,
    };
  }, [orders]);

  /* =========================================
     FILTER + SEARCH
  ========================================= */

  const filteredOrders = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        selectedStatus === "all" || order.status === selectedStatus;

      if (!matchesStatus) {
        return false;
      }

      if (!search) {
        return true;
      }

      const orderNumber = getDisplayOrderNumber(order).toLowerCase();

      const buyerName = (
        order.buyerId?.fullName ||
        order.shippingAddress?.fullName ||
        ""
      ).toLowerCase();

      const phone = (order.shippingAddress?.phone || "").toLowerCase();

      const itemNames = Array.isArray(order.items)
        ? order.items
            .map((item) => String(item.productName || "").toLowerCase())
            .join(" ")
        : "";

      return (
        orderNumber.includes(search) ||
        buyerName.includes(search) ||
        phone.includes(search) ||
        itemNames.includes(search)
      );
    });
  }, [orders, selectedStatus, searchTerm]);

  /* =========================================
     REAL STATUS UPDATE
  ========================================= */

  const handleConfirmStatus = async () => {
    if (!statusTarget?.order?._id || !statusTarget?.nextStatus) {
      return;
    }

    try {
      setUpdatingStatus(true);

      setErrorMessage("");

      const response = await updateOrderStatus(
        statusTarget.order._id,
        statusTarget.nextStatus,
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === statusTarget.order._id ? response.data : order,
        ),
      );

      setStatusTarget(null);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to update order status.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <>
      <main className="farmer-orders-page">
        {/* =================================
            HERO
        ================================= */}

        <section className="farmer-orders-hero">
          <div className="farmer-orders-hero-content">
            <div className="farmer-orders-breadcrumb">
              <span>Farmer Dashboard</span>

              <span>›</span>

              <strong>Incoming Orders</strong>
            </div>

            <h1>Incoming Orders</h1>

            <p>Manage customer orders from confirmation to delivery.</p>
          </div>
        </section>

        <div className="farmer-orders-container">
          {/* =================================
              STAT CARDS
          ================================= */}

          <section className="farmer-order-stats">
            {/* TOTAL */}

            <article className="farmer-order-stat-card">
              <div className="farmer-order-stat-icon">
                <ShoppingBag size={25} />
              </div>

              <div>
                <span>Total Orders</span>

                <strong>{statistics.total}</strong>

                <small>All incoming orders</small>
              </div>
            </article>

            {/* PENDING */}

            <article className="farmer-order-stat-card">
              <div className="farmer-order-stat-icon">
                <Clock3 size={25} />
              </div>

              <div>
                <span>Pending</span>

                <strong>{statistics.pending}</strong>

                <small>Needs confirmation</small>
              </div>
            </article>

            {/* ACTIVE */}

            <article className="farmer-order-stat-card">
              <div className="farmer-order-stat-icon">
                <Package size={25} />
              </div>

              <div>
                <span>Active Orders</span>

                <strong>{statistics.active}</strong>

                <small>Currently in progress</small>
              </div>
            </article>

            {/* READY */}

            <article className="farmer-order-stat-card">
              <div className="farmer-order-stat-icon">
                <Truck size={25} />
              </div>

              <div>
                <span>Ready to Deliver</span>

                <strong>{statistics.readyToDeliver}</strong>

                <small>Shipped orders</small>
              </div>
            </article>
          </section>

          {/* =================================
              MAIN CARD
          ================================= */}

          <section className="farmer-orders-main-card">
            {/* =================================
                TOOLBAR
            ================================= */}

            <div className="farmer-orders-toolbar">
              {/* STATUS TABS */}

              <div className="farmer-order-tabs">
                {STATUS_FILTERS.map((status) => (
                  <button
                    type="button"
                    key={status}
                    className={
                      selectedStatus === status
                        ? "farmer-order-tab farmer-order-tab-active"
                        : "farmer-order-tab"
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

              <div className="farmer-orders-toolbar-actions">
                <label className="farmer-order-search">
                  <Search size={18} />

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search order, buyer or product..."
                  />
                </label>

                <button
                  type="button"
                  className="farmer-orders-refresh"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw
                    size={17}
                    className={loading ? "farmer-refresh-spin" : ""}
                  />
                  Refresh
                </button>
              </div>
            </div>

            {/* =================================
                ERROR
            ================================= */}

            {errorMessage && (
              <div className="farmer-orders-error" role="alert">
                {errorMessage}
              </div>
            )}

            {/* =================================
                LOADING / EMPTY / ORDERS
            ================================= */}

            {loading ? (
              <div className="farmer-orders-loading">
                <RefreshCw size={28} className="farmer-refresh-spin" />

                <span>Loading incoming orders...</span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="farmer-orders-empty">
                <div className="farmer-orders-empty-icon">
                  <Package size={36} />
                </div>

                <h2>No incoming orders</h2>

                <p>
                  New customer orders will appear here when they are placed.
                </p>
              </div>
            ) : (
              <div className="farmer-orders-list">
                {filteredOrders.map((order) => {
                  const buyerName =
                    order.buyerId?.fullName ||
                    order.shippingAddress?.fullName ||
                    "Customer";

                  const nextAction = NEXT_STATUS[order.status];

                  const currentIndex = STATUS_FLOW.indexOf(order.status);

                  return (
                    <article className="farmer-order-card" key={order._id}>
                      {/* =====================
                            TOP
                        ===================== */}

                      <div className="farmer-order-card-top">
                        <div>
                          <span className="farmer-order-label">Order</span>

                          <h3>#{getDisplayOrderNumber(order)}</h3>

                          <p>
                            <Clock3 size={14} />

                            {formatDate(order.createdAt)}

                            {" • "}

                            {formatTime(order.createdAt)}
                          </p>
                        </div>

                        <span
                          className={`farmer-status-badge farmer-status-${order.status}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* =====================
                            BODY
                        ===================== */}

                      <div className="farmer-order-card-body">
                        {/* CUSTOMER */}

                        <section className="farmer-order-buyer">
                          <span className="farmer-order-column-title">
                            Customer
                          </span>

                          <div className="farmer-buyer-profile">
                            <div>
                              <UserRound size={20} />
                            </div>

                            <div>
                              <strong>{buyerName}</strong>

                              <span>
                                <Phone size={13} />

                                {order.shippingAddress?.phone ||
                                  "Phone unavailable"}
                              </span>
                            </div>
                          </div>

                          <div className="farmer-delivery-address">
                            <MapPin size={15} />

                            <p>
                              {order.shippingAddress?.address ||
                                "Address unavailable"}

                              <br />

                              {order.shippingAddress?.district || ""}
                            </p>
                          </div>
                        </section>

                        {/* =====================
                              ITEMS
                          ===================== */}

                        <section className="farmer-order-products">
                          <span className="farmer-order-column-title">
                            Order Items
                          </span>

                          <div className="farmer-order-item-list">
                            {order.items?.map((item, index) => (
                              <div
                                className="farmer-order-item"
                                key={item.productId || index}
                              >
                                {/* IMAGE */}

                                <div className="farmer-order-item-image">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.productName}
                                    />
                                  ) : (
                                    <Package size={21} />
                                  )}
                                </div>

                                {/* PRODUCT INFO */}

                                <div>
                                  <strong>{item.productName}</strong>

                                  <span>
                                    {item.quantity} {item.unit}
                                    {" × "}
                                    {formatCurrency(item.pricePerUnit)}
                                  </span>
                                </div>

                                {/* SUBTOTAL */}

                                <strong>{formatCurrency(item.subtotal)}</strong>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* =====================
                              TOTAL
                          ===================== */}

                        <section className="farmer-order-summary">
                          <span className="farmer-order-column-title">
                            Order Total
                          </span>

                          <strong className="farmer-order-total">
                            {formatCurrency(order.totalAmount)}
                          </strong>

                          <span className="farmer-order-payment">
                            Cash on Delivery
                          </span>
                        </section>
                      </div>

                      {/* =====================
                            TRACKER
                        ===================== */}

                      {order.status !== "cancelled" && (
                        <div className="farmer-order-tracker">
                          {STATUS_FLOW.map((status, index) => {
                            const complete = index <= currentIndex;

                            return (
                              <div className="farmer-tracker-step" key={status}>
                                <span
                                  className={
                                    complete
                                      ? "farmer-tracker-dot farmer-tracker-dot-complete"
                                      : "farmer-tracker-dot"
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

                      {/* =====================
                            ACTION
                        ===================== */}

                      <div className="farmer-order-actions">
                        {nextAction ? (
                          <button
                            type="button"
                            className={`farmer-order-primary-action farmer-action-${order.status}`}
                            onClick={() =>
                              setStatusTarget({
                                order,
                                nextStatus: nextAction.status,
                                label: nextAction.label,
                              })
                            }
                          >
                            {order.status === "pending" && (
                              <CheckCircle2 size={18} />
                            )}

                            {order.status === "confirmed" && (
                              <Package size={18} />
                            )}

                            {order.status === "processing" && (
                              <Truck size={18} />
                            )}

                            {order.status === "shipped" && (
                              <CheckCircle2 size={18} />
                            )}

                            {nextAction.label}
                          </button>
                        ) : (
                          <div className="farmer-order-complete-message">
                            <CheckCircle2 size={18} />

                            {order.status === "delivered"
                              ? "Order completed"
                              : "No further action"}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* =====================================
          STATUS CONFIRMATION MODAL
      ===================================== */}

      {statusTarget && (
        <div
          className="farmer-status-modal-overlay"
          role="dialog"
          aria-modal="true"
        >
          <div className="farmer-status-modal">
            <button
              type="button"
              className="farmer-status-modal-close"
              onClick={() => setStatusTarget(null)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="farmer-status-modal-icon">
              <Truck size={27} />
            </div>

            <h2>{statusTarget.label}?</h2>

            <p>
              Update{" "}
              <strong>#{getDisplayOrderNumber(statusTarget.order)}</strong> to{" "}
              <strong>{statusTarget.nextStatus}</strong>?
            </p>

            <small>
              The buyer will see this update in their order tracking timeline.
            </small>

            <div className="farmer-status-modal-actions">
              <button
                type="button"
                className="farmer-status-cancel"
                onClick={() => setStatusTarget(null)}
                disabled={updatingStatus}
              >
                Not Now
              </button>

              <button
                type="button"
                className="farmer-status-confirm"
                onClick={handleConfirmStatus}
                disabled={updatingStatus}
              >
                {updatingStatus ? "Updating..." : statusTarget.label}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
