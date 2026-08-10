import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ShoppingBag,
  Users,
  Wallet,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Store,
} from 'lucide-react';

import { useCart } from '../context/CartContext';

import './Cart.css';

function formatMoney(value) {
  return `LKR ${Number(value || 0).toLocaleString('en-LK')}`;
}

export default function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    cartTotal,
    cartCount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const groupedItems = useMemo(() => {
    const groups = {};

    cartItems.forEach((item) => {
      const key =
        item.farmerId ||
        item.farmerName ||
        'HarvestHub Farmer';

      if (!groups[key]) {
        groups[key] = {
          key,
          farmerName:
            item.farmerName || 'HarvestHub Farmer',
          district: item.farmerDistrict || '',
          items: [],
        };
      }

      groups[key].items.push(item);
    });

    return Object.values(groups);
  }, [cartItems]);

  const handleClearCart = () => {
    const confirmed = window.confirm(
      'Remove all products from your cart?'
    );

    if (confirmed) {
      clearCart();
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="advanced-cart-page">
        <section className="advanced-cart-container">
          <div className="advanced-cart-empty">
            <ShoppingBag size={58} />

            <h1>Your cart is empty</h1>

            <p>
              Add fresh products from the marketplace
              to start an order.
            </p>

            <button
              type="button"
              onClick={() => navigate('/products')}
            >
              Browse products
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="advanced-cart-page">
      <section className="advanced-cart-container">

        <header className="advanced-cart-header">
          <h1>Your Cart</h1>

          <p>
            Review your fresh produce before checkout.
          </p>
        </header>

        <div className="cart-stat-grid">

          <div className="cart-stat-card">
            <div>
              <ShoppingBag size={24} />
            </div>

            <section>
              <span>Items</span>
              <strong>{cartCount}</strong>
              <small>Total items in cart</small>
            </section>
          </div>

          <div className="cart-stat-card">
            <div>
              <Users size={24} />
            </div>

            <section>
              <span>Farmers</span>
              <strong>{groupedItems.length}</strong>
              <small>Unique farmers</small>
            </section>
          </div>

          <div className="cart-stat-card">
            <div>
              <Wallet size={24} />
            </div>

            <section>
              <span>Estimated Total</span>
              <strong>{formatMoney(cartTotal)}</strong>
              <small>Product total</small>
            </section>
          </div>
        </div>

        <div className="advanced-cart-layout">

          <div className="cart-farmers-panel">
            {groupedItems.map((group) => (
              <section
                className="cart-farmer-group"
                key={group.key}
              >
                <div className="cart-farmer-header">
                  <div>
                    <Store size={18} />

                    <strong>
                      {group.farmerName}
                    </strong>

                    {group.district && (
                      <span>
                        • {group.district}
                      </span>
                    )}
                  </div>

                  <span>
                    {group.items.length} item
                    {group.items.length !== 1
                      ? 's'
                      : ''}
                  </span>
                </div>

                {group.items.map((item) => (
                  <article
                    className="advanced-cart-item"
                    key={item.productId}
                  >
                    <div className="cart-product-image">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                        />
                      ) : (
                        <ShoppingBag size={30} />
                      )}
                    </div>

                    <div className="cart-product-main">
                      <h3>{item.name}</h3>

                      {item.farmerName && (
                        <span>
                          Sold by {item.farmerName}
                        </span>
                      )}

                      <small>
                        Fresh produce from HarvestHub
                      </small>
                    </div>

                    <div className="cart-product-price">
                      <span>Unit Price</span>

                      <strong>
                        {formatMoney(
                          item.pricePerUnit
                        )}
                      </strong>

                      <small>
                        per {item.unit}
                      </small>
                    </div>

                    <div className="cart-product-quantity">
                      <span>Quantity</span>

                      <div>
                        <button
                          type="button"
                          disabled={
                            item.quantity <= 1
                          }
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1
                            )
                          }
                        >
                          <Minus size={15} />
                        </button>

                        <strong>
                          {item.quantity}
                        </strong>

                        <button
                          type="button"
                          disabled={
                            item.maxQuantity > 0 &&
                            item.quantity >=
                              item.maxQuantity
                          }
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1
                            )
                          }
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      <small>
                        {item.quantity} {item.unit}
                      </small>
                    </div>

                    <div className="cart-product-subtotal">
                      <span>Subtotal</span>

                      <strong>
                        {formatMoney(
                          item.pricePerUnit *
                            item.quantity
                        )}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className="cart-remove-item"
                      onClick={() =>
                        removeFromCart(
                          item.productId
                        )
                      }
                    >
                      <Trash2 size={18} />
                    </button>
                  </article>
                ))}
              </section>
            ))}

            <button
              type="button"
              className="continue-shopping"
              onClick={() =>
                navigate('/products')
              }
            >
              <ArrowLeft size={17} />
              Continue shopping
            </button>
          </div>

          <aside className="advanced-order-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>
                Product subtotal ({cartCount}{' '}
                items)
              </span>

              <strong>
                {formatMoney(cartTotal)}
              </strong>
            </div>

            <div className="summary-info">
              Final stock and product prices are
              verified by the backend when your
              order is placed.
            </div>

            <div className="summary-total">
              <span>Grand Total</span>

              <strong>
                {formatMoney(cartTotal)}
              </strong>
            </div>

            <button
              type="button"
              className="proceed-checkout-btn"
              onClick={() =>
                navigate('/checkout')
              }
            >
              Proceed to checkout
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="clear-cart-btn"
              onClick={handleClearCart}
            >
              <Trash2 size={17} />
              Clear cart
            </button>

            <div className="cart-security">
              <ShieldCheck size={23} />

              <div>
                <strong>
                  Cash on Delivery
                </strong>

                <p>
                  Pay safely when your products
                  arrive.
                </p>
              </div>
            </div>

            <div className="cart-farmer-note">
              Products from different farmers will
              automatically be split into separate
              orders during checkout.
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}