const styles = {
  green: { bg: '#e9efe6', text: '#1f3b2c' },
  gold: { bg: '#f3e2bb', text: '#7a5010' },
  clay: { bg: '#f3ddd4', text: '#a8482f' },
};
function StatusBadge({ label, variant, className = '' }) {
  const s = styles[variant];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${className}`}
      style={{ backgroundColor: s.bg, color: s.text, fontSize: 10, letterSpacing: '0.06em' }}
    >
      {label}
    </span>
  );
}
function badgeVariantFor(badgeType) {
  return badgeType === 'gold' ? 'gold' : 'green';
}
function statusVariantFor(status) {
  if (status === 'delivered' || status === 'active' || status === 'verified') return 'green';
  if (status === 'processing' || status === 'low_stock' || status === 'pending_review')
    return 'gold';
  return 'clay';
}

// change — just call productStatus(product) instead of product.status.
const LOW_STOCK_THRESHOLD = 30;
function productStatus(product) {
  if (!product) return 'active';
  if (product.isAvailable === false) return 'unavailable';
  if (typeof product.quantity === 'number' && product.quantity < LOW_STOCK_THRESHOLD) {
    return 'low_stock';
  }
  return 'active';
}
export { StatusBadge, badgeVariantFor, statusVariantFor, productStatus };
