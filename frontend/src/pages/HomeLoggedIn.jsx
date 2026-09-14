// src/pages/HomeLoggedIn.jsx - HarvestHub buyer home
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

import Footer from '../components/Footer';
import TypingAnimation from '../components/TypingAnimation';
import OrderProcess from '../components/OrderProcess';
import middlemanImg from '../assets/middleman.jpg';
import freshImg from '../assets/fresh.jpg';
import moneyImg from '../assets/money.jpg';
import farmerImg from '../assets/farmer.jpg';
import {
  FaRocket,
  FaLeaf,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaArrowRight,
  FaSearch,
  FaTruck,
  FaCheckCircle,
  FaReceipt,
  FaStar,
  FaCarrot,
  FaAppleAlt,
  FaSeedling,
  FaPepperHot,
  FaLeaf as FaHerb
} from 'react-icons/fa';
import { GiCow } from 'react-icons/gi';
import { MdVerified, MdDeliveryDining } from 'react-icons/md';
import './HomeLoggedIn.css';
import './Home.css';

export default function HomeLoggedIn() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sectionRefs = useRef([]);

  // ===== SCROLL ANIMATIONS =====
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    sectionRefs.current.forEach((section) => {
      if (!section) return;

      observer.observe(section);
      section.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products');
    }
  };

  // ===== STATS =====
  const stats = [
    { number: '500+', label: 'Verified farmers' },
    { number: '1,200+', label: 'Fresh products' },
    { number: '25', label: 'Districts covered' },
    { number: '4.8', label: 'Average rating' },
  ];

  // ===== ADVANTAGES WITH BACKGROUND IMAGES (SAME AS HOME) =====
  const advantages = [
    {
      id: 1,
      title: 'No Middlemen',
      description: 'Buy directly from farmers. Get fresh produce at fair prices.',
      icon: <FaRocket />,
      color: 'rgba(26, 58, 42, 0.82)',
      bgImage: middlemanImg
    },
    {
      id: 2,
      title: '100% Fresh',
      description: 'Farm-fresh produce harvested within 24-48 hours of delivery.',
      icon: <FaLeaf />,
      color: 'rgba(122, 126, 129, 0.82)',
      bgImage: freshImg
    },
    {
      id: 3,
      title: 'Best Prices',
      description: 'Save up to 40% compared to traditional market prices.',
      icon: <FaMoneyBillWave />,
      color: 'rgba(255, 152, 0, 0.82)',
      bgImage: moneyImg
    },
    {
      id: 4,
      title: 'Local Farmers',
      description: 'Connect with verified farmers in your district.',
      icon: <FaMapMarkerAlt />,
      color: 'rgba(156, 39, 176, 0.82)',
      bgImage: farmerImg
    }
  ];

  // ===== AUTO-PLAY SLIDESHOW (SAME AS HOME) =====
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % advantages.length);
        setIsTransitioning(false);
      }, 600);
    }, 4000);

    return () => clearInterval(interval);
  }, [advantages.length]);

  // ===== GO TO SLIDE (SAME AS HOME) =====
  const goToSlide = (index) => {
    if (index === currentSlide) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 600);
  };

  // ===== CATEGORIES =====
  const categories = [
    { name: 'Vegetables', icon: <FaCarrot />, color: '#4CAF50', count: '120+' },
    { name: 'Fruits', icon: <FaAppleAlt />, color: '#FF6B6B', count: '85+' },
    { name: 'Grains', icon: <FaSeedling />, color: '#F4A460', count: '65+' },
    { name: 'Spices', icon: <FaPepperHot />, color: '#D32F2F', count: '45+' },
    { name: 'Dairy', icon: <GiCow />, color: '#64B5F6', count: '30+' },
    { name: 'Herbs', icon: <FaHerb />, color: '#66BB6A', count: '25+' },
  ];

  const harvestItems = [
    {  name: 'Carrots', price: 'Rs 120/kg', farm: 'Nuwara Eliya' },
    { name: 'Tomatoes', price: 'Rs 180/kg', farm: 'Matale' },
    {  name: 'Cabbage', price: 'Rs 90/kg', farm: 'Bandarawela' },
    {  name: 'Bananas', price: 'Rs 150/kg', farm: 'Kegalle' },
    { name: 'Green Chili', price: 'Rs 320/kg', farm: 'Dambulla' },
    {  name: 'Brinjals', price: 'Rs 140/kg', farm: 'Anuradhapura' },
    {  name: 'Mangoes', price: 'Rs 350/kg', farm: 'Jaffna' },
    { name: 'Green Beans', price: 'Rs 200/kg', farm: 'Nuwara Eliya' },
  ];

 

  const firstName = (user?.fullName || 'there').split(' ')[0];

  // ===== GET CURRENT AND PREVIOUS SLIDE =====
  const current = advantages[currentSlide];
  const prevIndex = currentSlide === 0 ? advantages.length - 1 : currentSlide - 1;
  const prev = advantages[prevIndex];

  return (
    <div className={`home-logged-in ${isVisible ? 'visible' : ''}`}>
     

      {/* ===== HERO ===== */}
      <section className="home-logged-in__hero">
        <div className="home-logged-in__hero-bg"></div>
        <div className="home-logged-in__hero-overlay"></div>
        <div className="home-logged-in__floating-shapes">
          <div className="shape shape--1">🍅</div>
          <div className="shape shape--2">🌾</div>
          <div className="shape shape--3">🥥</div>
          <div className="shape shape--4">🌶️</div>
          <div className="shape shape--5">🥭</div>
        </div>

        <div className="home-logged-in__hero-content">
          <div className="home-logged-in__hero-greeting animate-stagger">
            <div className="home-logged-in__hero-badge">🌱 Farm to Table</div>
            <h1 className="home-logged-in__hero-title">
              <TypingAnimation
                text={`Welcome back, ${firstName}`}
                speed={50}
                delay={300}
              />
              <span className="home-logged-in__hero-wave">👋</span>
            </h1>
            <p className="home-logged-in__hero-subtitle">
              Fresh produce from farmers across Sri Lanka, picked and shipped within a day or two of harvest.
            </p>

            <form className="home-logged-in__hero-search" onSubmit={handleSearch}>
              <FaSearch className="home-logged-in__hero-search-icon" />
              <input
                type="text"
                className="home-logged-in__hero-search-input"
                placeholder="Search for vegetables, fruits, spices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="home-logged-in__hero-search-btn">
                Search
              </button>
            </form>

            <div className="home-logged-in__hero-links">
              <button className="home-logged-in__hero-link" onClick={() => navigate('/cart')}>
                🛒 Cart ({cartCount})
              </button>
              <button className="home-logged-in__hero-link" onClick={() => navigate('/dashboard')}>
                📊 Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TODAY'S HARVEST TICKER ===== */}
      <section className="home-ticker">
        <div className="home-ticker__label">
          <span className="home-ticker__pulse"></span>
          Today's Harvest
        </div>
        <div className="home-ticker__track">
          <div className="home-ticker__row">
            {[...harvestItems, ...harvestItems].map((item, index) => (
              <div key={index} className="home-ticker__item">
                <span className="home-ticker__emoji">{item.emoji}</span>
                <span className="home-ticker__name">{item.name}</span>
                <span className="home-ticker__price">{item.price}</span>
                <span className="home-ticker__farm">from {item.farm}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <div className="home-logged-in__stat-strip animate-stagger">
        <div className="home-logged-in__stat-strip-inner">
          {stats.map((stat, index) => (
            <div key={index} className="home-logged-in__stat">
              <span className="home-logged-in__stat-number">{stat.number}</span>
              <span className="home-logged-in__stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== RECOMMENDED PRODUCTS ===== */}
      <section className="home-logged-in__section--tinted" ref={(el) => (sectionRefs.current[0] = el)}>
        <div className="home-logged-in__section-inner">
          <div className="home-logged-in__section-header">
            <div>
              <h2 className="home-logged-in__section-title">🔥 Recommended for you</h2>
              <p className="home-logged-in__section-subtitle">Based on what's popular with buyers near you</p>
            </div>
            <button className="home-logged-in__section-link" onClick={() => navigate('/products')}>
              View all <FaArrowRight size={13} />
            </button>
          </div>
          <div className="home-logged-in__trending">
            {trendingProducts.map((product, index) => (
              <div
                key={product.id}
                className="home-logged-in__trending-card card-stagger"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="home-logged-in__trending-image">
                  <img src={product.image} alt={product.name} />
                  {product.rating >= 4.5 && (
                    <span className="home-logged-in__trending-badge">⭐ Top rated</span>
                  )}
                </div>
                <div className="home-logged-in__trending-body">
                  <h4 className="home-logged-in__trending-name">{product.name}</h4>
                  <p className="home-logged-in__trending-farmer">{product.farmer}</p>
                  <div className="home-logged-in__trending-footer">
                    <span className="home-logged-in__trending-price">Rs {product.price}</span>
                    <span className="home-logged-in__trending-sold">{product.sold} sold</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES SECTION ===== */}
      <section className="home-categories home-logged-in__categories" ref={(el) => (sectionRefs.current[1] = el)}>
        <div className="home-categories__container">
          <div className="home-section-header home-section-header--light">
            <span className="home-section-header__tag">Shop by Category</span>
            <h2 className="home-section-header__title">Find Your Favorite Produce</h2>
            <p className="home-section-header__subtitle">
              Browse through our wide range of fresh produce categories
            </p>
          </div>
          <div className="home-categories__grid">
          {categories.map((category, index) => (
            <div
              key={index}
              className="home-categories__card"
              onClick={() => navigate(`/products?category=${category.name.toLowerCase()}`)}
              style={{ '--card-color': category.color }}
            >
              <div className="home-categories__icon-wrapper">
                <span className="home-categories__icon">{category.icon}</span>
              </div>
              <h3 className="home-categories__name">{category.name}</h3>
              <span className="home-categories__count">{category.count} products</span>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* ===== WHY HARVESTHUB - SLIDESHOW ===== */}
      <section className="home-features" ref={(el) => (sectionRefs.current[2] = el)}>
        <div className="home-features__container">
          <div className="home-section-header reveal reveal--up">
            <span className="home-section-header__tag">Why Choose Us</span>
            <h2 className="home-section-header__title">The HarvestHub Advantage</h2>
            <p className="home-section-header__subtitle">
              We're transforming Sri Lanka's agricultural supply chain by connecting farmers directly with buyers
            </p>
          </div>

          <div className="home-features__slideshow reveal reveal--up">
            <div className="advantage-slideshow">
              <div className="advantage-slideshow__track">
                {/* Previous slide */}
                <div 
                  className={`advantage-slideshow__slide advantage-slideshow__slide--prev ${isTransitioning ? 'exiting' : ''}`}
                  style={{
                    backgroundImage: `linear-gradient(${prev.color}, ${prev.color}), url(${prev.bgImage})`,
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundBlendMode: 'overlay'
                  }}
                >
                  <div className="advantage-slideshow__content">
                    <div className="advantage-slideshow__icon">{prev.icon}</div>
                    <h3 className="advantage-slideshow__title">{prev.title}</h3>
                    <p className="advantage-slideshow__description">{prev.description}</p>
                  </div>
                </div>

                {/* Current slide */}
                <div 
                  className={`advantage-slideshow__slide advantage-slideshow__slide--active ${isTransitioning ? 'entering' : ''}`}
                  style={{
                    backgroundImage: `linear-gradient(${current.color}, ${current.color}), url(${current.bgImage})`,
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundBlendMode: 'overlay'
                  }}
                >
                  <div className="advantage-slideshow__content">
                    <div 
                      className="advantage-slideshow__icon-wrapper"
                      style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}
                    >
                      <span className="advantage-slideshow__icon">{current.icon}</span>
                    </div>
                    <h3 className="advantage-slideshow__title">{current.title}</h3>
                    <p className="advantage-slideshow__description">{current.description}</p>
                  </div>
                </div>
              </div>

              {/* Dots Navigation */}
              <div className="advantage-slideshow__dots">
                {advantages.map((_, index) => (
                  <button
                    key={index}
                    className={`advantage-slideshow__dot ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ORDER PROCESS ===== */}
      <section className="home-logged-in__order-process" ref={(el) => (sectionRefs.current[3] = el)}>
        <div className="home-logged-in__section-header">
          <div>
            <h2 className="home-logged-in__section-title">📦 How it works</h2>
            <p className="home-logged-in__section-subtitle">
              From farm to your table in three easy steps
            </p>
          </div>
        </div>
        <OrderProcess />
      </section>

      {/* ===== TRUST STRIP ===== */}
      <section className="home-logged-in__trust" ref={(el) => (sectionRefs.current[4] = el)}>
        <div className="home-logged-in__trust-grid">
          <div className="home-logged-in__trust-item">
            <MdVerified className="home-logged-in__trust-icon" />
            <span>Verified farmers</span>
          </div>
          <div className="home-logged-in__trust-item">
            <MdDeliveryDining className="home-logged-in__trust-icon" />
            <span>Free delivery over Rs 3,000</span>
          </div>
          <div className="home-logged-in__trust-item">
            <FaTruck className="home-logged-in__trust-icon" />
            <span>24-48 hour delivery</span>
          </div>
          <div className="home-logged-in__trust-item">
            <FaCheckCircle className="home-logged-in__trust-icon" />
            <span>Quality guaranteed</span>
          </div>
          <div className="home-logged-in__trust-item">
            <FaReceipt className="home-logged-in__trust-icon" />
            <span>Transparent pricing</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}