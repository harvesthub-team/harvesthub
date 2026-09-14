import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApp } from '../context/FarmerContext';
import {
  categories,
  getProductById,
  updateProduct as updateProductApi,
  deleteProduct as deleteProductApi,
} from '../services/productManageService';
import Logo from '../components/Logo';
import { FormBackground } from '../components/FormBackground';
import { ProductPhotoUploader } from '../components/ProductPhotoUploader';
import {
  ChevronLeft,
  PackageSearch,
  Tag,
  DollarSign,
  Layers,
  AlignLeft,
  Trash2,
  ImagePlus,
  MapPin,
} from 'lucide-react';
import { motion } from 'motion/react';
function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, updateProduct, deleteProduct } = useApp();
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [stock, setStock] = useState('');
  const [district, setDistrict] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]); // [{ url, file? }] — file only present for newly added photos
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  // Fetches the product directly (GET /api/products/:id) instead of
  // looking it up in FarmerContext's shared `products` list. That list
  // loads asynchronously on app start, so on a direct link or a page
  // refresh it's still empty on the very first render — looking it up
  // there caused this page to immediately redirect away, treating a
  // product that genuinely exists as "not found" just because the
  // context hadn't finished loading yet.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoadingProduct(true);
    setLoadError('');
    getProductById(id)
      .then((res) => {
        if (cancelled) return;
        const p = res.data;
        setProduct(p);
        setName(p.name);
        // Real Product docs store `category` (display name, e.g.
        // "Vegetables"), not `categorySlug` — derive the slug for the
        // <select> from it.
        setCategoryId(p.categorySlug || categories.find((c) => c.name === p.category)?.slug || '');
        setPrice(p.pricePerUnit.toString());
        setUnit(p.unit);
        setStock(p.quantity.toString());
        setDistrict(p.district || '');
        setDescription(p.description || '');
        // Existing saved images have no `file` — only newly picked photos do.
        const existingUrls = p.images?.length ? p.images : p.image ? [p.image] : [];
        setImages(existingUrls.map((url) => ({ url })));
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err.response?.data?.message || 'Could not load this product.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProduct(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  if (!user) return null;

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <FormBackground />
        <p className="relative z-10 text-white/70 text-sm" style={{ fontFamily: 'Inter,sans-serif' }}>
          Loading product…
        </p>
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 relative">
        <FormBackground />
        <p className="relative z-10 text-white/80 text-sm" style={{ fontFamily: 'Inter,sans-serif' }}>
          {loadError || 'Product not found.'}
        </p>
        <button
          onClick={() => navigate('/farmer', { state: { tab: 'products' } })}
          className="relative z-10 px-5 py-2 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: '#1f3b2c', fontFamily: 'Inter,sans-serif' }}
        >
          Back to my products
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const fields = {
        name,
        category: categories.find((c) => c.slug === categoryId)?.name || '',
        pricePerUnit: Number(price),
        unit,
        quantity: Number(stock),
        district,
        description,
      };
      // Only NEW photos (the ones with a real File attached) get uploaded —
      // existing image URLs are already saved server-side and can't be
      // re-sent as files. Note: the current backend controller only ever
      // *appends* newly uploaded images to the product's existing image
      // list — it doesn't support removing an individual existing photo
      // yet, so photos removed here in the uploader won't actually be
      // deleted server-side until that's added to productManageController.js.
      const newFiles = images.map((img) => img.file).filter(Boolean);

      const res = await updateProductApi(product._id, fields, newFiles);
      updateProduct(product._id, res.data);
      navigate('/farmer', { state: { tab: 'products' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;
    setDeleting(true);
    setError('');
    try {
      await deleteProductApi(product._id);
      deleteProduct(product._id);
      navigate('/farmer', { state: { tab: 'products' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product. Please try again.');
      setDeleting(false);
    }
  };
  const inputClass =
    'w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ded5bd] bg-[#fdfcf8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c98a2b]/60 focus:border-[#c98a2b] transition-all text-[#211d15] placeholder-[#b0a890] text-sm shadow-sm appearance-none';
  const iconClass =
    'absolute left-3 top-1/2 -translate-y-1/2 text-[#b0a890] z-10 pointer-events-none';
  const sectionLabel =
    'text-xs font-bold text-[#1f3b2c] mb-3 flex items-center gap-1.5 uppercase tracking-widest';
  return (
    <div className="min-h-screen flex flex-col relative">
      <FormBackground />

      <header
        className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10"
        style={{ backgroundColor: 'rgba(10,20,14,0.6)', backdropFilter: 'blur(16px)' }}
      >
        <Logo variant="light" />
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/30 bg-[#c98a2b] flex items-center justify-center text-xs font-bold text-white shrink-0">
          {user.photoUrl ? (
            <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span style={{ fontFamily: 'Inter,sans-serif' }}>
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-2xl w-full mx-auto px-4 md:px-8 py-6 md:py-10 flex flex-col justify-center">
        <button
          onClick={() => navigate('/farmer', { state: { tab: 'products' } })}
          className="flex items-center gap-1.5 text-sm mb-6 transition-colors w-fit text-white/70 hover:text-white"
          style={{ fontFamily: 'Inter,sans-serif', fontWeight: 500 }}
        >
          <ChevronLeft size={16} /> Back to my products
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl overflow-hidden"
          style={{
            backgroundColor: '#ffffff',
            boxShadow: '0 32px 64px -16px rgba(0,0,0,0.32), 0 0 0 1px rgba(201,138,43,0.12)',
          }}
        >
          {/* Header strip */}
          <div
            className="px-8 py-6 border-b border-[#ede8db] flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #1f3b2c 0%, #2b5040 100%)' }}
          >
            <div>
              <h1
                style={{
                  fontFamily: 'Fraunces,serif',
                  fontWeight: 800,
                  fontSize: 26,
                  color: '#fff',
                  lineHeight: 1.2,
                }}
              >
                Edit Product
              </h1>
              <p className="text-white/60 mt-1 text-sm" style={{ fontFamily: 'Inter,sans-serif' }}>
                Update pricing, stock, photos, or details for your listing.
              </p>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting || submitting}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full transition-all disabled:opacity-60"
              style={{
                backgroundColor: 'rgba(239,68,68,0.18)',
                color: '#fca5a5',
                fontFamily: 'Inter,sans-serif',
              }}
            >
              <Trash2 size={13} /> {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-7">
            {/* ── Product Photos ── */}
            <div>
              <p className={sectionLabel}>
                <ImagePlus size={13} /> Product Photos
              </p>
              <ProductPhotoUploader images={images} onChange={setImages} />
            </div>

            {/* ── Product Details ── */}
            <div>
              <p className={sectionLabel}>
                <PackageSearch size={13} /> Product Details
              </p>
              <div className="space-y-3">
                <div className="relative">
                  <PackageSearch className={iconClass} size={15} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Product Name (e.g. Organic Carrots)"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Tag className={iconClass} size={15} />
                    <select
                      required
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className={inputClass}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="" disabled hidden>
                        Select Category
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <Layers className={iconClass} size={15} />
                    <select
                      required
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className={inputClass}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="kg">Per kg</option>
                      <option value="g">Per gram</option>
                      <option value="litre">Per litre</option>
                      <option value="piece">Per piece</option>
                      <option value="bunch">Per bunch</option>
                      <option value="dozen">Per dozen</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <DollarSign className={iconClass} size={15} />
                    <input
                      type="number"
                      required
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Price (Rs)"
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <Layers className={iconClass} size={15} />
                    <input
                      type="number"
                      required
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="Available Stock Quantity"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="relative">
                  <MapPin className={iconClass} size={15} />
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="District (e.g. Nuwara Eliya) — required"
                    className={inputClass}
                  />
                </div>

                <div className="relative">
                  <AlignLeft
                    className="absolute left-3 top-3 text-[#b0a890] z-10 pointer-events-none"
                    size={15}
                  />
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your product — freshness, farming practices, quality... (max 500 characters)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ded5bd] bg-[#fdfcf8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c98a2b]/60 focus:border-[#c98a2b] transition-all text-[#211d15] placeholder-[#b0a890] text-sm shadow-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{ backgroundColor: '#f3ddd4', color: '#a8482f', fontFamily: 'Inter,sans-serif' }}
              >
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="pt-5 border-t border-[#ede8db] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/farmer', { state: { tab: 'products' } })}
                className="px-6 py-2.5 rounded-full text-sm font-semibold border border-[#ded5bd] bg-white hover:bg-[#fdfcf8] transition-colors shadow-sm"
                style={{ color: '#1f3b2c', fontFamily: 'Inter,sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || deleting}
                className="px-6 py-2.5 rounded-full text-white text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                style={{ backgroundColor: '#1f3b2c', fontFamily: 'Inter,sans-serif' }}
              >
                {submitting ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
export { EditProductPage as default };
