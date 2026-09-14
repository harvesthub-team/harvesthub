import {
  Clock3,
  Home,
  MapPin,
  Navigation,
  Radio,
  Truck,
  X,
} from "lucide-react";

import "./LiveTrackingDemo.css";

const getDisplayOrderNumber = (order) => {
  if (!order?._id) {
    return "ORD-DEMO";
  }

  const year = order.createdAt
    ? new Date(order.createdAt).getFullYear()
    : new Date().getFullYear();

  const shortId = order._id.slice(-6).toUpperCase();

  return `ORD-${year}-${shortId}`;
};

export default function LiveTrackingDemo({ order, onClose }) {
  const shipping = order?.shippingAddress || {};

  return (
    <div
      className="live-tracking-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-tracking-title"
    >
      <div className="live-tracking-modal">
        {/* Header */}
        <div className="live-tracking-header">
          <div>
            <div className="tracking-demo-label">
              <Radio size={14} />
              Demo / Future Feature
            </div>

            <h2 id="live-tracking-title">Live Delivery Tracking</h2>

            <p>Order #{getDisplayOrderNumber(order)}</p>
          </div>

          <button
            type="button"
            className="live-tracking-close"
            onClick={onClose}
            aria-label="Close live tracking"
          >
            <X size={20} />
          </button>
        </div>

        {/* Demo notice */}
        <div className="tracking-demo-notice">
          <Navigation size={18} />

          <div>
            <strong>Simulated tracking preview</strong>

            <span>
              This is a frontend demonstration. Real GPS tracking can be added
              in a future version.
            </span>
          </div>
        </div>

        {/* Fake Map */}
        <div className="tracking-map">
          <div className="tracking-map-grid" />

          {/* Start */}
          <div className="tracking-point tracking-start">
            <div className="tracking-point-icon">
              <MapPin size={18} />
            </div>

            <span>Dispatch</span>
          </div>

          {/* Destination */}
          <div className="tracking-point tracking-destination">
            <div className="tracking-point-icon">
              <Home size={18} />
            </div>

            <span>Your Address</span>
          </div>

          {/* Route */}
          <div className="tracking-route">
            <div className="tracking-route-progress" />
          </div>

          {/* Moving vehicle */}
          <div className="tracking-vehicle">
            <div className="tracking-vehicle-icon">
              <Truck size={22} />
            </div>

            <span>Delivery</span>
          </div>
        </div>

        {/* Tracking information */}
        <div className="tracking-information-grid">
          <article>
            <div className="tracking-info-icon">
              <Truck size={20} />
            </div>

            <div>
              <span>Current Stage</span>

              <strong>Out for Delivery</strong>
            </div>
          </article>

          <article>
            <div className="tracking-info-icon">
              <Clock3 size={20} />
            </div>

            <div>
              <span>Estimated Arrival</span>

              <strong>Demo estimate</strong>
            </div>
          </article>

          <article>
            <div className="tracking-info-icon">
              <MapPin size={20} />
            </div>

            <div>
              <span>Destination</span>

              <strong>{shipping.district || "Delivery Address"}</strong>
            </div>
          </article>
        </div>

        {/* Delivery address */}
        <div className="tracking-address-card">
          <MapPin size={20} />

          <div>
            <span>Delivering to</span>

            <strong>{shipping.fullName || "Customer"}</strong>

            <p>
              {shipping.address || "Delivery address"}
              {shipping.district ? `, ${shipping.district}` : ""}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="tracking-status-row">
          <div className="tracking-status-item complete">
            <span>✓</span>
            <small>Confirmed</small>
          </div>

          <div className="tracking-status-line complete" />

          <div className="tracking-status-item complete">
            <span>✓</span>
            <small>Processing</small>
          </div>

          <div className="tracking-status-line complete" />

          <div className="tracking-status-item complete">
            <span>✓</span>
            <small>Shipped</small>
          </div>

          <div className="tracking-status-line active" />

          <div className="tracking-status-item active">
            <span>
              <Truck size={13} />
            </span>
            <small>On the Way</small>
          </div>

          <div className="tracking-status-line" />

          <div className="tracking-status-item">
            <span />
            <small>Delivered</small>
          </div>
        </div>

        {/* Footer */}
        <div className="live-tracking-footer">
          <p>
            Real-time GPS location, route distance, and ETA are planned as a
            future implementation.
          </p>

          <button type="button" onClick={onClose}>
            Back to Order
          </button>
        </div>
      </div>
    </div>
  );
}
