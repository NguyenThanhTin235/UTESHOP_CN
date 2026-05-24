import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SellerHeader = ({ activeTab, headerInfo, currentOrder, user, navigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('http://localhost:5000/api/notifications/unread-count', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setUnreadCount(res.data.data.count);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
  }, [user]);

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-40 shrink-0 shadow-sm">
      <div className="flex items-center gap-4">
        {activeTab === 'add-product' || activeTab === 'order-detail' ? (
          <button onClick={() => navigate(activeTab === 'add-product' ? '/seller/products' : '/seller/orders')} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
        ) : (
          <span className="material-symbols-outlined text-[#004ac6] text-2xl">
            {headerInfo.icon}
          </span>
        )}
        <div className="flex items-center">
          {activeTab === 'order-detail' && <div className="h-8 w-px bg-slate-200 mx-4"></div>}
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {activeTab === 'order-detail' ? (
              <>Order Details <span className="text-[#0052CC] ml-2">#{currentOrder.code || window.location.pathname.split('/').pop()}</span></>
            ) : (
              headerInfo.title
            )}
          </h1>
        </div>

        {activeTab !== 'settings' && activeTab !== 'add-product' && activeTab !== 'order-detail' && (
          <div className="ml-8 hidden md:flex items-center bg-[#F1F5F9] rounded-2xl px-4 py-2.5 w-80 group focus-within:ring-2 focus-within:ring-blue-100 transition-all border border-slate-200/60">
            <span className="material-symbols-outlined text-slate-400 text-xl group-focus-within:text-[#004ac6]">search</span>
            <input
              type="text"
              placeholder={
                activeTab === 'products' ? 'Search products by name or SKU...' :
                  activeTab === 'orders' ? 'Search orders by ID or customer...' :
                    activeTab === 'cancellations' ? 'Search cancelled orders...' :
                      activeTab === 'reviews' ? 'Search reviews...' :
                        activeTab === 'messages' ? 'Search conversations...' :
                          activeTab === 'wallet' ? 'Search transactions...' :
                            activeTab === 'analytics' ? 'Search analytics data...' :
                              'Search...'
              }
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 placeholder:font-medium ml-2 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {activeTab === 'products' && (
          <button
            onClick={() => navigate('/seller/add-product')}
            className="bg-[#004ac6] text-white px-6 py-2.5 rounded-[14px] text-sm font-bold shadow-md shadow-blue-200/50 hover:bg-[#003da8] transition-all cursor-pointer flex items-center gap-2 mr-2"
          >
            <span className="material-symbols-outlined text-[20px] font-bold">add</span>
            Add New Product
          </button>
        )}

        {activeTab === 'settings' && (
          <button
            onClick={() => window.dispatchEvent(new Event('save-shop-settings'))}
            className="bg-[#004ac6] text-white px-6 py-2.5 rounded-[14px] text-sm font-bold shadow-md shadow-blue-200/50 hover:bg-[#003da8] transition-all cursor-pointer"
          >
            Save All Changes
          </button>
        )}

        {activeTab === 'add-product' && (
          <div className="flex items-center gap-3 mr-4">
            <button onClick={() => navigate('/seller/products')} className="px-6 py-2.5 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
              Discard
            </button>
            <button onClick={() => window.dispatchEvent(new Event('submit-add-product'))} className="bg-[#0052CC] text-white px-8 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-blue-200 hover:brightness-110 active:scale-95 transition-all cursor-pointer">
              Save & Publish
            </button>
          </div>
        )}

        {activeTab === 'order-detail' && (
          <div className="flex items-center gap-3 mr-4">
            <button className="px-6 py-2.5 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-lg">print</span>
              Print Invoice
            </button>
            {currentOrder.status === 'confirmed' && (
              <button onClick={() => window.dispatchEvent(new Event('open-shipment-modal'))} className="bg-[#0052CC] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-lg">local_shipping</span>
                Confirm Shipment
              </button>
            )}
          </div>
        )}

        {activeTab !== 'settings' && activeTab !== 'add-product' && activeTab !== 'order-detail' && (
          <button
            onClick={() => navigate('/notifications')}
            className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-xl transition-all relative cursor-pointer border border-slate-100"
          >
            <span className="material-symbols-outlined text-2xl">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#ba1a1a] text-[10px] text-white flex items-center justify-center rounded-full font-bold shadow-sm">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        )}

        <div className="flex items-center gap-3 bg-[#F1F5F9] pl-1 pr-4 py-1 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-200 transition-all group">
          <div className="w-8 h-8 rounded-full bg-[#004ac6] flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-200">
            {user?.fullName?.charAt(0).toUpperCase() || 'J'}
          </div>
          <span className="text-sm font-bold text-slate-700">{user?.fullName || 'John Doe'}</span>
          <span className="material-symbols-outlined text-slate-400 text-lg group-hover:translate-y-0.5 transition-transform">expand_more</span>
        </div>
      </div>
    </header>
  );
};

export default SellerHeader;
