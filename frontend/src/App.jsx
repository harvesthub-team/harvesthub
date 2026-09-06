import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';
import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import FarmerIncomingOrders from './pages/FarmerIncomingOrders';
import OrderSuccess from './pages/OrderSuccess';
import OrderDetails from './pages/OrderDetails';

// Placeholder Home page — Viranja will build the real one
function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '80vh',
      fontFamily: 'Inter, sans-serif',
      color: '#211d15',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1a3a2a' }}>🌾 HarvestHub</h1>
      <p style={{ fontSize: '1.2rem', color: '#5b5645' }}>Home Page — Coming Soon</p>
      <p style={{ fontSize: '1rem', color: '#888888', marginTop: '0.5rem' }}>Viranja is building this page</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <div style={{ padding: '2rem', textAlign: 'center' }}>Profile Page (Coming Soon)</div>
            </ProtectedRoute>
          } />
{/* BUYER ORDER ROUTES */}

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

{/* FARMER ORDER ROUTE */}

<Route
  path="/farmer/incoming-orders"
  element={
    <ProtectedRoute requiredRole="farmer">
      <FarmerIncomingOrders />
    </ProtectedRoute>
  }
/>
          {/* 
            Role-based Routes — will be added later
            
          */}
        </Routes>
      </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}