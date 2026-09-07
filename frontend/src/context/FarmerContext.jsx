import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getFarmerProfile, updateFarmerProfile as updateFarmerProfileApi } from '../services/farmerService';
import { getMyProducts } from '../services/ProductManageService';

/**
 * FarmerContext — bridges Zahida's dashboard pages (FarmerDashboard,
 * AddProduct, EditProduct, EditFarmerProfile — all built against `useApp()`)
 * to the REAL shared state: Kaumini's AuthContext (JWT login) + the actual
 * Farmer/Product backend routes. Pages keep calling `useApp()` exactly as
 * before; this file is the only thing that changed from dummy data to real
 * network calls.
 *
 * `user` keeps the same shape the dashboard pages already expect
 * ({ name, email, role, farmName, district, photoUrl, ... }), assembled
 * from the logged-in account (AuthContext) + that farmer's FarmerProfile
 * document (fetched from GET /api/farmer/profile).
 */

const FarmerContext = createContext(null);

export function FarmerProvider({ children }) {
  const { user: authUser, logout: authLogout, isAuthenticated, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  const isFarmer = isAuthenticated && authUser?.role === 'farmer';

  const refreshProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const res = await getFarmerProfile();
      setProfile(res.data);
      setProfileError('');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to load farmer profile');
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      const res = await getMyProducts();
      setProducts(res.data || []);
    } catch {
      // Leave products as-is — the dashboard tolerates an empty list.
    }
  }, []);

  useEffect(() => {
    if (isFarmer) {
      refreshProfile();
      refreshProducts();
    } else {
      setProfile(null);
      setProducts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFarmer]);

  // The shape every dashboard page already destructures via useApp().user.
  const user = authUser
    ? {
        id: authUser.id,
        name: authUser.fullName,
        email: authUser.email,
        role: authUser.role,
        phone: profile?.phone,
        farmName: profile?.farmName,
        district: profile?.district,
        address: profile?.location,
        bio: profile?.description,
        photoUrl: profile?.profileImage || undefined,
        isVerified: profile?.isVerified,
        // Extended profile fields — see models/FarmerProfile.js
        whatsapp: profile?.whatsapp,
        website: profile?.website,
        instagram: profile?.instagram,
        facebook: profile?.facebook,
        farmingType: profile?.farmingType,
        farmSize: profile?.farmSize,
        farmSizeUnit: profile?.farmSizeUnit,
        yearsOfExperience: profile?.yearsOfExperience,
        certifications: profile?.certifications,
        primaryCrops: profile?.primaryCrops,
        deliveryRange: profile?.deliveryRange,
        bankName: profile?.bankName,
        bankAccount: profile?.bankAccount,
      }
    : null;

  const logout = useCallback(() => {
    authLogout();
    setProfile(null);
    setProducts([]);
  }, [authLogout]);

  // `name`/`email` live on the User account (set at registration), not on
  // FarmerProfile, so they're intentionally not sent to PUT /farmer/profile.
  // A couple of the page's field names don't match the schema 1:1
  // (page: address/bio  →  schema: location/description) — remapped here.
  const updateUser = useCallback(async (updates, photoFile) => {
    const { name, email, address, bio, ...rest } = updates;
    const profileFields = {
      ...rest,
      ...(address !== undefined ? { location: address } : {}),
      ...(bio !== undefined ? { description: bio } : {}),
    };
    const res = await updateFarmerProfileApi(profileFields, photoFile);
    setProfile(res.data);
    return res.data;
  }, []);

  // Optimistic local preview only (blob: URL). The real upload happens
  // inside updateUser()'s multipart submit, which replaces this with the
  // real Cloudinary URL once the server responds.
  const updateProfilePhoto = useCallback((url) => {
    setProfile((prev) => (prev ? { ...prev, profileImage: url } : prev));
  }, []);

  const addProduct = useCallback((product) => {
    setProducts((prev) => [product, ...prev]);
  }, []);

  const updateProduct = useCallback((id, updates) => {
    setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, ...updates } : p)));
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p._id !== id));
  }, []);

  const value = {
    user,
    loading: authLoading || profileLoading,
    profileError,
    logout,
    updateUser,
    updateProfilePhoto,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
  };

  return <FarmerContext.Provider value={value}>{children}</FarmerContext.Provider>;
}

export function useApp() {
  const ctx = useContext(FarmerContext);
  if (!ctx) throw new Error('useApp must be used within FarmerProvider');
  return ctx;
}
