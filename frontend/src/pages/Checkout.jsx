import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  UserRound,
  Banknote,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../services/orderService';
import './Checkout.css';

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-LK')}`;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: '',
    address: '',
    district: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    const shippingAddress = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      district: form.district.trim(),
    };

    if (Object.values(shippingAddress).some((value) => !value)) {
      setError('Please complete all delivery fields.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await placeOrder(cartItems, shippingAddress);
      clearCart();

      navigate('/my-orders', {
        state: {
          successMessage: result.message || 'Order placed successfully',
        },
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to place your order. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="orders-page">
        <section className="orders-shell checkout-empty">
          <h1>No items to checkout</h1>
          <p>Add products to your cart before placing an order.</p>
          <button
            className="orders-primary-btn"
            type="button"
            onClick={() => navigate('/products')}
          >
            Browse products
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <section className="orders-shell">
        <div className="orders-heading">
          <div>
            <span className="orders-kicker">Secure checkout</span>
            <h1>Delivery & payment</h1>
            <p>Enter the address where you want to receive your produce.</p>
          </div>
        </div>

        <form className="checkout-layout" onSubmit={handleSubmit}>
          <div className="checkout-main">
            <section className="checkout-card">
              <h2>Delivery details</h2>

              <label className="checkout-field">
                <span><UserRound size={16} /> Full name</span>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </label>

              <label className="checkout-field">
                <span><Phone size={16} /> Phone number</span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="07XXXXXXXX"
                />
              </label>

              <label className="checkout-field">
                <span><MapPin size={16} /> Street address</span>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="House no., road, town"
                />
              </label>

              <label className="checkout-field">
                <span><MapPin size={16} /> District</span>
                <input
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="e.g. Gampaha"
                />
              </label>
            </section>

            <section className="checkout-card">
              <h2>Payment method</h2>
              <div className="payment-option payment-option--selected">
                <div className="payment-option__icon">
                  <Banknote size={24} />
                </div>
                <div>
                  <strong>Cash on Delivery</strong>
                  <p>Pay when your order is delivered to you.</p>
                </div>
                <span className="payment-option__check">✓</span>
              </div>

              <div className="checkout-security">
                <ShieldCheck size={18} />
                The backend currently accepts Cash on Delivery only. No card
                details are collected by HarvestHub.
              </div>
            </section>

            {error && <div className="checkout-error">{error}</div>}
          </div>

          <aside className="checkout-summary">
            <span className="orders-kicker">Order summary</span>

            <div className="checkout-summary__items">
              {cartItems.map((item) => (
                <div key={item.productId}>
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <strong>
                    {formatMoney(item.pricePerUnit * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-summary__total">
              <span>Total</span>
              <strong>{formatMoney(cartTotal)}</strong>
            </div>

            <p className="checkout-summary__note">
              If your cart contains products from different farmers, the
              backend automatically creates a separate order for each farmer.
            </p>

            <button
              className="orders-primary-btn checkout-place-btn"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Placing order...' : 'Place order'}
            </button>
          </aside>
        </form>
      </section>
    </main>
  );
}
