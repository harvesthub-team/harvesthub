import { useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  CreditCard,
  Leaf,
  LockKeyhole,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Truck,
  UserRound,
  WalletCards,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import { createOrder } from "../services/orderService";

import ComingSoonModal from "../components/ComingSoonModal";

import "./Checkout.css";

/* =========================================
   FORMAT CURRENCY
========================================= */

const formatCurrency = (amount) =>
  `LKR ${Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/* =========================================
   CHECKOUT
========================================= */

export default function Checkout() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const { cartItems, subtotal, groupedByFarmer, isCartEmpty, clearCart } =
    useCart();

  /* =========================================
     STATE
  ========================================= */

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: "",
    district: user?.district || "",
  });

  const [deliveryNote, setDeliveryNote] = useState("");

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [showPromoModal, setShowPromoModal] = useState(false);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  /* =========================================
     BACKEND ORDER ITEMS
  ========================================= */

  const orderItems = useMemo(
    () =>
      cartItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      })),
    [cartItems],
  );

  /* =========================================
     FORM CHANGE
  ========================================= */

  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    setShippingAddress((currentAddress) => ({
      ...currentAddress,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  /* =========================================
     VALIDATION
  ========================================= */

  const validateCheckout = () => {
    if (isCartEmpty) {
      setErrorMessage(
        "Your cart is empty. Please add products before checkout.",
      );

      return false;
    }

    if (!shippingAddress.fullName.trim()) {
      setErrorMessage("Please enter the recipient name.");

      return false;
    }

    if (!shippingAddress.phone.trim()) {
      setErrorMessage("Please enter a phone number.");

      return false;
    }

    if (!shippingAddress.address.trim()) {
      setErrorMessage("Please enter the delivery address.");

      return false;
    }

    if (!shippingAddress.district.trim()) {
      setErrorMessage("Please enter the district.");

      return false;
    }

    setErrorMessage("");

    return true;
  };

  /* =========================================
     PLACE REAL COD ORDER
  ========================================= */

  const handlePlaceOrder = async () => {
    if (!validateCheckout()) {
      return;
    }

    try {
      setIsPlacingOrder(true);

      setErrorMessage("");

      const response = await createOrder({
        items: orderItems,
        shippingAddress,
      });

      const createdOrders = Array.isArray(response.data) ? response.data : [];

      clearCart();

      navigate("/order-success", {
        state: {
          orders: createdOrders,
          message: response.message || "Order placed successfully",
        },
      });
    } catch (error) {
      console.error("Place order error:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to place your order. Please try again.",
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  /* =========================================
     EMPTY CART
  ========================================= */

  if (isCartEmpty) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <div className="checkout-empty-icon">
            <ShoppingBag size={38} />
          </div>

          <h1>Your cart is empty</h1>

          <p>Add some fresh products before continuing to checkout.</p>

          <button type="button" onClick={() => navigate("/products")}>
            Browse Products
            <ArrowRight size={18} />
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="checkout-page">
        <div className="checkout-container">
          {/* =================================
              PAGE HEADER
          ================================= */}

          <div className="checkout-breadcrumb">
            <span>Cart</span>

            <span>›</span>

            <strong>Checkout</strong>
          </div>

          <header className="checkout-header">
            <div>
              <h1>Checkout</h1>

              <p>Complete your order by providing delivery details.</p>
            </div>
          </header>

          {/* =================================
              LAYOUT
          ================================= */}

          <div className="checkout-layout">
            {/* ===============================
                LEFT COLUMN
            =============================== */}

            <div className="checkout-main-column">
              {/* =============================
                  1. DELIVERY INFORMATION
              ============================= */}

              <section className="checkout-section-card">
                <div className="checkout-section-heading">
                  <div className="checkout-heading-left">
                    <span className="checkout-step-number">1</span>

                    <div>
                      <h2>Delivery Information</h2>

                      <p>Where should we deliver your order?</p>
                    </div>
                  </div>

                  <MapPin size={21} />
                </div>

                <div className="checkout-form-grid">
                  {/* FULL NAME */}

                  <label className="checkout-field">
                    <span>Full Name</span>

                    <div className="checkout-input-wrapper">
                      <UserRound size={18} />

                      <input
                        type="text"
                        name="fullName"
                        value={shippingAddress.fullName}
                        onChange={handleAddressChange}
                        placeholder="Recipient name"
                      />
                    </div>
                  </label>

                  {/* PHONE */}

                  <label className="checkout-field">
                    <span>Phone Number</span>

                    <div className="checkout-input-wrapper">
                      <Phone size={18} />

                      <input
                        type="tel"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleAddressChange}
                        placeholder="07XXXXXXXX"
                      />
                    </div>
                  </label>

                  {/* ADDRESS */}

                  <label className="checkout-field checkout-field-full">
                    <span>Delivery Address</span>

                    <div className="checkout-input-wrapper">
                      <MapPin size={18} />

                      <input
                        type="text"
                        name="address"
                        value={shippingAddress.address}
                        onChange={handleAddressChange}
                        placeholder="House number, street, town"
                      />
                    </div>
                  </label>

                  {/* DISTRICT */}

                  <label className="checkout-field checkout-field-full">
                    <span>District</span>

                    <div className="checkout-input-wrapper">
                      <MapPin size={18} />

                      <input
                        type="text"
                        name="district"
                        value={shippingAddress.district}
                        onChange={handleAddressChange}
                        placeholder="e.g. Colombo"
                      />
                    </div>
                  </label>
                </div>

                <div className="checkout-future-note">
                  <Truck size={18} />

                  <span>
                    Delivery fee calculation will be introduced in a future
                    update.
                  </span>
                </div>
              </section>

              {/* =============================
                  2. CONTACT DETAILS
              ============================= */}

              <section className="checkout-section-card">
                <div className="checkout-section-heading">
                  <div className="checkout-heading-left">
                    <span className="checkout-step-number">2</span>

                    <div>
                      <h2>Contact Details</h2>

                      <p>We will use these details for your order.</p>
                    </div>
                  </div>

                  <Mail size={21} />
                </div>

                <div className="checkout-contact-grid">
                  <article className="checkout-contact-item">
                    <div className="checkout-contact-icon">
                      <UserRound size={20} />
                    </div>

                    <div>
                      <strong>
                        {shippingAddress.fullName || user?.fullName || "Buyer"}
                      </strong>

                      <span>{shippingAddress.phone || "Phone number"}</span>
                    </div>
                  </article>

                  <article className="checkout-contact-item">
                    <div className="checkout-contact-icon">
                      <Mail size={20} />
                    </div>

                    <div>
                      <strong>Email</strong>

                      <span>{user?.email || "Email not available"}</span>
                    </div>
                  </article>
                </div>
              </section>

              {/* =============================
                  3. ORDER REVIEW
              ============================= */}

              <section className="checkout-section-card">
                <div className="checkout-section-heading">
                  <div className="checkout-heading-left">
                    <span className="checkout-step-number">3</span>

                    <div>
                      <h2>Order Review</h2>

                      <p>
                        {cartItems.length}{" "}
                        {cartItems.length === 1 ? "product" : "products"} in
                        your order
                      </p>
                    </div>
                  </div>

                  <Package size={21} />
                </div>

                <div className="checkout-order-review">
                  {cartItems.map((item, index) => (
                    <article
                      className="checkout-review-item"
                      key={item.productId || index}
                    >
                      {/* PRODUCT IMAGE */}

                      <div className="checkout-review-image">
                        {item.image ? (
                          <img src={item.image} alt={item.productName} />
                        ) : (
                          <Package size={26} />
                        )}
                      </div>

                      {/* PRODUCT */}

                      <div className="checkout-review-product">
                        <strong>{item.productName}</strong>

                        <span>{item.farmerName || "Local Farmer"}</span>
                      </div>

                      {/* UNIT PRICE */}

                      <div className="checkout-review-unit">
                        <strong>{formatCurrency(item.pricePerUnit)}</strong>

                        <span>per {item.unit}</span>
                      </div>

                      {/* QUANTITY */}

                      <div className="checkout-review-quantity">
                        Qty: {item.quantity} {item.unit}
                      </div>

                      {/* SUBTOTAL */}

                      <strong className="checkout-review-subtotal">
                        {formatCurrency(
                          Number(item.pricePerUnit) * Number(item.quantity),
                        )}
                      </strong>
                    </article>
                  ))}
                </div>

                {/* FARMER GROUPS */}

                <div className="checkout-farmer-summary">
                  {groupedByFarmer.map((group, index) => (
                    <div key={group.farmerId || index}>
                      <span>
                        {group.farmerName}

                        {group.farmerDistrict
                          ? ` • ${group.farmerDistrict}`
                          : ""}
                      </span>

                      <strong>
                        {group.items.length}{" "}
                        {group.items.length === 1 ? "item" : "items"}
                      </strong>
                    </div>
                  ))}
                </div>
              </section>

              {/* =============================
                  4. DELIVERY NOTE
              ============================= */}

              <section className="checkout-section-card">
                <div className="checkout-section-heading">
                  <div className="checkout-heading-left">
                    <span className="checkout-step-number">4</span>

                    <div>
                      <h2>
                        Delivery Note <span>(Optional)</span>
                      </h2>

                      <p>Add instructions for delivery.</p>
                    </div>
                  </div>

                  <Leaf size={21} />
                </div>

                <textarea
                  className="checkout-delivery-note"
                  value={deliveryNote}
                  onChange={(event) =>
                    setDeliveryNote(event.target.value.slice(0, 200))
                  }
                  maxLength={200}
                  placeholder="Leave a note for the farmer or delivery team (e.g. gate instructions)"
                />

                <div className="checkout-note-footer">
                  <span>
                    Delivery notes are currently kept in the checkout interface
                    only and are planned for future backend support.
                  </span>

                  <strong>
                    {deliveryNote.length}
                    /200
                  </strong>
                </div>
              </section>
            </div>

            {/* ===============================
                RIGHT COLUMN
            =============================== */}

            <aside className="checkout-side-column">
              {/* =============================
                  ORDER SUMMARY
              ============================= */}

              <section className="checkout-side-card">
                <div className="checkout-side-heading">
                  <ShoppingBag size={21} />

                  <h2>Order Summary</h2>
                </div>

                <div className="checkout-summary-row">
                  <span>Product Subtotal</span>

                  <strong>{formatCurrency(subtotal)}</strong>
                </div>

                <div className="checkout-summary-row">
                  <span>Delivery Fee</span>

                  <span className="checkout-future-pill">Future Update</span>
                </div>

                <div className="checkout-summary-row">
                  <span>Service Fee</span>

                  <span className="checkout-future-pill">Future Update</span>
                </div>

                <div className="checkout-summary-row">
                  <span>Discount</span>

                  <span className="checkout-future-pill">Future Update</span>
                </div>

                <div className="checkout-summary-divider" />

                <div className="checkout-grand-total">
                  <span>Grand Total</span>

                  <strong>{formatCurrency(subtotal)}</strong>
                </div>

                <small className="checkout-summary-caption">
                  Current total includes product subtotal only.
                </small>
              </section>

              {/* =============================
                  PROMO CODE
              ============================= */}

              <section className="checkout-side-card">
                <div className="checkout-side-heading">
                  <BadgePercent size={21} />

                  <h2>Promo Code</h2>

                  <span className="checkout-coming-soon-badge">
                    Coming Soon
                  </span>
                </div>

                <button
                  type="button"
                  className="checkout-promo-preview"
                  onClick={() => setShowPromoModal(true)}
                >
                  <div>
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      disabled
                    />

                    <span>Apply</span>
                  </div>

                  <small>Click to preview this future feature.</small>
                </button>
              </section>

              {/* =============================
                  PAYMENT METHOD
              ============================= */}

              <section className="checkout-side-card">
                <div className="checkout-side-heading">
                  <CreditCard size={21} />

                  <h2>Payment Method</h2>
                </div>

                {/* CASH ON DELIVERY */}

                <div className="checkout-payment-option checkout-payment-option-active">
                  <div className="checkout-payment-radio">
                    <span />
                  </div>

                  <div className="checkout-payment-icon">
                    <WalletCards size={23} />
                  </div>

                  <div className="checkout-payment-text">
                    <strong>Cash on Delivery</strong>

                    <span>Pay when you receive your order</span>
                  </div>

                  <span className="checkout-payment-status checkout-payment-status-active">
                    Active
                  </span>
                </div>

                {/* ONLINE PAYMENT */}

                <button
                  type="button"
                  className="checkout-payment-option checkout-online-payment-option"
                  onClick={() => setShowPaymentModal(true)}
                >
                  <div className="checkout-payment-radio">
                    <span />
                  </div>

                  <div className="checkout-payment-icon">
                    <CreditCard size={23} />
                  </div>

                  <div className="checkout-payment-text">
                    <strong>Online Payment</strong>

                    <span>Credit / Debit Card</span>
                  </div>

                  <span className="checkout-payment-status">Coming Soon</span>
                </button>

                <div className="checkout-payment-note">
                  <LockKeyhole size={18} />

                  <span>
                    Cash on Delivery is currently available. Online payment will
                    be introduced in a future update.
                  </span>
                </div>
              </section>

              {/* =============================
                  ERROR
              ============================= */}

              {errorMessage && (
                <div className="checkout-error-message" role="alert">
                  {errorMessage}
                </div>
              )}

              {/* =============================
                  PLACE ORDER
              ============================= */}

              <button
                type="button"
                className="checkout-place-order-button"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || isCartEmpty}
              >
                <LockKeyhole size={19} />

                <span>
                  {isPlacingOrder ? "Placing Order..." : "Place Order"}
                </span>

                <ArrowRight size={20} />
              </button>

              {/* =============================
                  BACK TO CART
              ============================= */}

              <button
                type="button"
                className="checkout-back-button"
                onClick={() => navigate("/cart")}
              >
                <ArrowLeft size={18} />
                Back to Cart
              </button>

              {/* =============================
                  SECURE CHECKOUT
              ============================= */}

              <div className="checkout-secure-note">
                <CheckCircle2 size={21} />

                <div>
                  <strong>Secure Checkout</strong>

                  <span>
                    Your order is protected and verified through your HarvestHub
                    account.
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* =====================================
          ONLINE PAYMENT COMING SOON MODAL
      ===================================== */}

      {showPaymentModal && (
        <ComingSoonModal
          type="payment"
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* =====================================
          PROMO COMING SOON MODAL
      ===================================== */}

      {showPromoModal && (
        <ComingSoonModal
          type="promo"
          onClose={() => setShowPromoModal(false)}
        />
      )}
    </>
  );
}
