import { BrowserRouter, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FarmerProvider } from './context/FarmerContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import './App.css';

// ===== KAUMINI'S PAGES (Auth) =====
import Login from './pages/Login';
import Register from './pages/Register';

// ===== VIRANJA'S PAGES (Browse & Search) =====
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';

// ===== HASHINI'S PAGES (Orders & Cart) =====
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import FarmerIncomingOrders from './pages/FarmerIncomingOrders';
import OrderSuccess from './pages/OrderSuccess';
import OrderDetails from './pages/OrderDetails';

// ===== FARMER PAGES =====
import FarmerDashboard from './pages/FarmerDashboard';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import EditFarmerProfile from './pages/EditFarmerProfile';

// ===== SITE CHROME =====
// Hides Navbar on farmer dashboard area
function SiteChrome() {
  const location = useLocation();
  const isFarmerArea = location.pathname.startsWith('/farmer');
  if (isFarmerArea) return null;
  return <Navbar />;
}

// ===== APP ROUTES =====
function AppRoutes() {
  return (
    <>
      <SiteChrome />
      <Routes>
        {/* ============================================
            PUBLIC ROUTES
            ============================================ */}

        {/* VIRANJA - Home */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/* VIRANJA - Products Page */}
        <Route path="/products" element={<Products />} />

        {/* Redirect /browse to /products */}
        <Route path="/browse" element={<Navigate to="/products" replace />} />

        {/* VIRANJA - Product Detail */}
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        {/* KAUMINI - Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ============================================
            BUYER PROTECTED ROUTES
            ============================================ */}

        <Route
          path="/cart"
          element={
            <ProtectedRoute requiredRole="buyer">
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute requiredRole="buyer">
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/order-success"
          element={
            <ProtectedRoute requiredRole="buyer">
              <OrderSuccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <ProtectedRoute requiredRole="buyer">
              <MyOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-orders/:orderId"
          element={
            <ProtectedRoute requiredRole="buyer">
              <OrderDetails />
            </ProtectedRoute>
          }
        />

        {/* ============================================
            FARMER PROTECTED ROUTES
            ============================================ */}

        <Route
          path="/farmer"
          element={
            <ProtectedRoute requiredRole="farmer">
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/farmer/dashboard"
          element={
            <ProtectedRoute requiredRole="farmer">
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/farmer/add-product"
          element={
            <ProtectedRoute requiredRole="farmer">
              <AddProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/farmer/edit-product/:id"
          element={
            <ProtectedRoute requiredRole="farmer">
              <EditProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/farmer/profile"
          element={
            <ProtectedRoute requiredRole="farmer">
              <EditFarmerProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/farmer/incoming-orders"
          element={
            <ProtectedRoute requiredRole="farmer">
              <FarmerIncomingOrders />
            </ProtectedRoute>
          }
        />

        {/* ============================================
            GENERIC PROTECTED PLACEHOLDER
            ============================================ */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div style={{ padding: '2rem', textAlign: 'center' }}>Profile Page (Coming Soon)</div>
            </ProtectedRoute>
          }
        />

        {/* ============================================
            OLD ROUTE COMPATIBILITY
            ============================================ */}

        <Route
          path="/marketplace/my-orders"
          element={<Navigate to="/my-orders" replace />}
        />

        {/* ============================================
            404 - MUST BE LAST
            ============================================ */}

        <Route
          path="*"
          element={
            <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
              <div className="text-center bg-white p-12 rounded-xl shadow-sm max-w-md">
                <h1 className="text-6xl font-bold text-[#1a3a2a] mb-4">
                  404
                </h1>
                <p className="text-xl text-[#888888] mb-6">
                  Page not found
                </p>
                <Link
                  to="/"
                  className="inline-block px-6 py-3 bg-[#1a3a2a] text-white rounded-lg hover:bg-[#2d5a3a] transition"
                >
                  Go Home
                </Link>
              </div>
            </div>
          }
        />
      </Routes>
    </>
  );
}

// ===== MAIN APP =====
export default function App() {
  return (
    <AuthProvider>
      <FarmerProvider>
        <CartProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CartProvider>
      </FarmerProvider>
    </AuthProvider>
  );
}