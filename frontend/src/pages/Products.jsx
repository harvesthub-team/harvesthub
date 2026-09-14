// src/pages/Products.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { getProducts, categories, districts } from '../services/productServices';
import './Products.css';

export default function Products() {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  
  const [filters, setFilters] = useState({
    search: '',
    category: searchParams.get('category') || '',
    district: '',
    minPrice: '',
    maxPrice: '',
    organic: false,
    sort: 'newest'
  });

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || '';
    setFilters(prev => (
      prev.category === categoryFromUrl ? prev : { ...prev, category: categoryFromUrl }
    ));
  }, [searchParams]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const gridRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.fade-in').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [products]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getProducts(filters);
      if (response.success) {
        setProducts(response.data);
        setCurrentPage(1);
      } else {
        setError(response.message || 'Failed to load products');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      district: '',
      minPrice: '',
      maxPrice: '',
      organic: false,
      sort: 'newest'
    });
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      alert('🔒 Please login first to add items to cart!');
      return;
    }
    alert(`✅ Added ${product.name} to cart!`);
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const total = totalPages;
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(total - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  };

  return (
    <div className="products-page">
      {/* Navbar එක App.jsx එකෙන් එනවා */}
      
      <section className="products-header fade-in">
        <div className="products-header__overlay"></div>
        <div className="products-header__content">
          <h1 className="products-header__title">All Products</h1>
          <p className="products-header__subtitle">
            Discover fresh produce from farmers across Sri Lanka
          </p>
          <div className="products-header__breadcrumb">
            <span>Home</span>
            <span className="products-header__breadcrumb-separator">›</span>
            <span className="products-header__breadcrumb-current">Products</span>
          </div>
        </div>
      </section>

      <section className="products-filters fade-in">
        <div className="products-filters__container">
          <form className="products-filters__search" onSubmit={handleSearch}>
            <input
              type="text"
              className="products-filters__search-input"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <button type="submit" className="products-filters__search-btn">
              Search
            </button>
          </form>

          <div className="products-filters__grid">
            <select 
              className="products-filters__select"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select 
              className="products-filters__select"
              value={filters.district}
              onChange={(e) => handleFilterChange('district', e.target.value)}
            >
              <option value="">All Districts</option>
              {districts.map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>

            <input 
              type="number" 
              className="products-filters__input"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
            <input 
              type="number" 
              className="products-filters__input"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />

            <select 
              className="products-filters__select"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>

            <label className="products-filters__checkbox">
              <input 
                type="checkbox" 
                checked={filters.organic}
                onChange={(e) => handleFilterChange('organic', e.target.checked)}
              />
              Organic Only
            </label>

            <button 
              type="button"
              className="products-filters__clear"
              onClick={clearFilters}
            >
              Clear All
            </button>
          </div>
        </div>
      </section>

      <section className="products-content" ref={gridRef}>
        <div className="products-content__header fade-in">
          <div className="products-content__info">
            <span className="products-content__count">
              Showing {currentProducts.length} of {products.length} products
            </span>
          </div>
          
          <div className="products-content__controls">
            <button 
              type="button"
              className={`products-content__view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button 
              type="button"
              className={`products-content__view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
        </div>

        {loading && (
          <div className="products-loading">
            <div className="products-loading__spinner"></div>
            <p>Loading fresh produce...</p>
          </div>
        )}

        {error && (
          <div className="products-error">
            <p>{error}</p>
            <button type="button" onClick={fetchProducts}>Try Again</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {currentProducts.length === 0 ? (
              <div className="products-empty fade-in">
                <span className="products-empty__icon">No products found</span>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button type="button" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className={`products-grid products-grid--${viewMode}`}>
                  {currentProducts.map((product, index) => (
                    <div 
                      key={product._id} 
                      className="fade-in products-grid__item"
                      style={{ transitionDelay: `${Math.min(index, 11) * 0.06}s` }}
                    >
                      <ProductCard 
                        product={product} 
                        onAddToCart={handleAddToCart}
                      />
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="products-pagination fade-in">
                    <button 
                      type="button"
                      className="products-pagination__btn"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      ← Previous
                    </button>
                    
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="products-pagination__ellipsis">…</span>
                      ) : (
                        <button 
                          type="button"
                          key={page}
                          className={`products-pagination__btn ${page === currentPage ? 'active' : ''}`}
                          onClick={() => goToPage(page)}
                        >
                          {page}
                        </button>
                      )
                    ))}
                    
                    <button 
                      type="button"
                      className="products-pagination__btn"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}