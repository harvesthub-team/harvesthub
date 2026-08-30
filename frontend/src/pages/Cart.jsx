import { useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  ArrowRight,
  Package,
  ShoppingBag,
  Trash2,
  Truck,
  UserRound,
  WalletCards,
} from 'lucide-react';

import {
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
} from 'react-icons/fa';

import { useCart } from '../context/CartContext';

import './Cart.css';

const formatCurrency = (amount) =>
  `LKR ${Number(amount || 0).toLocaleString(
    'en-LK',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;

export default function Cart() {
  const navigate = useNavigate();

  const {
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    uniqueProductCount,
    subtotal,
    farmerCount,
    groupedByFarmer,
    isCartEmpty,
  } = useCart();

  /*
   * groupedByFarmer is already an array
   * from CartContext.
   */
  const farmerGroups =
    Array.isArray(groupedByFarmer)
      ? groupedByFarmer
      : Object.values(
          groupedByFarmer || {}
        );

  /* =========================================
     EMPTY CART
  ========================================= */

  if (isCartEmpty) {
    return (
      <main className="cart-page">
        <div className="cart-container">
          <section className="empty-cart">
            <div className="empty-cart-icon">
              <ShoppingBag size={38} />
            </div>

            <h1>
              Your cart is empty
            </h1>

            <p>
              Looks like you haven&apos;t added
              anything to your cart yet.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate('/products')
              }
            >
              Browse Products

              <ArrowRight size={18} />
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-container">

        {/* =================================
            PAGE HEADER
        ================================= */}

        <header className="cart-header">
          <div>
            <h1>
              Your cart
            </h1>

            <p>
              Review your fresh produce before
              checkout.
            </p>
          </div>
        </header>

        {/* =================================
            TOP STAT CARDS
        ================================= */}

        <section className="cart-stats">
          {/* Items */}

          <article className="cart-stat-card">
            <div className="cart-stat-icon">
              <ShoppingBag size={25} />
            </div>

            <div>
              <span>
                Items
              </span>

              <strong>
                {uniqueProductCount}
              </strong>

              <small>
                Total products in cart
              </small>
            </div>
          </article>

          {/* Farmers */}

          <article className="cart-stat-card">
            <div className="cart-stat-icon">
              <UserRound size={25} />
            </div>

            <div>
              <span>
                Farmers
              </span>

              <strong>
                {farmerCount}
              </strong>

              <small>
                Unique local farmers
              </small>
            </div>
          </article>

          {/* Total */}

          <article className="cart-stat-card">
            <div className="cart-stat-icon">
              <WalletCards size={25} />
            </div>

            <div>
              <span>
                Estimated Total
              </span>

              <strong>
                {formatCurrency(
                  subtotal
                )}
              </strong>

              <small>
                Current product subtotal
              </small>
            </div>
          </article>
        </section>

        {/* =================================
            CART LAYOUT
        ================================= */}

        <div className="cart-layout">

          {/* ===============================
              LEFT - PRODUCTS
          =============================== */}

          <section className="cart-products-card">

            {farmerGroups.map(
              (group, groupIndex) => (
                <div
                  className="farmer-cart-group"
                  key={
                    group.farmerId ||
                    groupIndex
                  }
                >

                  {/* FARMER HEADER */}

                  <div className="farmer-cart-header">
                    <div className="farmer-cart-name">
                      <UserRound size={18} />

                      <strong>
                        {group.farmerName ||
                          'Local Farmer'}
                      </strong>

                      {group.farmerDistrict && (
                        <>
                          <span>
                            •
                          </span>

                          <small>
                            {
                              group.farmerDistrict
                            }
                            , Sri Lanka
                          </small>
                        </>
                      )}
                    </div>

                    <span className="farmer-item-count">
                      {
                        group.items.length
                      }{' '}
                      {group.items.length === 1
                        ? 'item'
                        : 'items'}
                    </span>
                  </div>

                  {/* PRODUCTS */}

                  <div className="farmer-cart-items">
                    {group.items.map(
                      (item) => (
                        <article
                          className="cart-product-row"
                          key={
                            item.productId
                          }
                        >

                          {/* Image */}

                          <div className="cart-product-image">
                            {item.image ? (
                              <img
                                src={
                                  item.image
                                }
                                alt={
                                  item.productName
                                }
                              />
                            ) : (
                              <Package
                                size={30}
                              />
                            )}
                          </div>

                          {/* Product */}

                          <div className="cart-product-info">
                            <strong>
                              {
                                item.productName
                              }
                            </strong>

                            <p>
                              {item.description ||
                                'Fresh local produce'}
                            </p>

                            <span>
                              Freshly harvested
                            </span>
                          </div>

                          {/* Unit Price */}

                          <div className="cart-product-price">
                            <span>
                              Unit Price
                            </span>

                            <strong>
                              {formatCurrency(
                                item.pricePerUnit
                              )}
                            </strong>

                            <small>
                              per {item.unit}
                            </small>
                          </div>

                          {/* Quantity */}

                          <div className="cart-product-quantity">
                            <span>
                              Quantity
                            </span>

                            <div className="cart-quantity-control">
                              <button
                                type="button"
                                onClick={() =>
                                  decreaseQuantity(
                                    item.productId
                                  )
                                }
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>

                              <strong>
                                {
                                  item.quantity
                                }
                              </strong>

                              <button
                                type="button"
                                onClick={() =>
                                  increaseQuantity(
                                    item.productId
                                  )
                                }
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            <small>
                              {item.quantity}{' '}
                              {item.unit}
                            </small>
                          </div>

                          {/* Subtotal */}

                          <div className="cart-product-subtotal">
                            <span>
                              Subtotal
                            </span>

                            <strong>
                              {formatCurrency(
                                Number(
                                  item.pricePerUnit
                                ) *
                                  Number(
                                    item.quantity
                                  )
                              )}
                            </strong>
                          </div>

                          {/* Delete */}

                          <button
                            type="button"
                            className="cart-delete-button"
                            onClick={() =>
                              removeFromCart(
                                item.productId
                              )
                            }
                            aria-label={`Remove ${item.productName}`}
                          >
                            <Trash2
                              size={19}
                            />
                          </button>
                        </article>
                      )
                    )}
                  </div>
                </div>
              )
            )}

            {/* DELIVERY NOTE */}

            <div className="cart-delivery-preview">
              <div className="cart-delivery-icon">
                <Truck size={21} />
              </div>

              <div>
                <strong>
                  Delivery information will be
                  confirmed at checkout
                </strong>

                <span>
                  Delivery fee calculation —
                  Future Update
                </span>
              </div>
            </div>

            {/* CONTINUE SHOPPING */}

            <button
              type="button"
              className="continue-shopping-button"
              onClick={() =>
                navigate('/products')
              }
            >
              <ArrowLeft size={17} />

              Continue shopping
            </button>

          </section>

          {/* ===============================
              RIGHT - ORDER SUMMARY
          =============================== */}

          <aside className="cart-summary-section">

            <section className="cart-summary-card">

              <h2>
                Order Summary
              </h2>

              {/* Item Subtotal */}

              <div className="cart-summary-row">
                <span>
                  Item Subtotal (
                  {uniqueProductCount}{' '}
                  {uniqueProductCount === 1
                    ? 'item'
                    : 'items'}
                  )
                </span>

                <strong>
                  {formatCurrency(
                    subtotal
                  )}
                </strong>
              </div>

              {/* Delivery */}

              <div className="cart-summary-row">
                <span>
                  Delivery Fee
                </span>

                <span className="cart-future-badge">
                  Coming Soon
                </span>
              </div>

              {/* Service */}

              <div className="cart-summary-row">
                <span>
                  Service Fee
                </span>

                <span className="cart-future-badge">
                  Coming Soon
                </span>
              </div>

              {/* Discount */}

              <div className="cart-summary-row">
                <span>
                  Discount
                </span>

                <span className="cart-future-badge">
                  Future Update
                </span>
              </div>

              {/* Divider */}

              <div className="cart-summary-divider" />

              {/* =================================
                  GRAND TOTAL
              ================================= */}

              <div className="cart-grand-total">
                <div>
                  <strong>
                    Grand Total
                  </strong>

                  <span>
                    Current backend-supported
                    total
                  </span>
                </div>

                <strong>
                  {formatCurrency(
                    subtotal
                  )}
                </strong>
              </div>

              {/* =================================
                  PROCEED TO CHECKOUT
              ================================= */}

              <button
                type="button"
                className="proceed-checkout-button"
                onClick={() =>
                  navigate('/checkout')
                }
              >
                <span>
                  Proceed to Checkout
                </span>

                <ArrowRight
                  size={18}
                />
              </button>

              {/* =================================
                  ACCEPTED PAYMENT METHODS
              ================================= */}

              <div className="accepted-payments">
                <span className="accepted-payments-title">
                  We accept
                </span>

                <div className="accepted-payment-logos">

                  {/* VISA */}

                  <div
                    className="accepted-payment-logo visa-logo"
                    title="Visa"
                  >
                    <FaCcVisa />
                  </div>

                  {/* MASTERCARD */}

                  <div
                    className="accepted-payment-logo mastercard-logo"
                    title="Mastercard"
                  >
                    <FaCcMastercard />
                  </div>

                  {/* AMEX */}

                  <div
                    className="accepted-payment-logo amex-logo"
                    title="American Express"
                  >
                    <FaCcAmex />
                  </div>

                  {/* MCASH */}

                  <div
                    className="accepted-payment-logo mcash-logo"
                    title="mCash"
                  >
                    <span>
                      mCash
                    </span>
                  </div>

                  {/* FLASH */}

                  <div
                    className="accepted-payment-logo flash-logo"
                    title="Flash"
                  >
                    <span>
                      Flash
                    </span>
                  </div>

                </div>

                <span className="accepted-payment-coming-soon">
                  Coming Soon
                </span>
              </div>

              {/* =================================
                  SAFE CHECKOUT PANEL
              ================================= */}

              <div className="cart-summary-secure-area">

                <div className="cart-summary-secure-icon">
                  <WalletCards
                    size={27}
                  />
                </div>

                <div>
                  <strong>
                    Safe &amp; Simple Checkout
                  </strong>

                  <span>
                    Cash on Delivery is currently
                    available. Online payments
                    will be introduced soon.
                  </span>
                </div>

              </div>

            </section>

          </aside>

        </div>

      </div>
    </main>
  );
}