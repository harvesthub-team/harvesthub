// src/pages/Home.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Footer from '../components/Footer';
import TypingAnimation from '../components/TypingAnimation';
import OrderProcess from '../components/OrderProcess';
import logoImg from '../assets/logo2.png';
import middlemanImg from '../assets/middleman.jpg';
import freshImg from '../assets/fresh.jpg';
import moneyImg from '../assets/money.jpg';
import farmerImg from '../assets/farmer.jpg';
import { getProducts } from '../services/productServices';
import './Home.css';

import { 
  FaRocket, 
  FaLeaf, 
  FaMoneyBillWave, 
  FaMapMarkerAlt,
  FaCarrot,
  FaAppleAlt,
  FaSeedling,
  FaPepperHot,
  FaLeaf as FaHerb,
  FaStar,
  FaArrowRight,
  FaTruck,
  FaCheckCircle,
  FaShieldAlt,
  FaSync,
  FaUser,
  FaShoppingBag
} from 'react-icons/fa';
import { GiCow } from 'react-icons/gi';
import { MdDeliveryDining, MdVerified, MdSecurity } from 'react-icons/md';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // Welcome Popup State
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Slideshow State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Products State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // ===== ADVANTAGES WITH BACKGROUND IMAGES =====
  const advantages = [
    {
      id: 1,
      title: 'No Middlemen',
      description: 'Buy directly from farmers. Get fresh produce at fair prices.',
      icon: <FaRocket />,
      color: 'rgba(122, 126, 129, 0.82)',
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

  // ===== LOAD PRODUCTS =====
  useEffect(() => {
    const loadProducts = async () => {
      setProductsLoading(true);
      try {
        const response = await getProducts();
        if (response.success) {
          setProducts(response.data);
        } else {
          console.error('Failed to load products:', response.message);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setProductsLoading(false);
      }
    };
    loadProducts();
  }, []);

  // ===== AUTO-PLAY SLIDESHOW =====
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

  // ===== WELCOME POPUP =====
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomePopup(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const closeWelcomePopup = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowWelcomePopup(false);
      setIsClosing(false);
    }, 500);
  };

  // ===== SCROLL-TRIGGERED REVEAL ANIMATIONS =====
  const revealRootRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    const targets = revealRootRef.current
      ? revealRootRef.current.querySelectorAll('.reveal')
      : [];
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // ===== GO TO SLIDE =====
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

  // ===== HARVEST ITEMS =====
  const harvestItems = [
    {  name: 'Carrots', price: 'Rs 120/kg', farm: 'Nuwara Eliya' },
    {  name: 'Tomatoes', price: 'Rs 180/kg', farm: 'Matale' },
    {  name: 'Cabbage', price: 'Rs 90/kg', farm: 'Bandarawela' },
    {  name: 'Bananas', price: 'Rs 150/kg', farm: 'Kegalle' },
    { name: 'Green Chili', price: 'Rs 320/kg', farm: 'Dambulla' },
    {  name:'Brinjals', price: 'Rs 140/kg', farm: 'Anuradhapura' },
    {  name: 'Mangoes', price: 'Rs 350/kg', farm: 'Jaffna' },
    {  name: 'Green Beans', price: 'Rs 200/kg', farm: 'Nuwara Eliya' },
  ];

  // ===== TRUST POINTS =====
  const trustPoints = [
    { icon: '🚚', text: 'Free delivery over Rs 3,000' },
    { icon: '✅', text: '500+ verified farmers' },
    { icon: '🔒', text: 'Secure payments' },
    { icon: '↩️', text: 'Easy replacements on damaged produce' },
  ];

  // ===== TESTIMONIALS =====
  const testimonials = [
    {
      name: 'Chaminda Perera',
      role: 'Buyer from Colombo',
      text: 'HarvestHub changed how I buy vegetables. Fresh produce delivered directly from farmers. Quality is always excellent!',
      rating: 5,
    },
    {
      name: 'Nimal Fernando',
      role: 'Farmer from Kandy',
      text: 'I now sell my produce directly to buyers. No more middlemen taking huge cuts. My income has increased significantly!',
      rating: 5,
    },
    {
      name: 'Samanthi Rajapaksa',
      role: 'Buyer from Galle',
      text: 'The organic produce section is amazing. I know exactly where my food comes from and who grew it.',
      rating: 5,
    },
  ];

  // ===== POPUP GREETING =====
  const getPopupGreeting = () => {
    if (isAuthenticated && user?.fullName) {
      return `Welcome back, ${user.fullName}!`;
    }
    return 'Welcome to HarvestHub';
  };

  const getPopupSubMessage = () => {
    if (isAuthenticated && user?.fullName) {
      return 'So glad to see you again! Fresh produce is waiting for you.';
    }
    return 'Fresh produce directly from Sri Lankan farmers. No middlemen. Fair prices.';
  };

  // ===== STATS =====
  const stats = [
    { number: '500+', label: 'Verified Farmers' },
    { number: '1,200+', label: 'Fresh Products' },
    { number: '25', label: 'Districts Covered' },
    { number: '★ 4.8', label: 'Average Rating' },
  ];

  // ===== CURRENT & PREVIOUS SLIDE =====
  const current = advantages[currentSlide];
  const prevIndex = currentSlide === 0 ? advantages.length - 1 : currentSlide - 1;
  const prev = advantages[prevIndex];

  return (
    <div className="home" ref={revealRootRef}>
      

      {/* ===== WELCOME POPUP ===== */}
      {showWelcomePopup && (
        <div className={`welcome-popup-overlay ${isClosing ? 'closing' : ''}`}>
          <div className={`welcome-popup ${isClosing ? 'closing' : ''}`}>
            <button className="welcome-popup__close" onClick={closeWelcomePopup}>
              ✕
            </button>
            
            <div className="welcome-popup__icon-wrapper">
              <img 
                src={logoImg} 
                alt="HarvestHub" 
                className="welcome-popup__icon-img"
              />
            </div>
            
            <h2 className="welcome-popup__title">
              <TypingAnimation 
                text={getPopupGreeting()} 
                speed={60} 
                delay={200}
              />
            </h2>
            
            <p className="welcome-popup__subtitle">
              {getPopupSubMessage()}
            </p>
            
            <div className="welcome-popup__stats">
              <div className="welcome-popup__stat">
                <span className="welcome-popup__stat-number">500+</span>
                <span className="welcome-popup__stat-label">Farmers</span>
              </div>
              <div className="welcome-popup__stat-divider"></div>
              <div className="welcome-popup__stat">
                <span className="welcome-popup__stat-number">1,200+</span>
                <span className="welcome-popup__stat-label">Products</span>
              </div>
              <div className="welcome-popup__stat-divider"></div>
              <div className="welcome-popup__stat">
                <span className="welcome-popup__stat-number">4.8</span>
                <span className="welcome-popup__stat-label">★ Rating</span>
              </div>
            </div>
            
            <button className="welcome-popup__btn" onClick={closeWelcomePopup}>
              Start Exploring →
            </button>
          </div>
        </div>
      )}

      {/* ===== HERO SECTION ===== */}
      <section className="home-hero">
        <div className="home-hero__bg"></div>
        <div className="home-hero__overlay"></div>
        
        <div className="home-hero__content">
          <div className="home-hero__badge">
            Sri Lanka's Leading Farm-to-Table Platform
          </div>
          
          <h1 className="home-hero__title">
            {isAuthenticated ? (
              <>
                <span className="home-hero__greeting">Welcome back,</span>
                <span className="home-hero__name">{user?.fullName || 'Buyer'}!</span>
              </>
            ) : (
              'Fresh Produce Directly from Sri Lankan Farmers'
            )}
          </h1>
          
          <p className="home-hero__subtitle">
            {isAuthenticated 
              ? 'Discover fresh produce from farmers in your district. Fair prices, quality guaranteed.' 
              : 'No middlemen. Fair prices. Connect directly with Sri Lankan farmers. Join thousands of satisfied buyers.'}
          </p>
          
          <div className="home-hero__buttons">
            <button 
              className="home-hero__btn-primary"
              onClick={() => navigate('/products')}
            >
              Start Shopping
              <span className="home-hero__btn-arrow">→</span>
            </button>
            <button 
              className="home-hero__btn-secondary"
              onClick={() => navigate('/products')}
            >
              Explore Products
            </button>
          </div>

          <div className="home-hero__stats">
            <div className="home-hero__stat stat-stagger-1">
              <span className="home-hero__stat-number">500+</span>
              <span className="home-hero__stat-label">Verified Farmers</span>
            </div>
            <div className="home-hero__stat-divider"></div>
            <div className="home-hero__stat stat-stagger-2">
              <span className="home-hero__stat-number">1,200+</span>
              <span className="home-hero__stat-label">Fresh Products</span>
            </div>
            <div className="home-hero__stat-divider"></div>
            <div className="home-hero__stat stat-stagger-3">
              <span className="home-hero__stat-number">25</span>
              <span className="home-hero__stat-label">Districts Covered</span>
            </div>
            <div className="home-hero__stat-divider"></div>
            <div className="home-hero__stat stat-stagger-4">
              <span className="home-hero__stat-number">★ 4.8</span>
              <span className="home-hero__stat-label">Average Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TODAY'S HARVEST TICKER ===== */}
      <section className="home-ticker reveal reveal--fade">
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

      {/* ===== ORDER PROCESS ===== */}
      <section className="home-order-process reveal reveal--up">
        <div className="home-order-process__container">
          <OrderProcess />
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="home-trust reveal reveal--fade">
        <div className="home-trust__container">
          {trustPoints.map((point, index) => (
            <div
              key={index}
              className="home-trust__item"
              style={{ transitionDelay: `${index * 0.08}s` }}
            >
              <span className="home-trust__icon">{point.icon}</span>
              <span className="home-trust__text">{point.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES SECTION - WITH SLIDESHOW ===== */}
      <section className="home-features">
        <div className="home-features__container">
          <div className="home-section-header reveal reveal--up">
            <span className="home-section-header__tag">Why Choose Us</span>
            <h2 className="home-section-header__title">The HarvestHub Advantage</h2>
            <p className="home-section-header__subtitle">
              We're transforming Sri Lanka's agricultural supply chain by connecting farmers directly with buyers
            </p>
          </div>

          {/* ===== SLIDESHOW WITH BACKGROUND IMAGES ===== */}
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

      {/* ===== CATEGORIES SECTION ===== */}
      <section className="home-categories">
        <div className="home-categories__container">
          <div className="home-section-header home-section-header--light reveal reveal--up">
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
                className="home-categories__card reveal reveal--pop"
                onClick={() => navigate(`/products?category=${category.name.toLowerCase()}`)}
                style={{ '--card-color': category.color, transitionDelay: `${index * 0.08}s` }}
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

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="home-testimonials">
        <div className="home-testimonials__container">
          <div className="home-section-header home-section-header--light reveal reveal--up">
            <span className="home-section-header__tag">Testimonials</span>
            <h2 className="home-section-header__title">What Our Users Say</h2>
            <p className="home-section-header__subtitle">
              Real stories from our community of farmers and buyers
            </p>
          </div>

          <div className="home-testimonials__grid">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="home-testimonials__card reveal reveal--up"
                style={{ transitionDelay: `${index * 0.12}s` }}
              >
                <div className="home-testimonials__rating">
                  {'★'.repeat(testimonial.rating)}
                </div>
                <p className="home-testimonials__text">"{testimonial.text}"</p>
                <div className="home-testimonials__author">
                  <div className="home-testimonials__avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="home-testimonials__name">{testimonial.name}</div>
                    <div className="home-testimonials__role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="home-cta">
        <div className="home-cta__container">
          <div className="home-cta__content reveal reveal--up">
            <h2 className="home-cta__title">Ready to Start Buying Fresh?</h2>
            <p className="home-cta__subtitle">
              Join thousands of buyers who are getting fresh produce directly from farmers
            </p>
            <div className="home-cta__buttons">
              <button 
                className="home-cta__btn-primary"
                onClick={() => navigate('/products')}
              >
                Browse Products
                <span className="home-cta__btn-arrow">→</span>
              </button>
              {!isAuthenticated && (
                <button 
                  className="home-cta__btn-secondary"
                  onClick={() => navigate('/register')}
                >
                  Create Account
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}