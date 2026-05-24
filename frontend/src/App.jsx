import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Search from './pages/Search';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Notifications from './pages/Notifications';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import CancelOrder from './pages/CancelOrder';
import Reviews from './pages/Reviews';
import AddressBook from './pages/AddressBook';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import SecuritySettings from './pages/SecuritySettings';
import ProtectedRoute from './components/ProtectedRoute';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import VNPayMock from './pages/VNPayMock';
import VNPayReturn from './pages/VNPayReturn';
import Coins from './pages/Coins';
import ShopDetail from './pages/ShopDetail';


import { Toaster, useToasterStore, toast } from 'react-hot-toast';
import { useEffect } from 'react';

import { useSelector } from 'react-redux';

const RoleBasedRedirect = ({ user }) => {
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        window.location.href = '/admin/';
      } else if (user.role === 'manager') {
        window.location.href = '/manager/';
      } else if (user.role === 'seller' || user.role === 'vendor') {
        window.location.href = '/seller/';
      } else {
        window.location.href = '/';
      }
    }
  }, [user]);
  return null;
};

function App() {
  const { user } = useSelector((state) => state.auth);
  const { toasts } = useToasterStore();

  useEffect(() => {
    toasts
      .filter((t) => t.visible)
      .filter((_, i) => i >= 1)
      .forEach((t) => toast.dismiss(t.id));
  }, [toasts]);

  return (
    <Router>
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          duration: 3000,
          style: {
            maxWidth: '500px'
          }
        }} 
      />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/user/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/order-history" element={user ? <OrderHistory /> : <Navigate to="/login" />} />
        <Route path="/order-history/:orderId" element={user ? <OrderDetail /> : <Navigate to="/login" />} />
        <Route path="/order-history/:orderId/cancel" element={user ? <CancelOrder /> : <Navigate to="/login" />} />
        <Route path="/reviews" element={user ? <Reviews /> : <Navigate to="/login" />} />
        <Route path="/wishlist" element={user ? <Wishlist /> : <Navigate to="/login" />} />
        <Route path="/address-book" element={user ? <AddressBook /> : <Navigate to="/login" />} />
        <Route path="/security" element={user ? <SecuritySettings /> : <Navigate to="/login" />} />
        <Route path="/coins" element={user ? <Coins /> : <Navigate to="/login" />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={user ? <Checkout /> : <Navigate to="/login" />} />
        <Route path="/order-success" element={user ? <OrderSuccess /> : <Navigate to="/login" />} />
        <Route path="/vnpay-mock" element={user ? <VNPayMock /> : <Navigate to="/login" />} />
        <Route path="/payment/vnpay/return" element={user ? <VNPayReturn /> : <Navigate to="/login" />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/login" element={!user ? <Login /> : <RoleBasedRedirect user={user} />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/shop/:slug" element={<ShopDetail />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/manager/*" element={<ProtectedRoute allowedRoles={['manager']}><ManagerDashboard /></ProtectedRoute>} />
        <Route path="/seller/*" element={<ProtectedRoute allowedRoles={['seller', 'vendor']}><SellerDashboard /></ProtectedRoute>} />

        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;

