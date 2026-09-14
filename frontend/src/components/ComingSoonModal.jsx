import {
  ArrowLeft,
  BadgePercent,
  CreditCard,
  LockKeyhole,
  X,
} from "lucide-react";

import "./ComingSoonModal.css";

export default function ComingSoonModal({ type, onClose }) {
  const isPayment = type === "payment";

  return (
    <div
      className="coming-soon-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coming-soon-title"
    >
      <div
        className={`coming-soon-modal ${
          isPayment ? "payment-coming-soon" : "promo-coming-soon"
        }`}
      >
        <div className="coming-soon-header">
          <strong>
            {isPayment
              ? "Online Payment (Coming Soon)"
              : "Promo Code (Coming Soon)"}
          </strong>

          <button
            type="button"
            className="coming-soon-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        <div className="coming-soon-hero">
          <div className="coming-soon-content">
            <div className="coming-soon-icon-wrap">
              {isPayment ? (
                <>
                  <CreditCard size={52} />
                  <span className="lock-badge">
                    <LockKeyhole size={18} />
                  </span>
                </>
              ) : (
                <BadgePercent size={58} />
              )}
            </div>

            <h2 id="coming-soon-title">
              {isPayment
                ? "Online Payment is Coming Soon!"
                : "Promo Code Feature Coming Soon!"}
            </h2>

            <p>
              {isPayment
                ? "We are working to bring you a secure and seamless online payment experience."
                : "Great discounts are on the way. Stay tuned for exciting offers!"}
            </p>

            {isPayment && (
              <div className="payment-methods-section">
                <span className="payment-methods-label">
                  Supported Payment Methods
                </span>

                <div className="payment-brand-grid">
                  <div className="payment-brand visa">VISA</div>

                  <div className="payment-brand mastercard">
                    <span className="mastercard-circles">
                      <span />
                      <span />
                    </span>
                    <small>mastercard</small>
                  </div>

                  <div className="payment-brand amex">AMEX</div>

                  <div className="payment-brand discover">DISCOVER</div>
                </div>
              </div>
            )}

            {!isPayment && (
              <div className="promo-future-note">
                <BadgePercent size={18} />

                <span>
                  Discounts and promotional offers will be introduced in a
                  future update.
                </span>
              </div>
            )}

            <button
              type="button"
              className="back-to-checkout-button"
              onClick={onClose}
            >
              <ArrowLeft size={17} />
              Back to Checkout
            </button>
          </div>
        </div>

        <div className="future-implementation-note">
          <LockKeyhole size={15} />

          <span>
            Future Implementation — no payment or promo transaction is processed
            yet.
          </span>
        </div>
      </div>
    </div>
  );
}
