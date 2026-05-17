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
import Reviews from './pages/Reviews';
import AddressBook from './pages/AddressBook';

import { Toaster } from 'react-hot-toast';

import { useSelector } from 'react-redux';

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/user/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/order-history" element={user ? <OrderHistory /> : <Navigate to="/login" />} />
        <Route path="/reviews" element={user ? <Reviews /> : <Navigate to="/login" />} />
        <Route path="/wishlist" element={user ? <Wishlist /> : <Navigate to="/login" />} />
        <Route path="/address-book" element={user ? <AddressBook /> : <Navigate to="/login" />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
