// src/components/ProductCard.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProductCard.css';

export default function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleClick = () => {
    navigate(`/products/${product._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('🔒 Please login first to add items to cart!');
      return;
    }
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  // price field එක හරියට handle කරන්න
  const price = product.price || product.pricePerUnit || 0;
  const unit = product.unit || 'kg';
  const farmerName = product.farmerName || product.farmerId?.fullName || 'Farm';
  const farmerDistrict = product.farmerDistrict || product.district || '';
  const image = product.images?.[0] || null;
  const isAvailable = product.isAvailable !== undefined ? product.isAvailable : true;
  const organic = product.organic || false;
  const rating = product.rating || 0;
  const reviewCount = product.reviewCount || 0;
  const quantity = product.quantity || 0;

  const formattedPrice = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
  }).format(price);

  return (
    <div className="product-card" onClick={handleClick}>
      <div className="product-card__image-wrapper">
        {image ? (
          <img 
            src={image} 
            alt={product.name}
            className="product-card__image"
          />
        ) : (
          <div className="product-card__image-placeholder">🌾</div>
        )}
        
        {organic && (
          <span className="product-card__badge product-card__badge--organic">
            🌱 Organic
          </span>
        )}
        
        <span className={`product-card__badge product-card__badge--${isAvailable ? 'in-stock' : 'out-of-stock'}`}>
          {isAvailable ? '✅ In Stock' : '❌ Out of Stock'}
        </span>
      </div>

      <div className="product-card__content">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__farmer">
          {farmerName}{farmerDistrict ? ` • ${farmerDistrict}` : ''}
        </p>
        
        <div className="product-card__price-row">
          <span className="product-card__price">{formattedPrice}</span>
          <span className="product-card__unit">/ {unit}</span>
        </div>
        
        <div className="product-card__meta">
          <span className="product-card__rating">⭐ {rating} ({reviewCount})</span>
          <span className="product-card__quantity">{quantity} {unit} avail.</span>
        </div>
        
        {isAvailable && (
          <button 
            className="product-card__add-btn"
            onClick={handleAddToCart}
            disabled={!isAuthenticated}
          >
            {isAuthenticated ? '🛒 Add to Cart' : '🔒 Login to Add'}
          </button>
        )}
      </div>
    </div>
  );
}