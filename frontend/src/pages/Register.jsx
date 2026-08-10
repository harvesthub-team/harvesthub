import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout,
  ShoppingCart,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  BadgeCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Register.css';
// ✅ IMPORT LOCAL IMAGES
import image1 from '../assets/image1.jpg';
import image2 from '../assets/image2.jpg';
import image3 from '../assets/image3.jpg';
import image4 from '../assets/image4.jpg';
import image5 from '../assets/image5.jpg';
import image6 from '../assets/image6.jpg';


// ✅ USE LOCAL IMAGES
const HERO_IMAGE_URLS = [image1, image2, image3, image4, image5, image6];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(?:\+94|0)[0-9]{9}$/;

const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle',
  'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle',
  'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala',
  'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura',
  'Trincomalee', 'Vavuniya',
];

const initialFormState = {
  fullName: '',
  email: '',
  phone: '',
  district: '',
  farmName: '',
  location: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false,
};

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState('buyer');
  const [form, setForm] = useState(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [policyType, setPolicyType] = useState(null);

  // ✅ PRELOAD IMAGES FOR SMOOTH SWITCHING
  useEffect(() => {
    HERO_IMAGE_URLS.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  function handleChange(field) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };
  }

  function validate() {
    const nextErrors = {};

    if (form.fullName.trim().length < 2) {
      nextErrors.fullName = 'Enter your full name';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone number is required';
    } else if (!PHONE_REGEX.test(form.phone.trim().replace(/\s+/g, ''))) {
      nextErrors.phone = 'Enter a valid phone, e.g. 07XXXXXXXX';
    }

    if (!form.district) {
      nextErrors.district = 'Select your district';
    }

    if (role === 'farmer') {
      if (!form.farmName.trim()) {
        nextErrors.farmName = 'Enter your farm name';
      }
      if (!form.location.trim()) {
        nextErrors.location = 'Enter your farm location';
      }
    }

    if (!form.password) {
      nextErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    if (!form.agreeTerms) {
      nextErrors.agreeTerms = 'You must accept the Terms & Privacy Policy';
    }

    return nextErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: role,
        phone: form.phone.trim(),
        district: form.district,
      };

      if (role === 'farmer') {
        userData.farmName = form.farmName.trim();
        userData.location = form.location.trim();
      }

      const result = await register(userData);

      if (result.success) {
        navigate('/login');
      } else {
        setErrors({ general: result.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSocialLogin(provider) {
    setSocialLoading(provider);
    alert(`${provider} login coming soon!`);
    setSocialLoading(null);
  }

  const policyContent = {
    terms: {
      title: 'HarvestHub Marketplace Terms',
      body:
        'HarvestHub connects farmers and buyers for transparent agricultural trade. By using the platform, users agree to list accurate produce details, maintain honest pricing, and follow safe marketplace practices. We reserve the right to review listings that misrepresent products, misuse farm data, or violate fair trade standards.',
    },
    privacy: {
      title: 'Grower & Buyer Privacy Policy',
      body:
        'We protect farmer and buyer information used for agricultural transactions, secure account access, and delivery coordination. Contact details, farm location, and profile information may be used to improve marketplace trust, verify produce listings, and support communication between growers and buyers. Personal data is never sold to third parties and is kept only as needed to provide the HarvestHub service.',
    },
  };

  const isRegistrationComplete = (() => {
    if (!form.fullName.trim()) return false;
    if (!form.email.trim() || !EMAIL_REGEX.test(form.email.trim())) return false;
    if (!form.phone.trim() || !PHONE_REGEX.test(form.phone.trim().replace(/\s+/g, ''))) return false;
    if (!form.district) return false;
    if (role === 'farmer') {
      if (!form.farmName.trim() || !form.location.trim()) return false;
    }
    if (!form.password || form.password.length < 6) return false;
    if (form.confirmPassword !== form.password) return false;
    if (!form.agreeTerms) return false;

    return true;
  })();

  return (
    <div className="auth-page">
      {/* Left panel — brand photo (Mosaic — same as Login) */}
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
              className="mode-toggle__btn"
              aria-selected="false"
              onClick={() => navigate('/login')}
            >
              Log in
            </button>
            <button
              type="button"
              className="mode-toggle__btn mode-toggle__btn--active"
              aria-selected="true"
              disabled
            >
              Register
            </button>
          </div>

          <h1 className="auth-heading">Create your account</h1>
          <p className="auth-subheading">Join thousands of farmers and buyers on HarvestHub.</p>

          <div className="social-buttons">
            <button
              type="button"
              className="social-btn"
              onClick={() => handleSocialLogin('Google')}
              disabled={socialLoading !== null}
            >
              {socialLoading === 'Google' ? <Loader2 size={18} className="spinner" /> : <GoogleIcon />}
              Continue with Google
            </button>
            <button
              type="button"
              className="social-btn"
              onClick={() => handleSocialLogin('Facebook')}
              disabled={socialLoading !== null}
            >
              {socialLoading === 'Facebook' ? <Loader2 size={18} className="spinner" /> : <FacebookIcon />}
              Continue with Facebook
            </button>
          </div>

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="role-selector">
              <button
                type="button"
                className={`role-card ${role === 'farmer' ? 'role-card--active' : ''}`}
                onClick={() => setRole('farmer')}
                aria-pressed={role === 'farmer'}
              >
                <span className="role-icon-wrap"><Sprout size={18} /></span>
                <span className="role-label">I'm a Farmer</span>
                <span className="role-sub">List and sell produce</span>
              </button>
              <button
                type="button"
                className={`role-card ${role === 'buyer' ? 'role-card--active' : ''}`}
                onClick={() => setRole('buyer')}
                aria-pressed={role === 'buyer'}
              >
                <span className="role-icon-wrap"><ShoppingCart size={18} /></span>
                <span className="role-label">I'm a Buyer</span>
                <span className="role-sub">Shop fresh produce</span>
              </button>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                type="text"
                className={`form-input ${errors.fullName ? 'form-input--error' : ''}`}
                placeholder="Nimal Perera"
                value={form.fullName}
                onChange={handleChange('fullName')}
                autoComplete="name"
              />
              {errors.fullName && <p className="field-error">{errors.fullName}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange('email')}
                autoComplete="email"
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  type="tel"
                  className={`form-input ${errors.phone ? 'form-input--error' : ''}`}
                  placeholder="07XXXXXXXX"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  autoComplete="tel"
                />
                {errors.phone && <p className="field-error">{errors.phone}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="district">District</label>
                <div className="select-wrap">
                  <select
                    id="district"
                    className={`form-input form-select ${errors.district ? 'form-input--error' : ''}`}
                    value={form.district}
                    onChange={handleChange('district')}
                  >
                    <option value="">Select district</option>
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="select-chevron" />
                </div>
                {errors.district && <p className="field-error">{errors.district}</p>}
              </div>
            </div>

            {role === 'farmer' && (
              <div className="farm-details">
                <p className="farm-details__label"><Sprout size={14} />Farm details</p>

                <div className="form-group">
                  <label className="form-label" htmlFor="farmName">Farm name</label>
                  <input
                    id="farmName"
                    type="text"
                    className={`form-input ${errors.farmName ? 'form-input--error' : ''}`}
                    placeholder="Perera Organic Farm"
                    value={form.farmName}
                    onChange={handleChange('farmName')}
                  />
                  {errors.farmName && <p className="field-error">{errors.farmName}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="location">Farm location</label>
                  <input
                    id="location"
                    type="text"
                    className={`form-input ${errors.location ? 'form-input--error' : ''}`}
                    placeholder="e.g. Dimbulagala Road, Polonnaruwa"
                    value={form.location}
                    onChange={handleChange('location')}
                  />
                  {errors.location && <p className="field-error">{errors.location}</p>}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="password-field">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange('password')}
                  autoComplete="new-password"
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
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.confirmPassword ? 'form-input--error' : ''}`}
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
            </div>

            <div className="form-group">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={handleChange('agreeTerms')}
                />
                <span>
                  I agree to HarvestHub&apos;s{' '}
                  <button
                    type="button"
                    className="inline-link"
                    onClick={() => setPolicyType('terms')}
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    className="inline-link"
                    onClick={() => setPolicyType('privacy')}
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
              {errors.agreeTerms && <p className="field-error">{errors.agreeTerms}</p>}
            </div>

            {errors.general && <div className="field-error">{errors.general}</div>}

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || !isRegistrationComplete}
            >
              {isSubmitting ? <Loader2 size={18} className="spinner" /> : 'Create account'}
            </button>
          </form>

          {policyType && (
            <div className="policy-modal-backdrop" onClick={() => setPolicyType(null)}>
              <div className="policy-modal" onClick={(e) => e.stopPropagation()}>
                <div className="policy-modal__header">
                  <h3>{policyContent[policyType].title}</h3>
                  <button type="button" className="policy-close" onClick={() => setPolicyType(null)}>×</button>
                </div>
                <p>{policyContent[policyType].body}</p>
              </div>
            </div>
          )}

          <div className="trust-row">
            <span className="trust-item"><ShieldCheck size={14} />Secure &amp; encrypted</span>
            <span className="trust-item"><BadgeCheck size={14} />Verified farmers</span>
          </div>

          <p className="switch-mode-text">
            Already have an account?{' '}
            <button type="button" className="switch-mode-link" onClick={() => navigate('/login')}>
              Log in
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

export default memo(Register);