import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ShieldCheck, BadgeCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

// ✅ IMPORT LOCAL IMAGES
import image1 from '../assets/image1.jpg';
import image2 from '../assets/image2.jpg';
import image3 from '../assets/image3.jpg';
import image4 from '../assets/image4.jpg';
import image5 from '../assets/image5.jpg';
import image6 from '../assets/image6.jpg';

// ✅ USE LOCAL IMAGES
const HERO_IMAGE_URLS = [image1, image2, image3, image4, image5, image6];

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ PRELOAD IMAGES FOR SMOOTH SWITCHING
  useEffect(() => {
    HERO_IMAGE_URLS.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // ✅ REMEMBER ME — Auto-fill email on page load
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        const user = result.user;
        if (user?.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user?.role === 'farmer') {
          navigate('/farmer/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(result.message || 'Invalid email or password');
        setIsSubmitting(false);
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`${provider} login coming soon!`);
  };

  const handleForgotPassword = () => {
    alert('Password reset feature coming soon!');
  };

  return (
    <div className="auth-page">
      {/* Left panel — brand photo */}
      <div className="auth-hero">
        <div className="auth-hero__mosaic" aria-label="HarvestHub farming and community imagery">
          {HERO_IMAGE_URLS.map((image, index) => (
            <div
              key={image}
              className={`hero-mosaic__item hero-mosaic__item--${index + 1}`}
            >
              <img src={image} alt="HarvestHub agricultural scene" />
            </div>
          ))}
        </div>
        <div className="auth-hero__overlay" />

        <div className="auth-hero__content">
          <blockquote className="auth-hero__testimonial">
            <p className="testimonial-quote">
              "Selling straight to buyers doubled what I earn per sack of rice."
            </p>
            <footer className="testimonial-footer">
              <div className="testimonial-avatar">JP</div>
              <div>
                <div className="testimonial-name">Jayantha Perera</div>
                <div className="testimonial-location">Polonnaruwa District</div>
              </div>
            </footer>
          </blockquote>

          <div className="auth-hero__stats">
            <div className="stat-card">
              <div className="stat-value">2,400+</div>
              <div className="stat-label">Growers onboard</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">Rs. 48M</div>
              <div className="stat-label">Paid directly to farmers last month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-form-panel">
        <div className="auth-form-panel__decor" aria-hidden="true" />

        <div className="auth-card">
          <div className="mode-toggle" role="tablist" aria-label="Login or register">
            <button
              type="button"
              role="tab"
              className="mode-toggle__btn mode-toggle__btn--active"
              aria-selected="true"
              disabled
            >
              Log in
            </button>
            <button
              type="button"
              role="tab"
              className="mode-toggle__btn"
              aria-selected="false"
              onClick={() => navigate('/register')}
            >
              Register
            </button>
          </div>

          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-subheading">Sign in to your HarvestHub account.</p>

          <div className="social-buttons">
            <button
              type="button"
              className="social-btn"
              onClick={() => handleSocialLogin('Google')}
            >
              <GoogleIcon /> Continue with Google
            </button>
            <button
              type="button"
              className="social-btn"
              onClick={() => handleSocialLogin('Facebook')}
            >
              <FacebookIcon /> Continue with Facebook
            </button>
          </div>

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && <div className="field-error">{error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="password">Password</label>
                <button 
                  type="button" 
                  className="forgot-link"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>
              <div className="password-field">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-row remember-me-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={18} className="spinner" /> : 'Log in'}
            </button>
          </form>

          <div className="trust-row">
            <span className="trust-item">
              <ShieldCheck size={14} /> Secure & encrypted
            </span>
            <span className="trust-item">
              <BadgeCheck size={14} /> Verified farmers
            </span>
          </div>

          <p className="switch-mode-text">
            Don't have an account?{' '}
            <button type="button" className="switch-mode-link" onClick={() => navigate('/register')}>
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.9v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.95 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.9a9 9 0 0 0 0 8.08l3.05-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.96l3.05 2.33C4.66 5.16 6.65 3.58 9 3.58Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#1877F2" d="M18 9a9 9 0 1 0-10.4 8.89v-6.29H5.31V9h2.29V7a3.19 3.19 0 0 1 3.41-3.51c.99 0 2.02.17 2.02.17v2.22h-1.14c-1.12 0-1.47.7-1.47 1.42V9h2.5l-.4 2.6h-2.1v6.29A9 9 0 0 0 18 9Z" />
    </svg>
  );
}

export default memo(Login);