import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FABGroup from '../components/FABGroup';

const Notifications = () => {
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        };
        const response = await axios.get('http://localhost:5000/api/notifications', config);
        if (response.data && response.data.success) {
          setNotifications(response.data.data || []);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        // Graceful fallback to empty state if endpoint is unavailable or empty
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    toast.success('Marked as read');
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col font-['Manrope']">
      <Header />

      <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-10 py-8 md:py-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#131b2e] tracking-tight">Notifications</h1>
            <p className="text-sm text-[#434655] mt-1">Stay updated with academic notices, promotions, and order status.</p>
          </div>
          {notifications.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="self-start sm:self-auto px-6 py-2.5 bg-white border border-[#c3c6d7] text-[#434655] rounded-xl text-sm font-bold hover:bg-[#f2f3ff] hover:text-[#004ac6] transition-all shadow-sm"
            >
              Clear All
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004ac6]"></div>
          </div>
        ) : notifications.length === 0 ? (
          /* Standardized Data-Driven Empty State */
          <div className="bg-white rounded-3xl p-12 md:p-16 border border-[#c3c6d7]/30 shadow-sm text-center max-w-2xl mx-auto my-8 space-y-6">
            <div className="w-24 h-24 bg-[#004ac6]/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[#004ac6] text-[48px]">notifications_off</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#131b2e]">No New Notifications</h2>
            <p className="text-[#434655] text-base leading-relaxed max-w-md mx-auto">
              You're all caught up! There are no new announcements, order updates, or academic notices at this time.
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
          /* Notifications List */
          <div className="space-y-4 max-w-4xl mx-auto">
            {notifications.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white rounded-2xl p-6 border transition-all shadow-sm flex items-start gap-4 ${item.read ? 'border-[#c3c6d7]/30 opacity-70' : 'border-[#004ac6]/40 ring-2 ring-[#004ac6]/5 bg-[#fcfdff]'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${item.type === 'order' ? 'bg-[#004ac6]/10 text-[#004ac6]' : item.type === 'promo' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  <span className="material-symbols-outlined">
                    {item.type === 'order' ? 'local_shipping' : item.type === 'promo' ? 'percent' : 'campaign'}
                  </span>
                </div>

                <div className="flex-grow space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686]">
                      {item.category || 'Announcement'}
                    </span>
                    <span className="text-xs text-[#737686] font-medium">{item.date || 'Just now'}</span>
                  </div>
                  <h3 className="font-bold text-base text-[#131b2e]">{item.title}</h3>
                  <p className="text-sm text-[#434655] leading-relaxed">{item.message}</p>
                  {item.link && (
                    <div className="pt-2">
                      <Link to={item.link} className="text-xs font-bold text-[#004ac6] hover:underline inline-flex items-center gap-1">
                        View details
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      </Link>
                    </div>
                  )}
                </div>

                {!item.read && (
                  <button 
                    onClick={() => handleMarkAsRead(item.id)}
                    className="w-8 h-8 rounded-full hover:bg-[#f2f3ff] text-[#004ac6] flex items-center justify-center transition-colors flex-shrink-0"
                    title="Mark as read"
                  >
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                  </button>
                )}
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

export default Notifications;
