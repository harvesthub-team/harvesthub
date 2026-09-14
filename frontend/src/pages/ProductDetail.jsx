// src/pages/ProductDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getProductById } from '../services/productServices';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getProductById(id);
      if (response.success) {
        setProduct(response.data);
        setQuantity(1);
      } else {
        setError(response.message || 'Product not found');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > (product?.quantity || 99)) newQuantity = product.quantity;
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert('🔒 Please login first to add items to cart!');
      return;
    }
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 700);
    alert(`✅ Added ${quantity} × ${product.name} to cart!`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Loading state
  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="product-detail-loading__spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-detail-error">
        <p>😕 {error}</p>
        <button type="button" onClick={fetchProduct}>Try Again</button>
        <button type="button" onClick={handleGoBack}>Go Back</button>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="product-detail-error">
        <p>Product not found</p>
        <button type="button" onClick={handleGoBack}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="product-detail__container">
        {/* Back Button */}
        <button type="button" className="product-detail__back" onClick={handleGoBack}>
          ← Back to Products
        </button>

        <div className="product-detail__main">
          {/* Image */}
          <div className="product-detail__image-wrapper product-detail__image-wrapper--reveal">
            {product.images && product.images[0] ? (
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="product-detail__image"
              />
            ) : (
              <div className="product-detail__image-placeholder">
                🌾
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-detail__info">
            <h1 className="product-detail__name">{product.name}</h1>
            
            <div className="product-detail__farmer">
              <span>By {product.farmerName}</span>
              <span className="product-detail__farmer-location">
                📍 {product.farmerDistrict}
              </span>
            </div>

            <div className="product-detail__rating">
              ⭐ {product.rating} ({product.reviewCount} reviews)
            </div>

            <div className="product-detail__price">
              <span>{formatPrice(product.price)}</span>
              <span className="product-detail__price-unit">/ {product.unit}</span>
            </div>

            <div className="product-detail__badges">
              {product.organic && (
                <span className="product-detail__badge product-detail__badge--organic">
                  🌱 Organic
                </span>
              )}
              {product.isAvailable ? (
                <span className="product-detail__badge product-detail__badge--in-stock">
                  ✅ In Stock ({product.quantity} {product.unit} available)
                </span>
              ) : (
                <span className="product-detail__badge product-detail__badge--out-of-stock">
                  ❌ Out of Stock
                </span>
              )}
              <span className="product-detail__badge product-detail__badge--category">
                {product.category}
              </span>
            </div>

            <div className="product-detail__description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="product-detail__details">
              <div className="product-detail__detail-item">
                <span className="product-detail__detail-label">Available Quantity</span>
                <span className="product-detail__detail-value">
                  {product.quantity} {product.unit}
                </span>
              </div>
              <div className="product-detail__detail-item">
                <span className="product-detail__detail-label">Category</span>
                <span className="product-detail__detail-value capitalize">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Add to Cart Section */}
            {product.isAvailable && (
              <div className="product-detail__cart-section">
                {!isAuthenticated ? (
                  <div className="product-detail__login-message">
                    <p>🔒 Please login to add items to cart</p>
                    <button type="button" 
                      className="product-detail__login-btn"
                      onClick={() => navigate('/login')}
                    >
                      Login Now
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="product-detail__quantity">
                      <label>Quantity</label>
                      <div className="product-detail__quantity-controls">
                        <button type="button" 
                          className="product-detail__qty-btn"
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                        >
                          −
                        </button>
                        <span className="product-detail__qty-value">{quantity}</span>
                        <button type="button" 
                          className="product-detail__qty-btn"
                          onClick={() => handleQuantityChange(quantity + 1)}
                          disabled={quantity >= product.quantity}
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="product-detail__quick-qty">
                        <button type="button" onClick={() => handleQuantityChange(1)}>1</button>
                        <button type="button" onClick={() => handleQuantityChange(5)}>5</button>
                        <button type="button" onClick={() => handleQuantityChange(10)}>10</button>
                        <button type="button" onClick={() => handleQuantityChange(product.quantity)}>
                          Max ({product.quantity})
                        </button>
                      </div>
                    </div>

                    <div className="product-detail__total" key={quantity}>
                      Total: {formatPrice(product.price * quantity)}
                    </div>

                    <button type="button" 
                      className={`product-detail__add-btn ${justAdded ? 'product-detail__add-btn--added' : ''}`}
                      onClick={handleAddToCart}
                    >
                      {justAdded ? '✅ Added to Cart!' : `🛒 Add ${quantity} × ${product.unit} to Cart`}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}