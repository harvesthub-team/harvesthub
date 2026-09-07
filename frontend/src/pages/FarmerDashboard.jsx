import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  LogOut,
  Plus,
  X,
  TrendingUp,
  Star,
  Camera,
  Upload,
  ChevronRight,
  Bell,
  Leaf,
  MapPin,
  Edit3,
  Wheat,
  ShoppingBag,
  User,
  Eye,
  Award,
  Clock,
  MessageSquare,
  BarChart2,
  Target,
  Info,
  ChevronLeft as ChevLeft,
  ChevronRight as ChevRight,
  Boxes,
} from 'lucide-react';
import Logo from '../components/Logo';
import { StatusBadge, statusVariantFor, productStatus } from '../components/StatusBadge';
import { useApp } from '../context/FarmerContext';
const RECENT_ORDERS = [
  { id: 'ORD-2025-00490', item: 'Carrot \xD7 20 kg', status: 'delivered' },
  { id: 'ORD-2025-00476', item: 'Leeks \xD7 8 kg', status: 'processing' },
  { id: 'ORD-2025-00461', item: 'Potato \xD7 15 kg', status: 'delivered' },
];
const REVENUE_DATA = [
  { month: 'Jan', revenue: 28400 },
  { month: 'Feb', revenue: 34100 },
  { month: 'Mar', revenue: 29800 },
  { month: 'Apr', revenue: 41200 },
  { month: 'May', revenue: 38600 },
  { month: 'Jun', revenue: 46300 },
  { month: 'Jul', revenue: 42850 },
];
const FARM_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1577950535377-24fce6e4d85e?w=500&h=320&fit=crop',
    label: 'Paddy fields at dawn',
  },
  {
    url: 'https://images.unsplash.com/photo-1632723893457-47e3abc47526?w=500&h=320&fit=crop',
    label: 'Harvest season',
  },
  {
    url: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=500&h=320&fit=crop',
    label: "This week's produce",
  },
];
const ACTIVITY_FEED = [
  {
    icon: ShoppingBag,
    color: '#c98a2b',
    bg: '#f5e6c8',
    label: 'New order received',
    sub: 'Malith De Silva \u2014 Carrot \xD7 10 kg',
    time: '12 min ago',
  },
  {
    icon: Star,
    color: '#1f3b2c',
    bg: '#e9efe6',
    label: 'New review posted',
    sub: '5 stars on Organic Carrots',
    time: '1 hr ago',
  },
  {
    icon: Package,
    color: '#1f3b2c',
    bg: '#e9efe6',
    label: 'Product restocked',
    sub: 'Potato \u2014 300 kg added',
    time: '3 hrs ago',
  },
  {
    icon: ShoppingBag,
    color: '#c98a2b',
    bg: '#f5e6c8',
    label: 'Order delivered',
    sub: 'ORD-2025-00490 \u2014 Carrot \xD7 20 kg',
    time: 'Yesterday',
  },
  {
    icon: MessageSquare,
    color: '#5b8cd1',
    bg: '#dce8f5',
    label: 'Buyer enquiry',
    sub: 'Nimali Perera asked about Leeks',
    time: 'Yesterday',
  },
];
const WEEKLY_REVENUE = [
  { day: 'Mon', value: 5400 },
  { day: 'Tue', value: 8200 },
  { day: 'Wed', value: 6100 },
  { day: 'Thu', value: 9800 },
  { day: 'Fri', value: 7300 },
  { day: 'Sat', value: 11200 },
  { day: 'Sun', value: 5850 },
];
const MONTHLY_TARGET = 5e4;
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};
const fadeLeft = {
  hidden: { opacity: 0, x: -18 },
  show: { opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};
function AnimatedValue({ target, prefix = '' }) {
  const [val, setVal] = useState(0);
  const done = useRef(false);
  return (
    <motion.span
      onViewportEnter={() => {
        if (done.current) return;
        done.current = true;
        const t0 = performance.now();
        const dur = 1200;
        const tick = (now) => {
          const p = Math.min((now - t0) / dur, 1);
          setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }}
      viewport={{ once: true }}
    >
      {prefix}
      {val.toLocaleString()}
    </motion.span>
  );
}
function RevenueSparkline({ data }) {
  const W = 600,
    H = 200;
  const PAD = { top: 16, right: 12, bottom: 32, left: 52 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const minV = Math.min(...data.map((d) => d.revenue));
  const maxV = Math.max(...data.map((d) => d.revenue));
  const range = maxV - minV || 1;
  const xOf = (i) => PAD.left + (i / (data.length - 1)) * cW;
  const yOf = (v) => PAD.top + cH - ((v - minV) / range) * cH;
  const pts = data.map((d, i) => ({ x: xOf(i), y: yOf(d.revenue) }));
  let line = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cp1x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) * 0.45;
    const cp2x = pts[i].x - (pts[i].x - pts[i - 1].x) * 0.45;
    line += ` C ${cp1x} ${pts[i - 1].y} ${cp2x} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
  }
  const area = `${line} L ${pts[pts.length - 1].x} ${PAD.top + cH} L ${pts[0].x} ${PAD.top + cH} Z`;
  const yTicks = [0, 0.33, 0.67, 1].map((t) => minV + t * range);
  const [hover, setHover] = useState(null);
  const gid = 'sg-rev';
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      style={{ overflow: 'visible', display: 'block' }}
      onMouseLeave={() => setHover(null)}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f3b2c" stopOpacity={0.22} />
          <stop offset="100%" stopColor="#1f3b2c" stopOpacity={0.01} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((v, i) => (
        <line
          key={`g${i}`}
          x1={PAD.left}
          y1={yOf(v)}
          x2={W - PAD.right}
          y2={yOf(v)}
          stroke="#e8e0ce"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      ))}

      {/* Animated area */}
      <motion.path
        d={area}
        fill={`url(#${gid})`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.7 }}
      />

      {/* Animated line draw */}
      <motion.path
        d={line}
        fill="none"
        stroke="#1f3b2c"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: 'easeOut', delay: 0.2 }}
      />

      {/* Dots */}
      {pts.map((pt, i) => (
        <g key={`d${i}`} onMouseEnter={() => setHover(i)} style={{ cursor: 'default' }}>
          <rect x={pt.x - 22} y={PAD.top} width={44} height={cH} fill="transparent" />
          <motion.circle
            cx={pt.x}
            cy={pt.y}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 300 }}
            r={hover === i ? 6 : 4}
            fill="#c98a2b"
            stroke="white"
            strokeWidth={2}
            style={{ transition: 'r 0.15s' }}
          />
          {hover === i && (
            <g>
              <rect
                x={pt.x - 44}
                y={pt.y - 38}
                width={88}
                height={26}
                rx={7}
                fill="#1f3b2c"
                opacity={0.93}
              />
              <text
                x={pt.x}
                y={pt.y - 20}
                textAnchor="middle"
                style={{
                  fontFamily: 'Inter,sans-serif',
                  fontSize: 11,
                  fill: '#fff',
                  fontWeight: 600,
                }}
              >
                Rs. {data[i].revenue.toLocaleString()}
              </text>
            </g>
          )}
        </g>
      ))}

      {/* X axis */}
      {data.map((d, i) => (
        <text
          key={`x${i}`}
          x={xOf(i)}
          y={H - 8}
          textAnchor="middle"
          style={{ fontFamily: 'Inter,sans-serif', fontSize: 11, fill: '#8a7f6a' }}
        >
          {d.month}
        </text>
      ))}

      {/* Y axis */}
      {yTicks.map((v, i) => (
        <text
          key={`y${i}`}
          x={PAD.left - 8}
          y={yOf(v) + 4}
          textAnchor="end"
          style={{ fontFamily: 'Inter,sans-serif', fontSize: 11, fill: '#8a7f6a' }}
        >
          {`${Math.round(v / 1e3)}k`}
        </text>
      ))}
    </svg>
  );
}
function ProductDetailModal({ product, onClose, onEdit }) {
  const allImages = product.images?.length ? product.images : product.image ? [product.image] : [];
  const [imgIdx, setImgIdx] = useState(0);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setImgIdx((i) => (i + 1) % Math.max(allImages.length, 1));
      if (e.key === 'ArrowLeft')
        setImgIdx((i) => (i - 1 + Math.max(allImages.length, 1)) % Math.max(allImages.length, 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, allImages.length]);
  const stars = product.rating ?? 0;
  const stockPct = Math.min((product.quantity / 300) * 100, 100);
  return (
    <motion.div
      key="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ backgroundColor: 'rgba(5,14,8,0.72)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        key="modal-panel"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: 'spring', damping: 32, stiffness: 360 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col sm:flex-row"
        style={{
          backgroundColor: '#fdfcf8',
          boxShadow: '0 32px 80px -12px rgba(0,0,0,0.42), 0 0 0 1px rgba(201,138,43,0.15)',
          maxHeight: '92dvh',
        }}
      >
        {/* Close */}
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: '#fff' }}
        >
          <X size={16} />
        </motion.button>

        {/* ── Left: Image gallery ── */}
        <div
          className="relative w-full sm:w-64 flex-shrink-0 bg-[#1a2e20] overflow-hidden"
          style={{ minHeight: 220, maxHeight: 320 }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={imgIdx}
              src={
                allImages[imgIdx] ||
                'https://images.unsplash.com/photo-1595804369280-928db64fb326?w=600&h=500&fit=crop'
              }
              alt={product.name}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover absolute inset-0"
              style={{ minHeight: 220 }}
            />
          </AnimatePresence>

          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(5,14,8,0.7) 0%, transparent 50%)' }}
          />

          {/* Gallery nav */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx((i) => (i - 1 + allImages.length) % allImages.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.45)', color: '#fff' }}
              >
                <ChevLeft size={15} />
              </button>
              <button
                onClick={() => setImgIdx((i) => (i + 1) % allImages.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.45)', color: '#fff' }}
              >
                <ChevRight size={15} />
              </button>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className="rounded-full transition-all"
                    style={{
                      width: i === imgIdx ? 20 : 6,
                      height: 6,
                      backgroundColor: i === imgIdx ? '#c98a2b' : 'rgba(255,255,255,0.5)',
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <StatusBadge
              label={
                productStatus(product) === 'active'
                  ? 'Active'
                  : productStatus(product) === 'low_stock'
                    ? 'Low Stock'
                    : 'Unavailable'
              }
              variant={statusVariantFor(productStatus(product))}
            />
          </div>

          {/* Image count */}
          {allImages.length > 1 && (
            <div
              className="absolute bottom-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: '#fff',
                fontFamily: 'Inter,sans-serif',
              }}
            >
              {imgIdx + 1}/{allImages.length}
            </div>
          )}
        </div>

        {/* ── Right: Details ── */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 min-w-0">
          {/* Category chip */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{
                backgroundColor: '#e9efe6',
                color: '#1f3b2c',
                fontFamily: 'Inter,sans-serif',
              }}
            >
              {product.category}
            </span>
            {product.badge && (
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  backgroundColor: product.badgeType === 'gold' ? '#f5e6c8' : '#e9efe6',
                  color: product.badgeType === 'gold' ? '#7a5010' : '#1f3b2c',
                  fontFamily: 'Inter,sans-serif',
                }}
              >
                {product.badge}
              </span>
            )}
          </div>

          {/* Name */}
          <div>
            <h2
              style={{
                fontFamily: 'Fraunces,serif',
                fontWeight: 800,
                fontSize: 26,
                color: '#211d15',
                lineHeight: 1.15,
              }}
            >
              {product.name}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <MapPin size={12} style={{ color: '#9a9080' }} />
              <span
                className="text-xs"
                style={{ color: '#9a9080', fontFamily: 'Inter,sans-serif' }}
              >
                {product.district}
              </span>
              {product.farmerSince && (
                <>
                  <span style={{ color: '#ded5bd' }}>·</span>
                  <span
                    className="text-xs"
                    style={{ color: '#9a9080', fontFamily: 'Inter,sans-serif' }}
                  >
                    Farming since {product.farmerSince}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Price + Unit */}
          <div className="flex items-baseline gap-2">
            <span
              style={{
                fontFamily: 'JetBrains Mono,monospace',
                fontWeight: 800,
                fontSize: 30,
                color: '#1f3b2c',
              }}
            >
              Rs. {product.pricePerUnit.toLocaleString()}
            </span>
            <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, color: '#9a9080' }}>
              / {product.unit}
            </span>
          </div>

          {/* Stock */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Boxes size={13} style={{ color: '#9a9080' }} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: '#6a5f50', fontFamily: 'Inter,sans-serif' }}
                >
                  Stock
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'JetBrains Mono,monospace',
                  fontSize: 13,
                  fontWeight: 700,
                  color: product.quantity < 30 ? '#c98a2b' : '#1f3b2c',
                }}
              >
                {product.quantity} {product.unit}
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: '#ede8db' }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stockPct}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                className="h-full rounded-full"
                style={{ backgroundColor: product.quantity < 30 ? '#c98a2b' : '#4a7c59' }}
              />
            </div>
          </div>

          {/* Rating */}
          {stars > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={13}
                    fill={n <= Math.round(stars) ? '#c98a2b' : 'none'}
                    style={{ color: '#c98a2b' }}
                  />
                ))}
              </div>
              <span
                style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12, color: '#6a5f50' }}
              >
                {stars.toFixed(1)}
              </span>
              {product.reviewCount > 0 && (
                <span
                  className="text-xs"
                  style={{ color: '#9a9080', fontFamily: 'Inter,sans-serif' }}
                >
                  ({product.reviewCount} reviews)
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div
              className="rounded-xl p-3.5"
              style={{ backgroundColor: '#f5f1e6', border: '1px solid #ede8db' }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Info size={12} style={{ color: '#9a9080' }} />
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#9a9080', fontFamily: 'Inter,sans-serif' }}
                >
                  About
                </span>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: '#4a3f30', fontFamily: 'Inter,sans-serif' }}
              >
                {product.description}
              </p>
            </div>
          )}

          {/* Spacer + Actions */}
          <div className="flex gap-3 pt-1 mt-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onEdit}
              className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#1f3b2c',
                color: '#fff',
                fontFamily: 'Inter,sans-serif',
                boxShadow: '0 4px 14px rgba(31,59,44,0.3)',
              }}
            >
              <Edit3 size={14} /> Edit Product
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="px-5 py-3 rounded-xl font-semibold text-sm"
              style={{
                backgroundColor: '#f5f1e6',
                color: '#6a5f50',
                border: '1px solid #ded5bd',
                fontFamily: 'Inter,sans-serif',
              }}
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
function HamburgerIcon({ open }) {
  return (
    <div className="w-5 h-4 flex flex-col justify-between">
      <motion.span
        className="block h-0.5 rounded-full origin-left"
        style={{ backgroundColor: 'currentColor' }}
        animate={open ? { rotate: 45, y: -1, width: '100%' } : { rotate: 0, y: 0, width: '100%' }}
        transition={{ duration: 0.25 }}
      />
      <motion.span
        className="block h-0.5 rounded-full"
        style={{ backgroundColor: 'currentColor' }}
        animate={open ? { opacity: 0, x: 8 } : { opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className="block h-0.5 rounded-full origin-left"
        style={{ backgroundColor: 'currentColor' }}
        animate={open ? { rotate: -45, y: 1, width: '100%' } : { rotate: 0, y: 0, width: '100%' }}
        transition={{ duration: 0.25 }}
      />
    </div>
  );
}
function FarmerDashboard() {
  const navigate = useNavigate();
  const { user, logout, products: allProducts, updateProfilePhoto } = useApp();
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.tab ?? 'overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  // allProducts already comes from GET /api/products/my-products — it's
  // already scoped to the logged-in farmer server-side, so no client-side
  // filtering by farmer identity is needed here.
  const FARMER_PRODUCTS = allProducts;
  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  if (!user) return null;
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, desc: 'Stats, revenue & farm' },
    { id: 'products', label: 'My Products', icon: Package, desc: 'Manage your listings' },
    { id: 'orders', label: 'Orders', icon: ClipboardList, desc: 'Accept or reject orders' },
  ];
  const stats = [
    {
      icon: Package,
      label: 'Active Listings',
      rawValue: FARMER_PRODUCTS.length,
      note: '+2 this month',
      accent: '#1f3b2c',
      bg: 'linear-gradient(135deg,#e9efe6,#d3e3cc)',
    },
    {
      icon: Star,
      label: 'Avg. Rating',
      rawValue: 48,
      note: 'From 134 reviews',
      accent: '#1f3b2c',
      bg: 'linear-gradient(135deg,#e9efe6,#d3e3cc)',
      display: '4.8 \u2605',
    },
    {
      icon: TrendingUp,
      label: 'Revenue (Jul)',
      rawValue: 42850,
      note: '\u2191 18% vs last month',
      accent: '#1f3b2c',
      bg: 'linear-gradient(135deg,#e9efe6,#d3e3cc)',
      prefix: 'Rs. ',
    },
  ];
  const tabLabels = {
    overview: 'Overview',
    products: 'My Products',
    orders: 'Orders',
  };
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0ece0' }}>
      {/* ══ Hamburger Drawer ══ */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(5,12,7,0.55)', backdropFilter: 'blur(5px)' }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer panel */}
            <motion.aside
              key="drawer"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed left-0 top-0 h-full z-50 flex flex-col w-72 overflow-hidden"
              style={{ backgroundColor: '#1a3326' }}
            >
              {/* Drawer grain */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
              />

              {/* Gold shimmer top bar */}
              <div
                className="h-1 w-full"
                style={{ background: 'linear-gradient(90deg, transparent, #c98a2b, transparent)' }}
              />

              {/* Header */}
              <div
                className="px-6 pt-5 pb-4 flex items-center justify-between border-b"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <Logo size="lg" variant="light" />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                >
                  <X size={15} />
                </motion.button>
              </div>

              {/* Profile card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.4 }}
                className="mx-4 mt-5 p-4 rounded-2xl relative overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(201,138,43,0.18) 0%, rgba(201,138,43,0.06) 100%)',
                  border: '1px solid rgba(201,138,43,0.2)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl overflow-hidden border-2 flex-shrink-0 flex items-center justify-center text-lg font-bold text-white relative group cursor-pointer"
                    style={{
                      borderColor: 'rgba(201,138,43,0.5)',
                      backgroundColor: '#c98a2b',
                      fontFamily: 'Fraunces,serif',
                    }}
                    onClick={() => {
                      updateProfilePhoto(
                        'https://images.unsplash.com/photo-1595804369280-928db64fb326?w=200&h=200&fit=crop',
                      );
                    }}
                  >
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload size={14} className="text-white" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p
                      className="font-bold text-sm text-white truncate"
                      style={{ fontFamily: 'Fraunces,serif' }}
                    >
                      {user.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <p
                        className="text-[11px]"
                        style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter,sans-serif' }}
                      >
                        Verified Farmer
                      </p>
                    </div>
                    {user.farmName && (
                      <p
                        className="text-[11px] mt-0.5 flex items-center gap-1"
                        style={{ color: 'rgba(201,138,43,0.9)', fontFamily: 'Inter,sans-serif' }}
                      >
                        <Wheat size={10} /> {user.farmName}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/farmer/profile');
                  }}
                  className="mt-3 w-full py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.7)',
                    fontFamily: 'Inter,sans-serif',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.14)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  }}
                >
                  <Edit3 size={11} /> Edit Profile
                </button>
              </motion.div>

              {/* Nav items */}
              <nav className="flex-1 px-3 mt-5 space-y-1">
                <p
                  className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2"
                  style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter,sans-serif' }}
                >
                  Navigation
                </p>
                {navItems.map(({ id, label, icon: Icon, desc }, i) => {
                  const isActive = tab === id;
                  return (
                    <motion.button
                      key={id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.07, duration: 0.35 }}
                      onClick={() => {
                        if (id === 'orders') {
                          navigate('/farmer/incoming-orders');
                        } else {
                          setTab(id);
                        }
                        setMenuOpen(false);
                      }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left relative overflow-hidden transition-colors"
                      style={{
                        backgroundColor: isActive ? 'rgba(201,138,43,0.15)' : 'transparent',
                      }}
                    >
                      {/* Active left accent bar */}
                      {isActive && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                          style={{ backgroundColor: '#c98a2b' }}
                        />
                      )}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: isActive
                            ? 'rgba(201,138,43,0.2)'
                            : 'rgba(255,255,255,0.07)',
                        }}
                      >
                        <Icon
                          size={15}
                          style={{ color: isActive ? '#c98a2b' : 'rgba(255,255,255,0.55)' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold"
                          style={{
                            color: isActive ? '#e8c87a' : 'rgba(255,255,255,0.75)',
                            fontFamily: 'Inter,sans-serif',
                          }}
                        >
                          {label}
                        </p>
                        <p
                          className="text-[11px]"
                          style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter,sans-serif' }}
                        >
                          {desc}
                        </p>
                      </div>
                      <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />
                    </motion.button>
                  );
                })}
              </nav>

              {/* Footer */}
              <div
                className="p-4 border-t space-y-2"
                style={{ borderColor: 'rgba(255,255,255,0.07)' }}
              >
                {user.address && (
                  <div className="flex items-center gap-2 px-3 py-1">
                    <MapPin size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    <p
                      className="text-xs truncate"
                      style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter,sans-serif' }}
                    >
                      {user.address}
                    </p>
                  </div>
                )}
                <motion.button
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all"
                  style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter,sans-serif' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(168,72,47,0.18)';
                    e.currentTarget.style.color = '#e07a62';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                  }}
                >
                  <LogOut size={14} /> Log out
                </motion.button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══ Sticky Top Bar ══ */}
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-30 flex items-center justify-between px-5 md:px-8 py-0.2 border-b"
        style={{
          backgroundColor: 'rgba(31,59,44,0.97)',
          backdropFilter: 'blur(14px)',
          borderColor: 'rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        }}
      >
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.09)' }}
          >
            <HamburgerIcon open={menuOpen} />
          </motion.button>
          <Logo size="dashboard" variant="light" />
        </div>

        {/* Center: breadcrumb / current tab */}
        <div className="hidden sm:flex items-center gap-2">
          <span
            className="text-xs"
            style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter,sans-serif' }}
          >
            Dashboard
          </span>
          <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />
          <motion.span
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold"
            style={{ color: '#c98a2b', fontFamily: 'Inter,sans-serif' }}
          >
            {tabLabels[tab]}
          </motion.span>
        </div>

        {/* Right: bell + quick-add + avatar */}
        <div className="flex items-center gap-2.5">
          {/* Bell with pulse */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
            >
              <Bell size={16} />
            </motion.button>
          </div>

          {/* Quick add */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/farmer/add-product')}
            className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg, #c98a2b, #a86e1e)',
              fontFamily: 'Inter,sans-serif',
              boxShadow: '0 2px 12px rgba(201,138,43,0.35)',
            }}
          >
            <Plus size={13} /> Add Product
          </motion.button>

          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="w-9 h-9 rounded-full overflow-hidden border-2 cursor-pointer flex-shrink-0 flex items-center justify-center font-bold text-sm text-white"
            style={{
              borderColor: 'rgba(201,138,43,0.5)',
              backgroundColor: '#c98a2b',
              fontFamily: 'Fraunces,serif',
            }}
            onClick={() => setMenuOpen(true)}
          >
            {user.photoUrl ? (
              <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </motion.div>
        </div>
      </motion.header>

      {/* ══ Hero Banner ══ */}
      <div className="relative overflow-hidden" style={{ height: 220 }}>
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1577950535377-24fce6e4d85e?w=1600&fit=crop)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
          }}
          initial={{ scale: 1.06 }}
          animate={{ scale: 1.13, x: '-2%' }}
          transition={{ duration: 24, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
        />
        {/* Multi-layer overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(110deg, rgba(5,14,8,0.90) 0%, rgba(31,59,44,0.65) 50%, rgba(31,59,44,0.2) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(240,236,224,0.25) 0%, transparent 40%)',
          }}
        />

        {/* Animated floating leaf accent */}
        <motion.div
          className="absolute top-8 right-12 opacity-10"
          animate={{ y: [-6, 6, -6], rotate: [-8, 8, -8] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Leaf size={80} className="text-white" />
        </motion.div>

        {/* Gold accent bottom line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              'linear-gradient(to right, transparent 0%, rgba(201,138,43,0.6) 35%, rgba(201,138,43,0.6) 65%, transparent 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center px-6 md:px-10">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-2 mb-2"
            >
              <div className="w-1 h-4 rounded-full" style={{ backgroundColor: '#c98a2b' }} />
              <p
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: '#c98a2b', fontFamily: 'Inter,sans-serif' }}
              >
                Farmer Dashboard
              </p>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.55 }}
              style={{
                fontFamily: 'Fraunces,serif',
                fontWeight: 900,
                fontSize: 'clamp(24px,4vw,36px)',
                color: '#fff',
                lineHeight: 1.1,
              }}
            >
              Good day, {user.name.split(' ')[0]} 👋
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44, duration: 0.5 }}
              className="text-sm mt-1.5"
              style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter,sans-serif' }}
            >
              {/* @__PURE__ */ new Date().toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </motion.p>

            {/* Quick tab pills below greeting */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.54, duration: 0.5 }}
              className="flex gap-2 mt-4"
            >
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => (id === 'orders' ? navigate('/farmer/incoming-orders') : setTab(id))}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: tab === id ? '#c98a2b' : 'rgba(255,255,255,0.12)',
                    color: tab === id ? '#fff' : 'rgba(255,255,255,0.65)',
                    fontFamily: 'Inter,sans-serif',
                    backdropFilter: 'blur(6px)',
                    boxShadow: tab === id ? '0 2px 10px rgba(201,138,43,0.4)' : 'none',
                  }}
                >
                  <Icon size={11} />
                  {label}
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══ Tab Content ══ */}
      <div className="px-5 md:px-8 py-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* ════ OVERVIEW ════ */}
            {tab === 'overview' && (
              <div className="space-y-8">
                {/* Stat cards */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 xl:grid-cols-4 gap-4"
                >
                  {stats.map(
                    ({ icon: Icon, label, rawValue, note, accent, bg, display, prefix }, i) => (
                      <motion.div
                        key={label}
                        variants={fadeUp}
                        whileHover={{ y: -5, boxShadow: '0 16px 40px rgba(31,59,44,0.14)' }}
                        transition={{ type: 'tween', duration: 0.2 }}
                        className="rounded-2xl p-5 relative overflow-hidden cursor-default"
                        style={{
                          backgroundColor: '#fbf9f1',
                          border: '1px solid #ded5bd',
                          willChange: 'transform',
                        }}
                      >
                        {/* Background blob */}
                        <div
                          className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-40"
                          style={{ background: bg }}
                        />
                        <div className="relative z-10">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                            style={{ background: bg }}
                          >
                            <Icon size={18} style={{ color: accent }} />
                          </div>
                          <p
                            className="text-xs font-medium mb-1"
                            style={{ color: '#8a7f6a', fontFamily: 'Inter,sans-serif' }}
                          >
                            {label}
                          </p>
                          <p
                            style={{
                              fontFamily: 'JetBrains Mono,monospace',
                              fontWeight: 700,
                              fontSize: 26,
                              color: '#211d15',
                              lineHeight: 1,
                            }}
                          >
                            {display ?? <AnimatedValue target={rawValue} prefix={prefix} />}
                          </p>
                          <p
                            className="text-xs mt-2 font-medium"
                            style={{ color: accent, fontFamily: 'Inter,sans-serif' }}
                          >
                            {note}
                          </p>
                        </div>
                      </motion.div>
                    ),
                  )}
                </motion.div>

                {/* Revenue chart */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-40px' }}
                  whileHover={{ boxShadow: '0 12px 36px rgba(31,59,44,0.10)' }}
                  className="rounded-2xl p-6 md:p-8"
                  style={{ backgroundColor: '#fbf9f1', border: '1px solid #ded5bd' }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p
                        className="text-xs font-bold uppercase tracking-widest mb-1"
                        style={{ color: '#c98a2b', fontFamily: 'Inter,sans-serif' }}
                      >
                        Earnings
                      </p>
                      <h3
                        style={{
                          fontFamily: 'Fraunces,serif',
                          fontWeight: 700,
                          fontSize: 20,
                          color: '#211d15',
                        }}
                      >
                        Monthly Revenue
                      </h3>
                    </div>
                    <div className="text-right">
                      <p
                        style={{
                          fontFamily: 'JetBrains Mono,monospace',
                          fontWeight: 700,
                          fontSize: 22,
                          color: '#1f3b2c',
                        }}
                      >
                        Rs. 42,850
                      </p>
                      <p
                        className="text-xs mt-0.5 font-semibold"
                        style={{ color: '#c98a2b', fontFamily: 'Inter,sans-serif' }}
                      >
                        ↑ 18% this month
                      </p>
                    </div>
                  </div>
                  <RevenueSparkline data={REVENUE_DATA} />
                </motion.div>

                {/* 2-col: Recent orders + Farm photos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent orders */}
                  <motion.div
                    variants={fadeLeft}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-40px' }}
                    className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: '#fbf9f1', border: '1px solid #ded5bd' }}
                  >
                    <div
                      className="px-5 py-4 flex items-center justify-between border-b"
                      style={{ borderColor: '#ded5bd' }}
                    >
                      <h3
                        style={{
                          fontFamily: 'Fraunces,serif',
                          fontWeight: 700,
                          fontSize: 17,
                          color: '#211d15',
                        }}
                      >
                        Recent Orders
                      </h3>
                      <motion.button
                        whileHover={{ x: 3 }}
                        className="text-xs font-semibold flex items-center gap-1"
                        style={{ color: '#1f3b2c', fontFamily: 'Inter,sans-serif' }}
                        onClick={() => navigate('/farmer/incoming-orders')}
                      >
                        View all <ChevronRight size={12} />
                      </motion.button>
                    </div>
                    {RECENT_ORDERS.map((order, i) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-[#f5f1e6]"
                        style={{ borderTop: i > 0 ? '1px solid #ede8db' : 'none' }}
                      >
                        <div>
                          <p
                            style={{
                              fontFamily: 'JetBrains Mono,monospace',
                              fontSize: 11,
                              color: '#9a9080',
                            }}
                          >
                            {order.id}
                          </p>
                          <p
                            className="text-sm font-medium mt-0.5"
                            style={{ color: '#211d15', fontFamily: 'Inter,sans-serif' }}
                          >
                            {order.item}
                          </p>
                        </div>
                        <StatusBadge
                          label={order.status === 'delivered' ? 'Delivered' : 'Processing'}
                          variant={order.status === 'delivered' ? 'green' : 'gold'}
                        />
                      </div>
                    ))}
                  </motion.div>

                  {/* Farm gallery */}
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-40px' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3
                        style={{
                          fontFamily: 'Fraunces,serif',
                          fontWeight: 700,
                          fontSize: 17,
                          color: '#211d15',
                        }}
                      >
                        My Farm
                      </h3>
                      <button
                        className="flex items-center gap-1.5 text-xs font-semibold"
                        style={{ color: '#1f3b2c', fontFamily: 'Inter,sans-serif' }}
                      >
                        <Camera size={12} /> Add photo
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      {FARM_PHOTOS.map((photo, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.88 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          whileHover={{
                            scale: 1.06,
                            zIndex: 10,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                          }}
                          className="relative rounded-xl overflow-hidden cursor-pointer group"
                          style={{ aspectRatio: '4/3' }}
                        >
                          <img
                            src={photo.url}
                            alt={photo.label}
                            className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-115"
                          />
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                              background:
                                'linear-gradient(to top, rgba(5,14,8,0.75), transparent 60%)',
                            }}
                          />
                          <p
                            className="absolute bottom-2 left-0 right-0 px-2 text-center text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"
                            style={{ color: '#fff', fontFamily: 'Inter,sans-serif' }}
                          >
                            {photo.label}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* ── Quick Actions ── */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-40px' }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-4"
                    style={{ color: '#8a7f6a', fontFamily: 'Inter,sans-serif' }}
                  >
                    Quick Actions
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        icon: Plus,
                        label: 'Add Product',
                        sub: 'New listing',
                        color: '#1f3b2c',
                        bg: '#e9efe6',
                        action: () => navigate('/farmer/add-product'),
                      },
                      {
                        icon: Eye,
                        label: 'View Store',
                        sub: 'Public page',
                        color: '#5b8cd1',
                        bg: '#dce8f5',
                        action: () => navigate('/'),
                      },
                      {
                        icon: User,
                        label: 'Edit Profile',
                        sub: 'Update info',
                        color: '#c98a2b',
                        bg: '#f5e6c8',
                        action: () => navigate('/farmer/profile'),
                      },
                      {
                        icon: BarChart2,
                        label: 'Analytics',
                        sub: 'Full report',
                        color: '#8b5a8a',
                        bg: '#f0e8f5',
                        action: () => {},
                      },
                    ].map(({ icon: Icon, label, sub, color, bg, action }, i) => (
                      <motion.button
                        key={label}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.07, duration: 0.4 }}
                        whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(31,59,44,0.12)' }}
                        whileTap={{ scale: 0.96 }}
                        onClick={action}
                        className="flex flex-col items-start gap-2.5 p-4 rounded-2xl text-left transition-all"
                        style={{ backgroundColor: '#fbf9f1', border: '1px solid #ded5bd' }}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: bg }}
                        >
                          <Icon size={16} style={{ color }} />
                        </div>
                        <div>
                          <p
                            className="text-sm font-bold"
                            style={{ color: '#211d15', fontFamily: 'Inter,sans-serif' }}
                          >
                            {label}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: '#9a9080', fontFamily: 'Inter,sans-serif' }}
                          >
                            {sub}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* ── Earnings Goal + Activity Feed ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Earnings Goal */}
                  <motion.div
                    variants={fadeLeft}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-40px' }}
                    className="rounded-2xl p-6"
                    style={{ backgroundColor: '#fbf9f1', border: '1px solid #ded5bd' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Target size={14} style={{ color: '#c98a2b' }} />
                      <p
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: '#c98a2b', fontFamily: 'Inter,sans-serif' }}
                      >
                        Monthly Goal
                      </p>
                    </div>
                    <h3
                      style={{
                        fontFamily: 'Fraunces,serif',
                        fontWeight: 700,
                        fontSize: 19,
                        color: '#211d15',
                        marginBottom: 16,
                      }}
                    >
                      Earnings Target
                    </h3>

                    {/* Donut-style ring */}
                    <div className="flex items-center gap-6 mb-5">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <svg viewBox="0 0 80 80" width="100%" height="100%">
                          <circle
                            cx="40"
                            cy="40"
                            r="30"
                            fill="none"
                            stroke="#ede8db"
                            strokeWidth="9"
                          />
                          <motion.circle
                            cx="40"
                            cy="40"
                            r="30"
                            fill="none"
                            stroke="#c98a2b"
                            strokeWidth="9"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 30}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
                            whileInView={{
                              strokeDashoffset: 2 * Math.PI * 30 * (1 - 42850 / MONTHLY_TARGET),
                            }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                            style={{ transformOrigin: '40px 40px', rotate: '-90deg' }}
                          />
                          <text
                            x="40"
                            y="44"
                            textAnchor="middle"
                            style={{
                              fontFamily: 'JetBrains Mono,monospace',
                              fontSize: 13,
                              fontWeight: 700,
                              fill: '#211d15',
                            }}
                          >
                            {Math.round((42850 / MONTHLY_TARGET) * 100)}%
                          </text>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p
                          className="text-xs"
                          style={{ color: '#9a9080', fontFamily: 'Inter,sans-serif' }}
                        >
                          Earned so far
                        </p>
                        <p
                          style={{
                            fontFamily: 'JetBrains Mono,monospace',
                            fontWeight: 700,
                            fontSize: 22,
                            color: '#1f3b2c',
                          }}
                        >
                          Rs. 42,850
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: '#9a9080', fontFamily: 'Inter,sans-serif' }}
                        >
                          of Rs. {MONTHLY_TARGET.toLocaleString()} target
                        </p>
                        <p
                          className="text-xs mt-2 font-semibold"
                          style={{ color: '#c98a2b', fontFamily: 'Inter,sans-serif' }}
                        >
                          Rs. {(MONTHLY_TARGET - 42850).toLocaleString()} remaining
                        </p>
                      </div>
                    </div>

                    {/* Weekly bars */}
                    <p
                      className="text-xs font-semibold mb-2"
                      style={{ color: '#9a9080', fontFamily: 'Inter,sans-serif' }}
                    >
                      This Week
                    </p>
                    <div className="flex items-end gap-1.5 h-14">
                      {WEEKLY_REVENUE.map(({ day, value }, i) => {
                        const maxVal = Math.max(...WEEKLY_REVENUE.map((w) => w.value));
                        return (
                          <div key={day} className="flex-1 flex flex-col items-center gap-1">
                            <motion.div
                              initial={{ height: 0 }}
                              whileInView={{ height: `${(value / maxVal) * 48}px` }}
                              viewport={{ once: true }}
                              transition={{
                                delay: i * 0.06,
                                duration: 0.6,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              className="w-full rounded-t-md"
                              style={{
                                backgroundColor: value === maxVal ? '#c98a2b' : '#d3e3cc',
                                minHeight: 4,
                              }}
                            />
                            <span
                              style={{
                                fontFamily: 'Inter,sans-serif',
                                fontSize: 9,
                                color: '#b0a890',
                              }}
                            >
                              {day}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Recent Activity */}
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-40px' }}
                    className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: '#fbf9f1', border: '1px solid #ded5bd' }}
                  >
                    <div
                      className="px-5 py-4 border-b flex items-center gap-2"
                      style={{ borderColor: '#ded5bd' }}
                    >
                      <Clock size={14} style={{ color: '#c98a2b' }} />
                      <h3
                        style={{
                          fontFamily: 'Fraunces,serif',
                          fontWeight: 700,
                          fontSize: 17,
                          color: '#211d15',
                        }}
                      >
                        Recent Activity
                      </h3>
                    </div>
                    {ACTIVITY_FEED.map(({ icon: Icon, color, bg, label, sub, time }, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-[#f5f1e6]"
                        style={{ borderTop: i > 0 ? '1px solid #ede8db' : 'none' }}
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: bg }}
                        >
                          <Icon size={14} style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: '#211d15', fontFamily: 'Inter,sans-serif' }}
                          >
                            {label}
                          </p>
                          <p
                            className="text-xs mt-0.5 truncate"
                            style={{ color: '#9a9080', fontFamily: 'Inter,sans-serif' }}
                          >
                            {sub}
                          </p>
                        </div>
                        <span
                          className="text-[10px] flex-shrink-0 mt-0.5"
                          style={{ color: '#b0a890', fontFamily: 'Inter,sans-serif' }}
                        >
                          {time}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* ── Top Products ── */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-40px' }}
                  className="rounded-2xl overflow-hidden"
                  style={{ backgroundColor: '#fbf9f1', border: '1px solid #ded5bd' }}
                >
                  <div
                    className="px-5 py-4 border-b flex items-center justify-between"
                    style={{ borderColor: '#ded5bd' }}
                  >
                    <div className="flex items-center gap-2">
                      <Award size={14} style={{ color: '#c98a2b' }} />
                      <h3
                        style={{
                          fontFamily: 'Fraunces,serif',
                          fontWeight: 700,
                          fontSize: 17,
                          color: '#211d15',
                        }}
                      >
                        Top Products
                      </h3>
                    </div>
                    <motion.button
                      whileHover={{ x: 3 }}
                      className="text-xs font-semibold flex items-center gap-1"
                      style={{ color: '#1f3b2c', fontFamily: 'Inter,sans-serif' }}
                      onClick={() => setTab('products')}
                    >
                      All products <ChevronRight size={12} />
                    </motion.button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: '1px solid #ede8db' }}>
                          {['Product', 'Price', 'Stock', 'Sales', 'Revenue', 'Performance'].map(
                            (col) => (
                              <th
                                key={col}
                                className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider"
                                style={{ color: '#b0a890', fontFamily: 'Inter,sans-serif' }}
                              >
                                {col}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {FARMER_PRODUCTS.slice(0, 4).map((p, i) => {
                          const sales = [120, 84, 67, 45][i] ?? 30;
                          const revenue = sales * p.pricePerUnit;
                          const perf = Math.min(Math.round((sales / 130) * 100), 100);
                          return (
                            <motion.tr
                              key={p._id}
                              initial={{ opacity: 0, x: -12 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.07 }}
                              whileHover={{ backgroundColor: '#f5f1e6' }}
                              className="transition-colors"
                              style={{ borderBottom: i < 3 ? '1px solid #ede8db' : 'none' }}
                            >
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0"
                                    style={{ border: '1.5px solid #ede8db' }}
                                  >
                                    <img
                                      src={p.image || p.images?.[0]}
                                      alt={p.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <p
                                      className="font-semibold text-sm"
                                      style={{ color: '#211d15', fontFamily: 'Inter,sans-serif' }}
                                    >
                                      {p.name}
                                    </p>
                                    <p
                                      className="text-xs"
                                      style={{ color: '#9a9080', fontFamily: 'Inter,sans-serif' }}
                                    >
                                      {p.category}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td
                                className="px-5 py-3.5"
                                style={{
                                  fontFamily: 'JetBrains Mono,monospace',
                                  fontSize: 13,
                                  color: '#1f3b2c',
                                  fontWeight: 600,
                                }}
                              >
                                Rs.{p.pricePerUnit}/{p.unit}
                              </td>
                              <td
                                className="px-5 py-3.5"
                                style={{
                                  fontFamily: 'JetBrains Mono,monospace',
                                  fontSize: 13,
                                  color: p.quantity < 30 ? '#c98a2b' : '#4a7c59',
                                }}
                              >
                                {p.quantity} {p.unit}
                              </td>
                              <td
                                className="px-5 py-3.5"
                                style={{
                                  fontFamily: 'JetBrains Mono,monospace',
                                  fontSize: 13,
                                  color: '#211d15',
                                }}
                              >
                                {sales} {p.unit}
                              </td>
                              <td
                                className="px-5 py-3.5"
                                style={{
                                  fontFamily: 'JetBrains Mono,monospace',
                                  fontSize: 13,
                                  color: '#1f3b2c',
                                  fontWeight: 700,
                                }}
                              >
                                Rs.{revenue.toLocaleString()}
                              </td>
                              <td className="px-5 py-3.5 min-w-[120px]">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="flex-1 h-1.5 rounded-full"
                                    style={{ backgroundColor: '#ede8db' }}
                                  >
                                    <motion.div
                                      initial={{ width: 0 }}
                                      whileInView={{ width: `${perf}%` }}
                                      viewport={{ once: true }}
                                      transition={{
                                        duration: 1,
                                        delay: 0.2 + i * 0.1,
                                        ease: 'easeOut',
                                      }}
                                      className="h-full rounded-full"
                                      style={{
                                        backgroundColor:
                                          perf > 70 ? '#4a7c59' : perf > 40 ? '#c98a2b' : '#e07a62',
                                      }}
                                    />
                                  </div>
                                  <span
                                    style={{
                                      fontFamily: 'JetBrains Mono,monospace',
                                      fontSize: 11,
                                      color: '#9a9080',
                                      minWidth: 28,
                                    }}
                                  >
                                    {perf}%
                                  </span>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </div>
            )}

            {/* ════ PRODUCTS ════ */}
            {tab === 'products' && (
              <div>
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="flex items-center justify-between mb-7"
                >
                  <div>
                    <h2
                      style={{
                        fontFamily: 'Fraunces,serif',
                        fontWeight: 800,
                        fontSize: 28,
                        color: '#211d15',
                      }}
                    >
                      My Products
                    </h2>
                    <p
                      className="text-sm mt-0.5"
                      style={{ color: '#8a7f6a', fontFamily: 'Inter,sans-serif' }}
                    >
                      {FARMER_PRODUCTS.length} active listings
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(201,138,43,0.35)' }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate('/farmer/add-product')}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #1f3b2c, #2e5c42)',
                      fontFamily: 'Inter,sans-serif',
                      boxShadow: '0 4px 16px rgba(31,59,44,0.3)',
                    }}
                  >
                    <Plus size={14} /> Add Product
                  </motion.button>
                </motion.div>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                  {FARMER_PRODUCTS.map((p) => (
                    <motion.div
                      key={p._id}
                      variants={fadeUp}
                      whileHover={{ y: -5, boxShadow: '0 20px 48px rgba(31,59,44,0.14)' }}
                      transition={{ type: 'tween', duration: 0.22 }}
                      onClick={() => setSelectedProduct(p)}
                      className="rounded-2xl overflow-hidden group cursor-pointer"
                      style={{
                        backgroundColor: '#fbf9f1',
                        border: '1px solid #ded5bd',
                        willChange: 'transform',
                      }}
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden" style={{ height: 176 }}>
                        <img
                          src={p.image || p.images?.[0]}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div
                          className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                          style={{
                            background:
                              'linear-gradient(to top, rgba(10,22,14,0.55) 0%, rgba(10,22,14,0.08) 55%, transparent 100%)',
                          }}
                        />

                        {/* View hint */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-250">
                          <div
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold"
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.92)',
                              color: '#1f3b2c',
                              fontFamily: 'Inter,sans-serif',
                              boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
                            }}
                          >
                            <Eye size={11} /> View details
                          </div>
                        </div>

                        <div className="absolute top-2.5 left-2.5">
                          <StatusBadge
                            label={
                              productStatus(p) === 'active'
                                ? 'Active'
                                : productStatus(p) === 'low_stock'
                                  ? 'Low stock'
                                  : 'Unavailable'
                            }
                            variant={statusVariantFor(productStatus(p))}
                          />
                        </div>

                        {/* Multiple photos indicator */}
                        {(p.images?.length ?? 0) > 1 && (
                          <div
                            className="absolute top-2.5 right-2.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                            style={{
                              backgroundColor: 'rgba(0,0,0,0.45)',
                              color: '#fff',
                              fontFamily: 'Inter,sans-serif',
                            }}
                          >
                            +{p.images.length - 1}
                          </div>
                        )}

                        {/* Stock bar */}
                        <div
                          className="absolute bottom-0 left-0 right-0 h-0.5"
                          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                        >
                          <div
                            className="h-full transition-none"
                            style={{
                              width: `${Math.min((p.quantity / 300) * 100, 100)}%`,
                              backgroundColor: productStatus(p) === 'low_stock' ? '#c98a2b' : '#4ade80',
                            }}
                          />
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4
                            style={{
                              fontFamily: 'Fraunces,serif',
                              fontSize: 15,
                              fontWeight: 700,
                              color: '#211d15',
                              lineHeight: 1.3,
                            }}
                          >
                            {p.name}
                          </h4>
                          {p.rating > 0 && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Star size={11} fill="#c98a2b" style={{ color: '#c98a2b' }} />
                              <span
                                style={{
                                  fontFamily: 'JetBrains Mono,monospace',
                                  fontSize: 11,
                                  color: '#6a5f50',
                                }}
                              >
                                {p.rating}
                              </span>
                            </div>
                          )}
                        </div>
                        <p
                          className="text-xs mb-3"
                          style={{ color: '#9a9080', fontFamily: 'Inter,sans-serif' }}
                        >
                          {p.category}
                        </p>

                        <div className="flex items-center justify-between">
                          <div>
                            <span
                              style={{
                                fontFamily: 'JetBrains Mono,monospace',
                                fontWeight: 700,
                                fontSize: 16,
                                color: '#1f3b2c',
                              }}
                            >
                              Rs. {p.pricePerUnit}
                            </span>
                            <span
                              className="text-xs ml-1"
                              style={{ color: '#9a9080', fontFamily: 'Inter,sans-serif' }}
                            >
                              /{p.unit}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs px-2 py-0.5 rounded-md"
                              style={{
                                color: '#6a5f50',
                                backgroundColor: '#f0ece0',
                                fontFamily: 'Inter,sans-serif',
                              }}
                            >
                              {p.quantity} {p.unit}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.07 }}
                              whileTap={{ scale: 0.94 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/farmer/edit-product/${p._id}`);
                              }}
                              className="text-xs font-bold px-3 py-1.5 rounded-full"
                              style={{
                                backgroundColor: '#e9efe6',
                                color: '#1f3b2c',
                                fontFamily: 'Inter,sans-serif',
                              }}
                            >
                              Edit
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Product Detail Modal ── */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            key="product-modal"
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onEdit={() => {
              setSelectedProduct(null);
              navigate(`/farmer/edit-product/${selectedProduct._id}`);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
export { FarmerDashboard as default };
