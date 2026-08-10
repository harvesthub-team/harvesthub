import logoImg from '../assets/logo.png';
import './Logo.css';

/**
 * HarvestHub wordmark. size: 'sm' | 'md' | 'lg'
 * logo.png has a genuinely transparent background (alpha-matted from the
 * original flat JPEG), so it drops cleanly onto any surface — no
 * mix-blend-mode hacks needed.
 */
export default function Logo({ size = 'md' }) {
  return (
    <div className={`logo logo--${size}`}>
      <img src={logoImg} alt="HarvestHub — Cultivating Connections" className="logo-image" />
    </div>
  );
}