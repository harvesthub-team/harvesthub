import { useLocation, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
  Truck,
  WalletCards,
} from "lucide-react";

import "./OrderSuccess.css";

/* =========================================
   HELPERS
========================================= */

const formatCurrency = (amount) =>
  `LKR ${Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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
   ORDER SUCCESS
========================================= */

export default function OrderSuccess() {
  const location = useLocation();

  const navigate = useNavigate();

  /* =========================================
     REAL ORDERS FROM CHECKOUT
  ========================================= */

  const orders = Array.isArray(location.state?.orders)
    ? location.state.orders
    : [];

  /* =========================================
     TOTAL AMOUNT
  ========================================= */

  const totalAmount = orders.reduce(
    (total, order) => total + Number(order.totalAmount || 0),
    0,
  );

  /* =========================================
     TOTAL ITEM QUANTITY
  ========================================= */

  const totalItems = orders.reduce(
    (total, order) =>
      total +
      (order.items || []).reduce(
        (itemTotal, item) => itemTotal + Number(item.quantity || 0),
        0,
      ),
    0,
  );

  /* =========================================
     DIRECT PAGE ACCESS / NO ORDER DATA
  ========================================= */

  if (orders.length === 0) {
    return (
      <main className="order-success-page">
        <div className="order-success-container">
          <section className="order-success-card">
            <div className="order-success-icon">
              <PackageCheck size={42} />
            </div>

            <h1>Order Information Unavailable</h1>

            <p className="order-success-subtitle">
              We could not find a newly placed order for this page. You can view
              your existing orders from My Orders.
            </p>

            <div className="order-success-actions">
              <button
                type="button"
                className="order-success-primary"
                onClick={() => navigate("/marketplace/my-orders")}
              >
                View My Orders
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="order-success-secondary"
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  /* =========================================
     SUCCESS UI
  ========================================= */

  return (
    <main className="order-success-page">
      <div className="order-success-container">
        <section className="order-success-card">
          {/* =================================
              SUCCESS ICON
          ================================= */}

          <div className="order-success-icon">
            <Check size={42} />
          </div>

          {/* =================================
              TITLE
          ================================= */}

          <h1>Order Placed Successfully!</h1>

          <p className="order-success-subtitle">
            Thank you for supporting local farmers. Your order has been
            successfully received.
          </p>

          {/* =================================
              PAYMENT METHOD
          ================================= */}

          <div className="order-success-payment">
            <WalletCards size={18} />

            <div>
              <span>Payment Method</span>

              <strong>Cash on Delivery</strong>
            </div>
          </div>

          {/* =================================
              MULTI FARMER NOTICE
          ================================= */}

          {orders.length > 1 && (
            <div className="order-success-farmer-note">
              <Truck size={18} />

              <p>
                Your cart contains products from{" "}
                <strong>{orders.length} farmers</strong>. Separate orders are
                created for each farmer.
              </p>
            </div>
          )}

          {/* =================================
              SUMMARY CARDS
          ================================= */}

          <div className="order-success-stats">
            {/* ITEMS */}

            <article>
              <div>
                <ShoppingBag size={22} />
              </div>

              <span>Order Items</span>

              <strong>{totalItems}</strong>
            </article>

            {/* PAYMENT */}

            <article>
              <div>
                <WalletCards size={22} />
              </div>

              <span>Payment Method</span>

              <strong>COD</strong>
            </article>

            {/* STATUS */}

            <article>
              <div>
                <PackageCheck size={22} />
              </div>

              <span>Order Status</span>

              <strong>Pending</strong>
            </article>
          </div>

          {/* =================================
              ORDER REFERENCES
          ================================= */}

          <section className="order-success-reference-section">
            <div className="order-success-section-heading">
              <div>
                <PackageCheck size={20} />

                <h2>Order References</h2>
              </div>

              <span>
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </span>
            </div>

            <div className="order-success-order-list">
              {orders.map((order) => (
                <article className="order-success-order-row" key={order._id}>
                  <div>
                    <CheckCircle2 size={18} />

                    <div>
                      <span>Order Number</span>

                      <strong>#{getDisplayOrderNumber(order)}</strong>
                    </div>
                  </div>

                  <strong>{formatCurrency(order.totalAmount)}</strong>
                </article>
              ))}
            </div>
          </section>

          {/* =================================
              TOTAL
          ================================= */}

          <div className="order-success-total">
            <span>Total Order Amount</span>

            <strong>{formatCurrency(totalAmount)}</strong>
          </div>

          {/* =================================
              WHAT HAPPENS NEXT
          ================================= */}

          <section className="order-success-next">
            <h3>What happens next?</h3>

            <div>
              <span>
                <CheckCircle2 size={17} />
                Farmers will review and confirm your order.
              </span>

              <span>
                <CheckCircle2 size={17} />
                You can track every order from My Orders.
              </span>

              <span>
                <CheckCircle2 size={17} />
                Shipped orders can show the delivery tracking preview.
              </span>
            </div>
          </section>

          {/* =================================
              ACTIONS
          ================================= */}

          <div className="order-success-actions">
            <button
              type="button"
              className="order-success-primary"
              onClick={() => navigate("/marketplace/my-orders")}
            >
              View My Orders
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="order-success-secondary"
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
