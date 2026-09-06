import { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  ShoppingBag,
  Trash2,
  Truck,
  UserRound,
  X,
} from "lucide-react";

import { cancelOrder, getOrderById } from "../services/orderService";

import LiveTrackingDemo from "../components/LiveTrackingDemo";

import "./OrderDetails.css";

/* =========================================
   ORDER STATUS
========================================= */

const TRACKING_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

const STATUS_LABELS = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
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

export default function OrderDetails() {
  const navigate = useNavigate();

  const { orderId } = useParams();

  /* =========================================
     STATE
  ========================================= */

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [showCancelModal, setShowCancelModal] = useState(false);

  const [isCancelling, setIsCancelling] = useState(false);

  const [showLiveTracking, setShowLiveTracking] = useState(false);

  /* =========================================
     LOAD REAL ORDER FROM BACKEND
  ========================================= */

  useEffect(() => {
    let ignore = false;

    getOrderById(orderId)
      .then((response) => {
        if (!ignore) {
          setOrder(response.data);

          setErrorMessage("");
        }
      })
      .catch((error) => {
        if (!ignore) {
          setOrder(null);

          setErrorMessage(
            error.response?.data?.message || "Unable to load this order.",
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
  }, [orderId]);

  /* =========================================
     STATUS HISTORY LOOKUP
  ========================================= */

  const statusHistoryMap = useMemo(() => {
    if (!order?.statusHistory) {
      return {};
    }

    return order.statusHistory.reduce((history, item) => {
      history[item.status] = item.changedAt || item.updatedAt;

      return history;
    }, {});
  }, [order]);

  /* =========================================
     CURRENT STATUS INDEX
  ========================================= */

  const currentStatusIndex = useMemo(() => {
    if (!order) {
      return -1;
    }

    return TRACKING_STATUSES.indexOf(order.status);
  }, [order]);

  /* =========================================
     CANCEL REAL ORDER
  ========================================= */

  const handleCancelOrder = async () => {
    if (!order?._id) {
      return;
    }

    try {
      setIsCancelling(true);

      setErrorMessage("");

      const response = await cancelOrder(order._id);

      setOrder(response.data);

      setShowCancelModal(false);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to cancel this order.",
      );
    } finally {
      setIsCancelling(false);
    }
  };

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <main className="order-details-page">
        <div className="order-details-loading">
          <RefreshCw size={30} className="order-details-spin" />

          <span>Loading order details...</span>
        </div>
      </main>
    );
  }

  /* =========================================
     ORDER NOT FOUND
  ========================================= */

  if (!order) {
    return (
      <main className="order-details-page">
        <div className="order-details-not-found">
          <div className="order-details-not-found-icon">
            <Package size={38} />
          </div>

          <h1>Order not available</h1>

          <p>{errorMessage || "We could not find this order."}</p>

          <button
            type="button"
            onClick={() => navigate("/my-orders")}
          >
            <ArrowLeft size={18} />
            Back to My Orders
          </button>
        </div>
      </main>
    );
  }

  /* =========================================
     ORDER DATA
  ========================================= */

  const farmer = order.farmerId || {};

  const shipping = order.shippingAddress || {};

  return (
    <>
      <main className="order-details-page">
        <div className="order-details-container">
          {/* =================================
              BACK TO MY ORDERS
          ================================= */}

          <button
            type="button"
            className="order-details-back"
            onClick={() => navigate("/my-orders")}
          >
            <ArrowLeft size={18} />
            Back to My Orders
          </button>

          {/* =================================
              TOP ORDER CARD
          ================================= */}

          <section className="order-details-header-card">
            <div className="order-details-title">
              <div>
                <span className="order-details-label">Order</span>

                <h1>#{getDisplayOrderNumber(order)}</h1>

                <p>
                  <CalendarDays size={15} />
                  Placed on {formatDate(order.createdAt)}
                  {" • "}
                  {formatTime(order.createdAt)}
                </p>
              </div>

              <span className={`order-details-status status-${order.status}`}>
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>

            {/* ===============================
                OVERVIEW
            =============================== */}

            <div className="order-details-overview">
              {/* PAYMENT */}

              <article>
                <div className="overview-icon">
                  <CreditCard size={21} />
                </div>

                <div>
                  <span>Payment Method</span>

                  <strong>Cash on Delivery</strong>
                </div>
              </article>

              {/* FARMER */}

              <article>
                <div className="overview-icon">
                  <UserRound size={21} />
                </div>

                <div>
                  <span>Farmer</span>

                  <strong>{farmer.fullName || "Local Farmer"}</strong>

                  {farmer.district && (
                    <small>{farmer.district}, Sri Lanka</small>
                  )}
                </div>
              </article>

              {/* TOTAL */}

              <article>
                <div className="overview-icon">
                  <ShoppingBag size={21} />
                </div>

                <div>
                  <span>Total Amount</span>

                  <strong>{formatCurrency(order.totalAmount)}</strong>
                </div>
              </article>
            </div>
          </section>

          {/* =================================
              ERROR
          ================================= */}

          {errorMessage && (
            <div className="order-details-error" role="alert">
              {errorMessage}
            </div>
          )}

          {/* =================================
              MAIN GRID
          ================================= */}

          <div className="order-details-grid">
            {/* ===============================
                FIRST ROW
            =============================== */}

            <div className="order-details-left">
              {/* =============================
                  ORDER ITEMS
              ============================= */}

              <section className="order-detail-card">
                <div className="order-detail-card-heading">
                  <div>
                    <ShoppingBag size={20} />

                    <h2>Order Items</h2>
                  </div>

                  <span>
                    {order.items?.length || 0}{" "}
                    {order.items?.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="order-details-items">
                  {order.items?.map((item, index) => (
                    <article
                      className="order-details-item"
                      key={`${order._id}-${item.productId || index}`}
                    >
                      {/* PRODUCT IMAGE */}

                      <div className="order-details-product-image">
                        {item.image ? (
                          <img src={item.image} alt={item.productName} />
                        ) : (
                          <Package size={26} />
                        )}
                      </div>

                      {/* PRODUCT INFO */}

                      <div className="order-details-product-info">
                        <strong>{item.productName}</strong>

                        <span>
                          {formatCurrency(item.pricePerUnit)} per {item.unit}
                        </span>
                      </div>

                      {/* CALCULATION */}

                      <div className="order-details-product-calculation">
                        <span>
                          {item.quantity} {item.unit}
                          {" × "}
                          {formatCurrency(item.pricePerUnit)}
                        </span>
                      </div>

                      {/* ITEM TOTAL */}

                      <strong className="order-details-item-total">
                        {formatCurrency(item.subtotal)}
                      </strong>
                    </article>
                  ))}
                </div>
              </section>

              {/* =============================
                  PAYMENT DETAILS
              ============================= */}

              <section className="order-detail-card">
                <div className="order-detail-card-heading">
                  <div>
                    <CreditCard size={20} />

                    <h2>Payment Details</h2>
                  </div>
                </div>

                <div className="payment-details-row">
                  <div>
                    <span>Payment Method</span>

                    <strong>Cash on Delivery</strong>
                  </div>

                  <span className="payment-details-active">Current Method</span>
                </div>

                <div className="future-payment-note">
                  Online payments and card payments will be available in a
                  future update.
                </div>
              </section>
            </div>

            {/* ===============================
                SECOND ROW
            =============================== */}

            <aside className="order-details-right">
              {/* =============================
                  DELIVERY ADDRESS
              ============================= */}

              <section className="order-detail-card">
                <div className="order-detail-card-heading">
                  <div>
                    <MapPin size={20} />

                    <h2>Delivery Address</h2>
                  </div>
                </div>

                <div className="delivery-address-details">
                  <div className="address-person">
                    <div>
                      <UserRound size={18} />
                    </div>

                    <strong>{shipping.fullName || "Customer"}</strong>
                  </div>

                  <p>
                    <MapPin size={16} />

                    <span>
                      {shipping.address || "Address not available"}

                      <br />

                      {shipping.district
                        ? `${shipping.district}, Sri Lanka`
                        : ""}
                    </span>
                  </p>

                  <p>
                    <Phone size={16} />

                    <span>{shipping.phone || "Phone not available"}</span>
                  </p>

                  {order.buyerId?.email && (
                    <p>
                      <Mail size={16} />

                      <span>{order.buyerId.email}</span>
                    </p>
                  )}
                </div>
              </section>

              {/* =============================
                  ORDER TIMELINE
              ============================= */}

              <section className="order-detail-card">
                <div className="order-detail-card-heading">
                  <div>
                    <Clock3 size={20} />

                    <h2>Order Timeline</h2>
                  </div>
                </div>

                {order.status === "cancelled" ? (
                  <div className="cancelled-timeline">
                    <div className="cancelled-timeline-icon">
                      <X size={20} />
                    </div>

                    <div>
                      <strong>Order Cancelled</strong>

                      <span>
                        {statusHistoryMap.cancelled
                          ? `${formatDate(
                              statusHistoryMap.cancelled,
                            )} • ${formatTime(statusHistoryMap.cancelled)}`
                          : "This order has been cancelled."}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="order-timeline">
                    {TRACKING_STATUSES.map((status, index) => {
                      const isComplete = index <= currentStatusIndex;

                      const changedAt = statusHistoryMap[status];

                      return (
                        <div className="order-timeline-step" key={status}>
                          <div className="timeline-marker-column">
                            <span
                              className={
                                isComplete
                                  ? "timeline-marker timeline-marker-complete"
                                  : "timeline-marker"
                              }
                            >
                              {isComplete && <Check size={12} />}
                            </span>

                            {index < TRACKING_STATUSES.length - 1 && (
                              <span
                                className={
                                  index < currentStatusIndex
                                    ? "timeline-line timeline-line-complete"
                                    : "timeline-line"
                                }
                              />
                            )}
                          </div>

                          <div className="timeline-content">
                            <strong>{STATUS_LABELS[status]}</strong>

                            {changedAt ? (
                              <span>
                                {formatDate(changedAt)}

                                {" • "}

                                {formatTime(changedAt)}
                              </span>
                            ) : (
                              <span>Pending</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* =============================
                  ORDER SUMMARY
              ============================= */}

              <section className="order-detail-card">
                <div className="order-detail-card-heading">
                  <div>
                    <Truck size={20} />

                    <h2>Order Summary</h2>
                  </div>
                </div>

                <div className="order-detail-summary-row">
                  <span>Item Subtotal</span>

                  <strong>{formatCurrency(order.totalAmount)}</strong>
                </div>

                <div className="order-detail-summary-row">
                  <span>Delivery Fee</span>

                  <span className="order-detail-future-badge">
                    Future Update
                  </span>
                </div>

                <div className="order-detail-summary-row">
                  <span>Service Fee</span>

                  <span className="order-detail-future-badge">
                    Future Update
                  </span>
                </div>

                <div className="order-detail-summary-row">
                  <span>Discount</span>

                  <span className="order-detail-future-badge">
                    Future Update
                  </span>
                </div>

                <div className="order-detail-summary-divider" />

                <div className="order-detail-total">
                  <span>Total Amount</span>

                  <strong>{formatCurrency(order.totalAmount)}</strong>
                </div>
              </section>

              {/* =============================
                  LIVE TRACKING
                  FUTURE FEATURE
                  SHIPPED ORDERS ONLY
              ============================= */}

              {order.status === "shipped" && (
                <button
                  type="button"
                  className="order-live-tracking-button"
                  onClick={() => setShowLiveTracking(true)}
                >
                  <Truck size={18} />
                  View Live Tracking
                </button>
              )}

              {/* =============================
                  CANCEL
                  PENDING ONLY
              ============================= */}

              {order.status === "pending" && (
                <button
                  type="button"
                  className="order-details-cancel-button"
                  onClick={() => setShowCancelModal(true)}
                >
                  <Trash2 size={18} />
                  Cancel Order
                </button>
              )}
            </aside>
          </div>
        </div>
      </main>

      {/* =====================================
          CANCEL ORDER MODAL
      ===================================== */}

      {showCancelModal && (
        <div
          className="order-details-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="details-cancel-title"
        >
          <div className="order-details-cancel-modal">
            <button
              type="button"
              className="order-details-modal-close"
              onClick={() => setShowCancelModal(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="order-details-cancel-icon">
              <Trash2 size={27} />
            </div>

            <h2 id="details-cancel-title">Cancel Order?</h2>

            <p>
              Are you sure you want to cancel order{" "}
              <strong>#{getDisplayOrderNumber(order)}</strong>?
            </p>

            <small>Product stock will be restored automatically.</small>

            <div className="order-details-modal-actions">
              <button
                type="button"
                className="details-keep-order"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
              >
                No, Keep It
              </button>

              <button
                type="button"
                className="details-confirm-cancel"
                onClick={handleCancelOrder}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================
          LIVE TRACKING
          FRONTEND FUTURE FEATURE
      ===================================== */}

      {showLiveTracking && (
        <LiveTrackingDemo
          order={order}
          onClose={() => setShowLiveTracking(false)}
        />
      )}
    </>
  );
}
