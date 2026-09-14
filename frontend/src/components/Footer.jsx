// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo2.png';
import './Footer.css';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaMapMarkerAlt, FaEnvelope, FaPhone, FaClock } from 'react-icons/fa';


export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const buyerLinks = [
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Categories', path: '/categories' },
    { name: 'Farmers', path: '/farmers' },
    { name: 'FAQ', path: '/faq' },
  ];

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          {/* Brand Column */}
          <div className="footer__brand">
            <div className="footer__logo">
              <img src={logoImg} alt="HarvestHub" className="footer__logo-image" />
            </div>
            <p className="footer__description">
              Connecting Sri Lankan farmers directly with buyers. Fresh produce at fair prices. No middlemen.
            </p>
            <div className="footer__social">
              <a href="#" className="footer__social-link" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="#" className="footer__social-link" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="footer__social-link" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="footer__social-link" aria-label="YouTube">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__section">
            <h4 className="footer__section-title">Quick Links</h4>
            <ul className="footer__links">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Buyers */}
          <div className="footer__section">
            <h4 className="footer__section-title">For Buyers</h4>
            <ul className="footer__links">
              {buyerLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer__section">
            <h4 className="footer__section-title">Get in Touch</h4>
            <ul className="footer__contact">
              <li>📍 Colombo, Sri Lanka</li>
              <li>📧 info@harvesthub.lk</li>
              <li>📞 +94 11 234 5678</li>
              <li>🕐 Mon-Sun: 8:00 AM - 8:00 PM</li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__bottom-text">
            © {currentYear} HarvestHub. All rights reserved.
          </p>
          <div className="footer__bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}