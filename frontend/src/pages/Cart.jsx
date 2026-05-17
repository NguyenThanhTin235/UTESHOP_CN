import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FABGroup from '../components/FABGroup';

const Cart = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        // Attempt to fetch user cart from backend
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        };
        const response = await axios.get('http://localhost:5000/api/cart', config);
        if (response.data && response.data.success) {
          setCartItems(response.data.data || []);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        // Graceful fallback to empty state if endpoint is unavailable or empty
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleRemoveItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast.success('Item removed from cart');
  };

  const handleQuantityChange = (id, type) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = type === 'inc' ? item.quantity + 1 : item.quantity - 1;
        return { ...item, quantity: newQty < 1 ? 1 : newQty };
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col font-['Manrope']">
      <Header />

      <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-10 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#131b2e] tracking-tight">Shopping Cart</h1>
          <p className="text-sm text-[#434655] mt-1">Review your academic collections and proceed to checkout.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004ac6]"></div>
          </div>
        ) : cartItems.length === 0 ? (
          /* Standardized Data-Driven Empty State */
          <div className="bg-white rounded-3xl p-12 md:p-16 border border-[#c3c6d7]/30 shadow-sm text-center max-w-2xl mx-auto my-8 space-y-6">
            <div className="w-24 h-24 bg-[#004ac6]/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[#004ac6] text-[48px]">remove_shopping_cart</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#131b2e]">Your Cart is Empty</h2>
            <p className="text-[#434655] text-base leading-relaxed max-w-md mx-auto">
              Looks like you haven't added any academic collections, textbooks, or official merchandise to your cart yet. Explore our catalog to find what you need.
            </p>
            <div className="pt-4">
              <Link 
                to="/search" 
                className="inline-flex items-center gap-2 bg-[#004ac6] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-[#004ac6]/20 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">explore</span>
                Explore Catalog
              </Link>
            </div>
          </div>
        ) : (
          /* Cart Content Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-6 border border-[#c3c6d7]/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <img 
                    src={item.imageUrl || 'https://via.placeholder.com/150'} 
                    alt={item.name} 
                    className="w-24 h-24 rounded-xl object-cover border border-[#c3c6d7]/20 flex-shrink-0"
                  />
                  <div className="flex-grow space-y-1">
                    <span className="text-[10px] bg-[#004ac6]/10 text-[#004ac6] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {item.category || 'Academic'}
                    </span>
                    <h3 className="font-bold text-lg text-[#131b2e] line-clamp-1">{item.name}</h3>
                    <p className="text-sm text-[#434655]">Variant: {item.variant || 'Standard'}</p>
                    <p className="text-primary font-extrabold text-base md:hidden">{item.price?.toLocaleString()}₫</p>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-[#c3c6d7]/20">
                    {/* Quantity Selector */}
                    <div className="flex items-center bg-[#faf8ff] rounded-xl p-1 border border-[#c3c6d7]/30">
                      <button 
                        onClick={() => handleQuantityChange(item.id, 'dec')}
                        className="w-8 h-8 flex items-center justify-center hover:bg-[#e2e4f0] rounded-lg transition-colors text-[#131b2e]"
                      >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <input 
                        type="text" 
                        value={item.quantity} 
                        readOnly 
                        className="w-10 text-center bg-transparent border-none focus:ring-0 font-bold text-sm text-[#131b2e]"
                      />
                      <button 
                        onClick={() => handleQuantityChange(item.id, 'inc')}
                        className="w-8 h-8 flex items-center justify-center hover:bg-[#e2e4f0] rounded-lg transition-colors text-[#131b2e]"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right hidden md:block w-28">
                      <p className="font-extrabold text-[#004ac6] text-lg">{(item.price * item.quantity).toLocaleString()}₫</p>
                    </div>

                    {/* Remove Button */}
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-[#737686] hover:text-[#ba1a1a] hover:bg-[#ba1a1a]/10 rounded-xl transition-all"
                      title="Remove item"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#c3c6d7]/30 shadow-sm space-y-6 sticky top-28">
                <h2 className="text-xl font-bold text-[#131b2e] border-b border-[#c3c6d7]/20 pb-4">Order Summary</h2>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-[#434655]">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#131b2e]">{calculateSubtotal().toLocaleString()}₫</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#434655]">
                    <span>Estimated Shipping</span>
                    <span className="font-bold text-[#004ac6]">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#434655]">
                    <span>Tax (VAT 10%)</span>
                    <span className="font-bold text-[#131b2e]">{(calculateSubtotal() * 0.1).toLocaleString()}₫</span>
                  </div>

                  <div className="h-px bg-[#c3c6d7]/30 my-4"></div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-bold text-[#131b2e]">Total</span>
                    <span className="text-2xl font-extrabold text-[#004ac6]">
                      {(calculateSubtotal() * 1.1).toLocaleString()}₫
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => toast.success('Proceeding to secure checkout...')}
                  className="w-full bg-[#004ac6] text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#004ac6]/20 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">lock</span>
                  Secure Checkout
                </button>

                <div className="text-center pt-2">
                  <Link to="/search" className="text-xs font-bold text-[#004ac6] hover:underline flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <FABGroup />
    </div>
  );
};

export default Cart;
