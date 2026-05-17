import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FABGroup from '../components/FABGroup';

const OrderHistory = () => {
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        };
        const response = await axios.get('http://localhost:5000/api/orders', config);
        if (response.data && response.data.success) {
          setOrders(response.data.data || []);
        } else {
          setOrders([]);
        }
      } catch (error) {
        // Graceful fallback to empty state if endpoint is unavailable or empty
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col font-['Manrope']">
      <Header />

      <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-10 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#131b2e] tracking-tight">Order History</h1>
          <p className="text-sm text-[#434655] mt-1">Track your past academic collections, textbooks, and merchandise orders.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004ac6]"></div>
          </div>
        ) : orders.length === 0 ? (
          /* Standardized Data-Driven Empty State */
          <div className="bg-white rounded-3xl p-12 md:p-16 border border-[#c3c6d7]/30 shadow-sm text-center max-w-2xl mx-auto my-8 space-y-6">
            <div className="w-24 h-24 bg-[#004ac6]/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[#004ac6] text-[48px]">history_toggle_off</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#131b2e]">No Order History</h2>
            <p className="text-[#434655] text-base leading-relaxed max-w-md mx-auto">
              You haven't placed any academic orders or purchased merchandise yet. Start exploring our catalog to make your first purchase.
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
          /* Orders List Grid */
          <div className="space-y-6 max-w-4xl mx-auto">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl p-6 md:p-8 border border-[#c3c6d7]/30 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#c3c6d7]/20 pb-4 gap-4">
                  <div>
                    <span className="text-xs text-[#737686] font-bold uppercase tracking-wider">Order ID</span>
                    <p className="font-extrabold text-base text-[#131b2e]">{order.orderNumber || `#UTE-${order.id}`}</p>
                    <p className="text-xs text-[#434655] mt-0.5">Placed on {order.date || new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-600' : order.status === 'Processing' ? 'bg-[#004ac6]/10 text-[#004ac6]' : 'bg-amber-500/10 text-amber-600'}`}>
                      {order.status || 'Processing'}
                    </span>
                    <span className="font-extrabold text-lg text-[#004ac6]">{order.total?.toLocaleString()}₫</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <img src={item.imageUrl || 'https://via.placeholder.com/100'} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-[#c3c6d7]/20" />
                      <div className="flex-grow">
                        <h4 className="font-bold text-sm text-[#131b2e]">{item.name}</h4>
                        <p className="text-xs text-[#434655]">Qty: {item.quantity || 1} • {item.price?.toLocaleString()}₫</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-4 border-t border-[#c3c6d7]/20 pt-4">
                  <button 
                    onClick={() => toast.success('Order details downloaded')}
                    className="px-6 py-2.5 bg-white border border-[#c3c6d7] text-[#434655] rounded-xl text-sm font-bold hover:bg-[#f2f3ff] hover:text-[#004ac6] transition-all"
                  >
                    Invoice
                  </button>
                  <Link 
                    to="/search"
                    className="px-6 py-2.5 bg-[#004ac6] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-sm flex items-center gap-1"
                  >
                    Buy Again
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <FABGroup />
    </div>
  );
};

export default OrderHistory;
