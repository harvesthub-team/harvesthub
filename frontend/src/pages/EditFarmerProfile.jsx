import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/FarmerContext';
import Logo from '../components/Logo';
import { FormBackground } from '../components/FormBackground';
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Tractor,
  FileText,
  Camera,
  Globe,
  AtSign,
  Leaf,
  Ruler,
  Clock,
  Award,
  Wheat,
  Truck,
  Building2,
  CreditCard,
  MessageCircle,
  Upload,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { motion } from 'motion/react';
const FARMING_TYPES = [
  'Rice Farming',
  'Vegetable Farming',
  'Fruit Orchards',
  'Spice Cultivation',
  'Dairy Farming',
  'Poultry Farming',
  'Aquaculture',
  'Mixed Farming',
  'Organic Farming',
  'Hydroponics',
];
function EditProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, updateProfilePhoto } = useApp();
  const fileInputRef = useRef(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [farmName, setFarmName] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [farmingType, setFarmingType] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [farmSizeUnit, setFarmSizeUnit] = useState('acres');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [certifications, setCertifications] = useState('');
  const [primaryCrops, setPrimaryCrops] = useState('');
  const [deliveryRange, setDeliveryRange] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null); // real File — sent to the backend on save
  const [photoDragging, setPhotoDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setWhatsapp(user.whatsapp || '');
    setFarmName(user.farmName || '');
    setAddress(user.address || '');
    setBio(user.bio || '');
    setWebsite(user.website || '');
    setInstagram(user.instagram || '');
    setFacebook(user.facebook || '');
    setFarmingType(user.farmingType || '');
    setFarmSize(user.farmSize || '');
    setFarmSizeUnit(user.farmSizeUnit || 'acres');
    setYearsOfExperience(user.yearsOfExperience || '');
    setCertifications(user.certifications || '');
    setPrimaryCrops(user.primaryCrops || '');
    setDeliveryRange(user.deliveryRange || '');
    setBankName(user.bankName || '');
    setBankAccount(user.bankAccount || '');
    setPhotoPreview(user.photoUrl || null);
  }, [user, navigate]);
  if (!user) return null;
  const handlePhotoFile = (file) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    setPhotoFile(file);
    updateProfilePhoto(url);
  };
  const handlePhotoInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handlePhotoFile(file);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setPhotoDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePhotoFile(file);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateUser(
        {
          name,
          email,
          phone,
          whatsapp,
          farmName,
          address,
          bio,
          website,
          instagram,
          facebook,
          farmingType,
          farmSize,
          farmSizeUnit,
          yearsOfExperience,
          certifications,
          primaryCrops,
          deliveryRange,
          bankName,
          bankAccount,
        },
        photoFile,
      );
      navigate('/farmer');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      setSaving(false);
    }
  };
  const inputClass =
    'w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ded5bd] bg-[#fdfcf8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c98a2b]/60 focus:border-[#c98a2b] transition-all text-[#211d15] placeholder-[#b0a890] text-sm shadow-sm';
  const iconClass =
    'absolute left-3 top-1/2 -translate-y-1/2 text-[#b0a890] z-10 pointer-events-none';
  const sectionLabel =
    'text-xs font-bold text-[#1f3b2c] mb-3 flex items-center gap-1.5 uppercase tracking-widest';
  return (
    <div className="min-h-screen flex flex-col relative">
      <FormBackground />

      {/* Nav */}
      <header
        className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10"
        style={{ backgroundColor: 'rgba(10,20,14,0.6)', backdropFilter: 'blur(16px)' }}
      >
        <Logo variant="light" />
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/30 bg-[#c98a2b] flex items-center justify-center text-xs font-bold text-white shrink-0">
          {photoPreview ? (
            <img src={photoPreview} alt="" className="w-full h-full object-cover" />
          ) : (
            <span style={{ fontFamily: 'Inter,sans-serif' }}>
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* Back */}
        <button
          onClick={() => navigate('/farmer')}
          className="flex items-center gap-1.5 text-sm mb-6 transition-colors w-fit text-white/70 hover:text-white"
          style={{ fontFamily: 'Inter,sans-serif', fontWeight: 500 }}
        >
          <ChevronLeft size={16} /> Back to dashboard
        </button>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ─── LEFT: Form ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex-1 min-w-0 rounded-3xl overflow-hidden"
            style={{
              backgroundColor: '#ffffff',
              boxShadow: '0 32px 64px -16px rgba(0,0,0,0.32), 0 0 0 1px rgba(201,138,43,0.12)',
            }}
          >
            {/* Form header strip */}
            <div
              className="px-8 py-6 border-b border-[#ede8db]"
              style={{ background: 'linear-gradient(135deg, #1f3b2c 0%, #2b5040 100%)' }}
            >
              <h1
                style={{
                  fontFamily: 'Fraunces,serif',
                  fontWeight: 800,
                  fontSize: 26,
                  color: '#fff',
                  lineHeight: 1.2,
                }}
              >
                Edit Profile
              </h1>
              <p className="text-white/60 mt-1 text-sm" style={{ fontFamily: 'Inter,sans-serif' }}>
                Keep your details current to build buyer trust and increase sales.
              </p>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              {/* ── Photo Upload Zone ── */}
              <div>
                <p className={sectionLabel}>
                  <Camera size={13} /> Profile Photo
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoInputChange}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setPhotoDragging(true);
                  }}
                  onDragLeave={() => setPhotoDragging(false)}
                  onDrop={handleDrop}
                  className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all"
                  style={{
                    borderColor: photoDragging ? '#c98a2b' : '#ded5bd',
                    backgroundColor: photoDragging ? 'rgba(201,138,43,0.04)' : '#fdfcf8',
                  }}
                >
                  {/* Current / preview avatar */}
                  <div className="relative shrink-0">
                    <div
                      className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#ded5bd] shadow-md bg-[#1f3b2c] flex items-center justify-center text-3xl text-white font-bold"
                      style={{ fontFamily: 'Fraunces,serif' }}
                    >
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (name || user.name).charAt(0).toUpperCase()
                      )}
                    </div>
                    {photoPreview && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1f3b2c] border-2 border-white flex items-center justify-center">
                        <CheckCircle2 size={12} className="text-[#c98a2b]" />
                      </div>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="flex-1 text-center sm:text-left">
                    <p
                      className="text-sm font-semibold text-[#211d15]"
                      style={{ fontFamily: 'Inter,sans-serif' }}
                    >
                      {photoPreview
                        ? 'Photo uploaded \u2014 click to replace'
                        : 'Upload your profile photo'}
                    </p>
                    <p
                      className="text-xs text-[#8a7f6a] mt-1"
                      style={{ fontFamily: 'Inter,sans-serif' }}
                    >
                      Drag & drop here, or{' '}
                      <span className="text-[#c98a2b] font-semibold">click to browse</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                      {['JPG, PNG or WEBP', 'Max 5 MB', 'Min 200\xD7200 px'].map((tip) => (
                        <span
                          key={tip}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#f0ece0] text-[#5b5645]"
                          style={{ fontFamily: 'Inter,sans-serif' }}
                        >
                          {tip}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: '#1f3b2c' }}
                  >
                    <Upload size={16} className="text-white" />
                  </div>
                </div>

                <p
                  className="mt-2 text-[11px] text-[#9a9080] flex items-center gap-1.5"
                  style={{ fontFamily: 'Inter,sans-serif' }}
                >
                  <Star size={10} className="text-[#c98a2b]" /> A clear, professional headshot
                  builds buyer confidence.
                </p>
              </div>

              {/* ── Personal Details ── */}
              <div>
                <p className={sectionLabel}>
                  <User size={13} /> Personal Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <User className={iconClass} size={15} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <Mail className={iconClass} size={15} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <Phone className={iconClass} size={15} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number"
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <MessageCircle className={iconClass} size={15} />
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="WhatsApp Number"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* ── Farm Details ── */}
              <div>
                <p className={sectionLabel}>
                  <Tractor size={13} /> Farm Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Tractor className={iconClass} size={15} />
                    <input
                      type="text"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder="Farm Name"
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <MapPin className={iconClass} size={15} />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Farm Address / District"
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <Leaf className={iconClass} size={15} />
                    <select
                      value={farmingType}
                      onChange={(e) => setFarmingType(e.target.value)}
                      className={inputClass}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">Farming Type / Specialization</option>
                      {FARMING_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Ruler className={iconClass} size={15} />
                      <input
                        type="number"
                        min="0"
                        value={farmSize}
                        onChange={(e) => setFarmSize(e.target.value)}
                        placeholder="Farm Size"
                        className={inputClass}
                      />
                    </div>
                    <select
                      value={farmSizeUnit}
                      onChange={(e) => setFarmSizeUnit(e.target.value)}
                      className="px-3 py-2.5 rounded-xl border border-[#ded5bd] bg-[#fdfcf8] focus:outline-none focus:ring-2 focus:ring-[#c98a2b]/60 text-sm text-[#211d15] cursor-pointer"
                    >
                      <option value="acres">Acres</option>
                      <option value="hectares">Hectares</option>
                    </select>
                  </div>
                  <div className="relative">
                    <Clock className={iconClass} size={15} />
                    <input
                      type="number"
                      min="0"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      placeholder="Years of Farming Experience"
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <Truck className={iconClass} size={15} />
                    <input
                      type="number"
                      min="0"
                      value={deliveryRange}
                      onChange={(e) => setDeliveryRange(e.target.value)}
                      placeholder="Delivery Range (km)"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* ── Produce & Certifications ── */}
              <div>
                <p className={sectionLabel}>
                  <Wheat size={13} /> Produce & Certifications
                </p>
                <div className="space-y-3">
                  <div className="relative">
                    <Wheat
                      className="absolute left-3 top-3 text-[#b0a890] z-10 pointer-events-none"
                      size={15}
                    />
                    <input
                      type="text"
                      value={primaryCrops}
                      onChange={(e) => setPrimaryCrops(e.target.value)}
                      placeholder="Primary Crops (e.g. Rice, Tomatoes, Mangoes)"
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <Award
                      className="absolute left-3 top-3 text-[#b0a890] z-10 pointer-events-none"
                      size={15}
                    />
                    <input
                      type="text"
                      value={certifications}
                      onChange={(e) => setCertifications(e.target.value)}
                      placeholder="Certifications — comma-separated (e.g. Organic, GAP Certified)"
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <FileText
                      className="absolute left-3 top-3 text-[#b0a890] z-10 pointer-events-none"
                      size={15}
                    />
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell buyers about your farm — what makes your produce special?"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ded5bd] bg-[#fdfcf8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c98a2b]/60 focus:border-[#c98a2b] transition-all text-[#211d15] placeholder-[#b0a890] text-sm shadow-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* ── Online Presence ── */}
              <div>
                <p className={sectionLabel}>
                  <Globe size={13} /> Online Presence
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative">
                    <Globe className={iconClass} size={15} />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="Website URL"
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <AtSign className={iconClass} size={15} />
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@instagram"
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <AtSign className={iconClass} size={15} />
                    <input
                      type="text"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      placeholder="Facebook page"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* ── Payment Details ── */}
              <div>
                <p className={sectionLabel}>
                  <CreditCard size={13} /> Payment Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Building2 className={iconClass} size={15} />
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Bank Name (e.g. Bank of Ceylon)"
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <CreditCard className={iconClass} size={15} />
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      placeholder="Account Number"
                      className={inputClass}
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
                  onClick={() => navigate('/farmer')}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold border border-[#ded5bd] bg-white hover:bg-[#fdfcf8] transition-colors shadow-sm"
                  style={{ color: '#1f3b2c', fontFamily: 'Inter,sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full text-white text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                  style={{ backgroundColor: '#1f3b2c', fontFamily: 'Inter,sans-serif' }}
                >
                  {saving ? 'Saving…' : 'Save Profile'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* ─── RIGHT: Live Profile Preview ─── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="w-full lg:w-72 lg:sticky lg:top-8 shrink-0"
          >
            {/* Preview label */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-2 h-2 rounded-full bg-[#c98a2b] animate-pulse" />
              <p
                className="text-white/60 text-xs font-semibold uppercase tracking-widest"
                style={{ fontFamily: 'Inter,sans-serif' }}
              >
                Live Preview
              </p>
            </div>

            <div
              className="rounded-3xl overflow-hidden"
              style={{
                backgroundColor: '#ffffff',
                boxShadow: '0 20px 48px -10px rgba(0,0,0,0.30), 0 0 0 1px rgba(201,138,43,0.10)',
              }}
            >
              {/* Banner gradient */}
              <div
                className="h-20 relative"
                style={{
                  background: 'linear-gradient(135deg, #1f3b2c 0%, #2e5c42 55%, #c98a2b 100%)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='white'/%3E%3C/svg%3E")`,
                    backgroundSize: '20px 20px',
                  }}
                />
              </div>

              <div className="px-5 pb-5">
                {/* Avatar */}
                <div className="relative -mt-9 mb-3 w-fit">
                  <div
                    className="w-18 h-18 rounded-2xl border-[3px] border-white shadow-lg bg-[#c98a2b] flex items-center justify-center text-2xl text-white font-bold overflow-hidden"
                    style={{ width: 72, height: 72, fontFamily: 'Fraunces,serif' }}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (name || user.name).charAt(0).toUpperCase()
                    )}
                  </div>
                </div>

                <h2
                  style={{
                    fontFamily: 'Fraunces,serif',
                    fontWeight: 800,
                    fontSize: 18,
                    color: '#211d15',
                    lineHeight: 1.2,
                  }}
                >
                  {name || user.name || 'Your Name'}
                </h2>
                {farmName && (
                  <p
                    className="text-[#c98a2b] text-xs font-semibold mt-0.5 flex items-center gap-1"
                    style={{ fontFamily: 'Inter,sans-serif' }}
                  >
                    <Tractor size={10} /> {farmName}
                  </p>
                )}
                {farmingType && (
                  <span
                    className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1f3b2c]/10 text-[#1f3b2c]"
                    style={{ fontFamily: 'Inter,sans-serif' }}
                  >
                    {farmingType}
                  </span>
                )}
                {bio && (
                  <p
                    className="mt-3 text-xs text-[#6b6252] leading-relaxed border-t border-black/5 pt-3"
                    style={{ fontFamily: 'Inter,sans-serif' }}
                  >
                    {bio.length > 100 ? bio.slice(0, 100) + '\u2026' : bio}
                  </p>
                )}

                {/* Stats */}
                {(yearsOfExperience || farmSize || deliveryRange) && (
                  <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-black/5 pt-3">
                    {yearsOfExperience && (
                      <div className="text-center bg-[#f7f4ed] rounded-xl py-2">
                        <p
                          style={{
                            fontFamily: 'Fraunces,serif',
                            fontWeight: 900,
                            fontSize: 16,
                            color: '#1f3b2c',
                          }}
                        >
                          {yearsOfExperience}
                        </p>
                        <p
                          className="text-[9px] text-[#8a7f6a] font-medium"
                          style={{ fontFamily: 'Inter,sans-serif' }}
                        >
                          Yrs exp.
                        </p>
                      </div>
                    )}
                    {farmSize && (
                      <div className="text-center bg-[#f7f4ed] rounded-xl py-2">
                        <p
                          style={{
                            fontFamily: 'Fraunces,serif',
                            fontWeight: 900,
                            fontSize: 16,
                            color: '#1f3b2c',
                          }}
                        >
                          {farmSize}
                        </p>
                        <p
                          className="text-[9px] text-[#8a7f6a] font-medium"
                          style={{ fontFamily: 'Inter,sans-serif' }}
                        >
                          {farmSizeUnit}
                        </p>
                      </div>
                    )}
                    {deliveryRange && (
                      <div className="text-center bg-[#f7f4ed] rounded-xl py-2">
                        <p
                          style={{
                            fontFamily: 'Fraunces,serif',
                            fontWeight: 900,
                            fontSize: 16,
                            color: '#c98a2b',
                          }}
                        >
                          {deliveryRange}
                        </p>
                        <p
                          className="text-[9px] text-[#8a7f6a] font-medium"
                          style={{ fontFamily: 'Inter,sans-serif' }}
                        >
                          km range
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Contact */}
                <div className="mt-3 space-y-1.5">
                  {address && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#6b6252]">
                      <MapPin size={11} className="text-[#c98a2b] shrink-0" />
                      <span className="truncate">{address}</span>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#6b6252]">
                      <Phone size={11} className="text-[#1f3b2c] shrink-0" />
                      <span>{phone}</span>
                    </div>
                  )}
                  {email && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#6b6252]">
                      <Mail size={11} className="text-[#1f3b2c] shrink-0" />
                      <span className="truncate">{email}</span>
                    </div>
                  )}
                  {website && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#6b6252]">
                      <Globe size={11} className="text-[#1f3b2c] shrink-0" />
                      <span className="truncate">{website}</span>
                    </div>
                  )}
                </div>

                {/* Certifications */}
                {certifications && (
                  <div className="mt-3 border-t border-black/5 pt-3">
                    <p
                      className="text-[9px] uppercase tracking-widest text-[#8a7f6a] font-bold mb-1.5"
                      style={{ fontFamily: 'Inter,sans-serif' }}
                    >
                      Certifications
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {certifications.split(',').map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white"
                          style={{ backgroundColor: '#1f3b2c', fontFamily: 'Inter,sans-serif' }}
                        >
                          {c.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Crops */}
                {primaryCrops && (
                  <div
                    className="mt-3 p-2.5 rounded-xl flex items-start gap-2"
                    style={{ backgroundColor: '#f2efe3' }}
                  >
                    <Wheat size={12} className="text-[#c98a2b] shrink-0 mt-0.5" />
                    <div>
                      <p
                        className="text-[9px] uppercase tracking-widest text-[#8a7f6a] font-bold"
                        style={{ fontFamily: 'Inter,sans-serif' }}
                      >
                        Primary Crops
                      </p>
                      <p
                        className="text-[11px] text-[#211d15] mt-0.5"
                        style={{ fontFamily: 'Inter,sans-serif' }}
                      >
                        {primaryCrops}
                      </p>
                    </div>
                  </div>
                )}

                {/* Social */}
                {(instagram || facebook) && (
                  <div className="mt-3 flex gap-2 border-t border-black/5 pt-3">
                    {instagram && (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)' }}
                      >
                        <AtSign size={13} className="text-white" />
                      </div>
                    )}
                    {facebook && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[#1877f2]">
                        <AtSign size={13} className="text-white" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <p
              className="mt-3 text-center text-white/40 text-[11px]"
              style={{ fontFamily: 'Inter,sans-serif' }}
            >
              Preview updates live as you type
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
export { EditProfilePage as default };
