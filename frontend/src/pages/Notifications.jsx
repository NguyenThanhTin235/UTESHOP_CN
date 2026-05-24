import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FABGroup from '../components/FABGroup';

const Notifications = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All'); // 'All', 'Orders', 'Promotions', 'System'
  const [filterType, setFilterType] = useState('Recent'); // 'Recent', 'Unread'
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get('http://localhost:5000/api/notifications', config);
        if (response.data && response.data.success) {
          const data = response.data.data || [];
          setNotifications(data);
          if (data.length > 0) {
            setSelectedNotification(data[0]);
          }
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error('Fetch notifications error:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Khi danh sách lọc thay đổi, tự động chọn item đầu tiên nếu chưa chọn
  const filteredNotifications = notifications.filter(n => {
    if (selectedCategory === 'Orders' && n.type !== 'order') return false;
    if (selectedCategory === 'Promotions' && n.type !== 'promotion') return false;
    if (selectedCategory === 'System' && n.type !== 'system') return false;
    if (filterType === 'Unread' && n.is_read) return false;
    return true;
  });

  const handleSelectNotification = async (item) => {
    setSelectedNotification(item);
    if (!item.is_read) {
      // Đánh dấu đã đọc trên state
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        await axios.put(`http://localhost:5000/api/notifications/${item.id}/read`, {}, config);
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success('Marked all as read');
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.put('http://localhost:5000/api/notifications/read-all', {}, config);
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const handleClearAll = async () => {
    setNotifications([]);
    setSelectedNotification(null);
    toast.success('Cleared all notifications');
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.delete('http://localhost:5000/api/notifications/clear-all', config);
    } catch (error) {
      console.error('Clear all error:', error);
    }
  };

  const getNotificationStyles = (item, isSelected = false) => {
    if (!item) {
      return {
        icon: 'notifications',
        classes: 'bg-blue-50 text-[#004ac6] border border-blue-100',
        iconClass: 'bg-blue-50 text-[#004ac6] border border-blue-100',
        cardClass: isSelected 
          ? 'bg-[#eaedff] border-l-4 border-l-[#004ac6]' 
          : !item?.is_read 
            ? 'bg-[#f0f4ff] border-l-4 border-l-[#004ac6] hover:bg-[#004ac6]/5' 
            : 'bg-white hover:bg-[#f7f9ff] border-l-4 border-l-transparent',
        badgeClass: 'bg-[#004ac6]/10 text-[#004ac6] border border-blue-100/30',
        detailBg: 'bg-[#f7f9ff]',
        titleClass: 'text-[#131b2e] font-bold',
        dateClass: 'text-[#004ac6]'
      };
    }
    
    let icon = 'notifications';
    let iconClass = 'bg-blue-50 text-[#004ac6] border border-blue-100';
    let badgeClass = 'bg-[#004ac6]/10 text-[#004ac6] border border-blue-100/30';
    let detailBg = 'bg-[#f7f9ff]';
    let dateClass = 'text-[#004ac6]';
    
    // Status color configurations
    let theme = {
      lightBg: 'bg-blue-50/40',
      unreadBg: 'bg-blue-50/70',
      selectedBg: 'bg-blue-100/80',
      hoverBg: 'hover:bg-blue-50/30',
      borderLeft: 'border-l-[#004ac6]',
      text: 'text-[#004ac6]'
    };

    if (item.type === 'order') {
      const title = item.title?.toLowerCase() || '';
      
      // Order Cancellation & Rejections
      if (title.includes('cancel') || title.includes('reject')) {
        icon = 'cancel';
        iconClass = 'bg-rose-50 text-rose-700 border border-rose-100';
        badgeClass = 'bg-rose-100 text-rose-800 border border-rose-200';
        detailBg = 'bg-rose-50/20';
        dateClass = 'text-rose-600';
        theme = {
          unreadBg: 'bg-rose-50/40',
          selectedBg: 'bg-rose-100/60',
          hoverBg: 'hover:bg-rose-50/25',
          borderLeft: 'border-l-rose-500',
          text: 'text-rose-800'
        };
      }
      // Order Refund
      else if (title.includes('refund')) {
        icon = 'payments';
        iconClass = 'bg-amber-50 text-amber-700 border border-amber-100';
        badgeClass = 'bg-amber-100 text-amber-800 border border-amber-200';
        detailBg = 'bg-amber-50/20';
        dateClass = 'text-amber-600';
        theme = {
          unreadBg: 'bg-amber-50/40',
          selectedBg: 'bg-amber-100/60',
          hoverBg: 'hover:bg-amber-50/25',
          borderLeft: 'border-l-amber-500',
          text: 'text-amber-800'
        };
      }
      // Order Pending Cancellation Request
      else if (title.includes('pending')) {
        icon = 'hourglass_empty';
        iconClass = 'bg-orange-50 text-orange-700 border border-orange-100';
        badgeClass = 'bg-orange-100 text-orange-800 border border-orange-200';
        detailBg = 'bg-orange-50/20';
        dateClass = 'text-orange-600';
        theme = {
          unreadBg: 'bg-orange-50/40',
          selectedBg: 'bg-orange-100/60',
          hoverBg: 'hover:bg-orange-50/25',
          borderLeft: 'border-l-orange-500',
          text: 'text-orange-800'
        };
      }
      // Order Dispute
      else if (title.includes('dispute')) {
        icon = 'warning';
        iconClass = 'bg-purple-50 text-purple-700 border border-purple-100';
        badgeClass = 'bg-purple-100 text-purple-800 border border-purple-200';
        detailBg = 'bg-purple-50/20';
        dateClass = 'text-purple-600';
        theme = {
          unreadBg: 'bg-purple-50/40',
          selectedBg: 'bg-purple-100/60',
          hoverBg: 'hover:bg-purple-50/25',
          borderLeft: 'border-l-purple-500',
          text: 'text-purple-800'
        };
      }
      // Order Delivered
      else if (title.includes('deliver') || title.includes('complete')) {
        icon = 'check_circle';
        iconClass = 'bg-teal-50 text-teal-700 border border-teal-100';
        badgeClass = 'bg-teal-100 text-teal-800 border border-teal-200';
        detailBg = 'bg-teal-50/20';
        dateClass = 'text-teal-600';
        theme = {
          unreadBg: 'bg-teal-50/40',
          selectedBg: 'bg-teal-100/60',
          hoverBg: 'hover:bg-teal-50/25',
          borderLeft: 'border-l-teal-500',
          text: 'text-teal-800'
        };
      }
      // Order Shipped
      else if (title.includes('ship') || title.includes('way')) {
        icon = 'local_shipping';
        iconClass = 'bg-indigo-50 text-indigo-700 border border-indigo-100';
        badgeClass = 'bg-indigo-100 text-indigo-800 border border-indigo-200';
        detailBg = 'bg-indigo-50/20';
        dateClass = 'text-indigo-600';
        theme = {
          unreadBg: 'bg-indigo-50/40',
          selectedBg: 'bg-indigo-100/60',
          hoverBg: 'hover:bg-indigo-50/25',
          borderLeft: 'border-l-indigo-500',
          text: 'text-indigo-800'
        };
      }
      // Order Confirmed
      else if (title.includes('confirm') || title.includes('verified')) {
        icon = 'task_alt';
        iconClass = 'bg-sky-50 text-sky-700 border border-sky-100';
        badgeClass = 'bg-sky-100 text-sky-800 border border-sky-200';
        detailBg = 'bg-[#f0f9ff]';
        dateClass = 'text-sky-600';
        theme = {
          unreadBg: 'bg-sky-50/40',
          selectedBg: 'bg-sky-100/60',
          hoverBg: 'hover:bg-sky-50/25',
          borderLeft: 'border-l-sky-500',
          text: 'text-sky-800'
        };
      }
      // Order Placed/Paid
      else if (title.includes('placed') || title.includes('paid') || title.includes('success')) {
        icon = 'shopping_basket';
        iconClass = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
        badgeClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
        detailBg = 'bg-emerald-50/20';
        dateClass = 'text-emerald-600';
        theme = {
          unreadBg: 'bg-emerald-50/40',
          selectedBg: 'bg-emerald-100/60',
          hoverBg: 'hover:bg-emerald-50/25',
          borderLeft: 'border-l-emerald-500',
          text: 'text-emerald-800'
        };
      }
      // Default Order
      else {
        icon = 'package_2';
        iconClass = 'bg-blue-50 text-[#004ac6] border border-blue-100';
        badgeClass = 'bg-blue-100 text-blue-800 border border-blue-200';
        detailBg = 'bg-blue-50/20';
        dateClass = 'text-[#004ac6]';
        theme = {
          unreadBg: 'bg-blue-50/40',
          selectedBg: 'bg-blue-100/60',
          hoverBg: 'hover:bg-blue-50/25',
          borderLeft: 'border-l-[#004ac6]',
          text: 'text-[#004ac6]'
        };
      }
    } else if (item.type === 'promotion') {
      icon = 'sell';
      iconClass = 'bg-orange-50 text-orange-700 border border-orange-100';
      badgeClass = 'bg-orange-100 text-orange-800 border border-orange-200';
      detailBg = 'bg-orange-50/20';
      dateClass = 'text-orange-600';
      theme = {
        unreadBg: 'bg-orange-50/40',
        selectedBg: 'bg-orange-100/60',
        hoverBg: 'hover:bg-orange-50/25',
        borderLeft: 'border-l-orange-500',
        text: 'text-orange-800'
      };
    } else {
      // system
      icon = 'settings_suggest';
      iconClass = 'bg-slate-50 text-slate-700 border border-slate-200';
      badgeClass = 'bg-slate-100 text-slate-800 border border-slate-200';
      detailBg = 'bg-slate-50/20';
      dateClass = 'text-slate-600';
      theme = {
        unreadBg: 'bg-slate-50/40',
        selectedBg: 'bg-slate-100/60',
        hoverBg: 'hover:bg-slate-50/25',
        borderLeft: 'border-l-slate-400',
        text: 'text-slate-800'
      };
    }

    // Build overall card wrapper className
    let cardClass = '';
    if (isSelected) {
      cardClass = `${theme.selectedBg} border-l-4 ${theme.borderLeft}`;
    } else if (!item.is_read) {
      cardClass = `${theme.unreadBg} border-l-4 ${theme.borderLeft} ${theme.hoverBg}`;
    } else {
      cardClass = `bg-white border-l-4 border-l-transparent ${theme.hoverBg}`;
    }

    const titleClass = !item.is_read ? `${theme.text} font-bold` : 'text-[#131b2e] font-bold';

    return {
      icon,
      classes: iconClass, // backward compatibility
      iconClass,
      cardClass,
      badgeClass,
      detailBg,
      titleClass,
      dateClass
    };
  };

  const getActionText = (type, title) => {
    const t = title?.toLowerCase() || '';
    if (t.includes('delivered')) return 'Review Product';
    if (t.includes('welcome')) return 'Explore Store';
    if (t.includes('password')) return 'View Profile';
    if (type === 'order') return 'Track Order';
    if (type === 'promotion') return 'Explore Deals';
    return 'Check Security';
  };

  const handleActionClick = (item) => {
    if (!item) return;
    const t = item.title?.toLowerCase() || '';
    if (t.includes('welcome')) {
      navigate('/search');
      return;
    }
    if (t.includes('delivered')) {
      navigate('/reviews');
      return;
    }
    if (t.includes('password') || t.includes('login') || t.includes('security')) {
      navigate('/user/profile');
      return;
    }
    if (item.link) {
      const targetLink = item.link === '/profile' ? '/user/profile' : item.link;
      navigate(targetLink);
    } else {
      navigate('/user/profile');
    }
  };

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col font-['Manrope']">
      <Header />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 md:py-12 flex flex-col justify-center overflow-hidden">
        {/* Page Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#131b2e] tracking-tight">Notifications</h1>
            <p className="text-sm text-[#434655] mt-1">Manage your academic notifications, promotions, and order status.</p>
          </div>
          {notifications.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="self-start sm:self-auto px-6 py-2.5 bg-white border border-[#c3c6d7] text-[#434655] rounded-xl text-sm font-bold hover:bg-[#f2f3ff] hover:text-[#004ac6] transition-all shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Clear all
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004ac6]"></div>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 md:p-16 border border-[#c3c6d7]/30 shadow-sm text-center max-w-2xl mx-auto my-8 space-y-6">
            <div className="w-24 h-24 bg-[#004ac6]/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[#004ac6] text-[48px]">notifications_off</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#131b2e]">No new notifications</h2>
            <p className="text-[#434655] text-base leading-relaxed max-w-md mx-auto">
              You're all caught up! There are no new notifications about orders or promotions at the moment.
            </p>
            <div className="pt-4">
              <Link 
                to="/search" 
                className="inline-flex items-center gap-2 bg-[#004ac6] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-[#004ac6]/20 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">explore</span>
                Explore Store
              </Link>
            </div>
          </div>
        ) : (
          /* 3-Column Template Layout */
          <div className="flex flex-col lg:flex-row w-full h-[75vh] min-h-[600px] bg-white rounded-[2rem] border border-[#c3c6d7] shadow-2xl overflow-hidden">
            
            {/* 1. Sidebar Filter */}
            <aside className="w-full lg:w-80 flex flex-col border-b lg:border-b-0 lg:border-r border-[#c3c6d7] bg-white shrink-0">
              <div className="p-6">
                <h2 className="text-xl font-extrabold tracking-tight mb-6 hidden lg:block">Categories</h2>
                <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                  <button 
                    onClick={() => setSelectedCategory('All')} 
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group shrink-0 lg:shrink ${selectedCategory === 'All' ? 'bg-[#004ac6]/10 text-[#004ac6] font-bold' : 'text-[#434655] font-medium hover:bg-[#f7f9ff]'}`}
                  >
                    <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">all_inclusive</span>
                    <span>All Notifications</span>
                  </button>
                  <button 
                    onClick={() => setSelectedCategory('Orders')} 
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group shrink-0 lg:shrink ${selectedCategory === 'Orders' ? 'bg-[#004ac6]/10 text-[#004ac6] font-bold' : 'text-[#434655] font-medium hover:bg-[#f7f9ff]'}`}
                  >
                    <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">package_2</span>
                    <span>Orders</span>
                  </button>
                  <button 
                    onClick={() => setSelectedCategory('Promotions')} 
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group shrink-0 lg:shrink ${selectedCategory === 'Promotions' ? 'bg-[#004ac6]/10 text-[#004ac6] font-bold' : 'text-[#434655] font-medium hover:bg-[#f7f9ff]'}`}
                  >
                    <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">sell</span>
                    <span>Promotions</span>
                  </button>
                  <button 
                    onClick={() => setSelectedCategory('System')} 
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group shrink-0 lg:shrink ${selectedCategory === 'System' ? 'bg-[#004ac6]/10 text-[#004ac6] font-bold' : 'text-[#434655] font-medium hover:bg-[#f7f9ff]'}`}
                  >
                    <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">settings_suggest</span>
                    <span>System</span>
                  </button>
                </nav>
              </div>
              <div className="mt-auto p-6 border-t border-[#c3c6d7] hidden lg:block">
                <button 
                  onClick={handleMarkAllAsRead} 
                  className="text-[#004ac6] text-sm font-bold flex items-center gap-2 hover:underline"
                >
                  <span className="material-symbols-outlined text-[18px]">done_all</span>
                  Mark all as read
                </button>
              </div>
            </aside>

            {/* 2. List Area */}
            <section className="flex flex-col flex-grow bg-white border-b lg:border-b-0 overflow-hidden">
              <div className="p-4 border-b border-[#c3c6d7] bg-[#f7f9ff] flex justify-between items-center">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setFilterType('Recent')}
                    className={`px-4 py-1.5 rounded-full text-xs transition-colors ${filterType === 'Recent' ? 'bg-white border border-[#c3c6d7] font-bold shadow-sm text-[#131b2e]' : 'font-medium text-[#434655] hover:bg-[#e1e4f5]'}`}
                  >
                    Recent
                  </button>
                  <button 
                    onClick={() => setFilterType('Unread')}
                    className={`px-4 py-1.5 rounded-full text-xs transition-colors ${filterType === 'Unread' ? 'bg-white border border-[#c3c6d7] font-bold shadow-sm text-[#131b2e]' : 'font-medium text-[#434655] hover:bg-[#e1e4f5]'}`}
                  >
                    Unread
                  </button>
                </div>
                <span className="text-xs font-bold text-[#737686]">
                  {filteredNotifications.length} notifications
                </span>
              </div>

              <div className="flex-grow overflow-y-auto custom-scrollbar">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#737686] py-16">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
                    <p className="text-sm font-medium">No notifications in this category</p>
                  </div>
                ) : (
                  filteredNotifications.map((item) => {
                    const isSelected = selectedNotification?.id === item.id;
                    const styles = getNotificationStyles(item, isSelected);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => handleSelectNotification(item)} 
                        className={`p-6 flex gap-4 cursor-pointer transition-colors border-b border-[#c3c6d7]/30 ${styles.cardClass}`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${styles.iconClass}`}>
                          <span className="material-symbols-outlined">
                            {styles.icon}
                          </span>
                        </div>
                        <div className="flex-grow space-y-1">
                          <div className="flex justify-between items-start">
                            <h3 className={styles.titleClass}>{item.title}</h3>
                            <span className={`text-[10px] font-bold uppercase shrink-0 ml-2 ${styles.dateClass}`}>{item.date || 'JUST NOW'}</span>
                          </div>
                          <p className="text-sm text-[#434655] line-clamp-2">{item.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* 3. Detail Area */}
            {selectedNotification ? (
              <section className="flex lg:flex flex-col w-full lg:w-[450px] border-t lg:border-t-0 lg:border-l border-[#c3c6d7] bg-white overflow-y-auto custom-scrollbar shrink-0">
                <div className="p-8 space-y-8">
                  <div className="flex flex-col items-center text-center space-y-4 py-6 border-b border-[#c3c6d7]/60">
                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center ${getNotificationStyles(selectedNotification).classes}`}>
                      <span className="material-symbols-outlined text-4xl">
                        {getNotificationStyles(selectedNotification).icon}
                      </span>
                    </div>
                    <div>
                      <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest ${getNotificationStyles(selectedNotification).badgeClass}`}>
                        {selectedNotification.category || 'Notification'}
                      </span>
                      <h2 className="text-xl font-black text-[#131b2e] mt-3">{selectedNotification.title}</h2>
                      <p className="text-xs text-[#434655] font-medium mt-1">Updated: {selectedNotification.date || 'Recently'}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className={`rounded-3xl p-6 border border-[#c3c6d7]/30 ${getNotificationStyles(selectedNotification).detailBg}`}>
                      <p className="text-sm text-[#131b2e] leading-relaxed whitespace-pre-line font-medium">
                        {selectedNotification.detailContent || selectedNotification.content}
                      </p>
                    </div>

                    {selectedNotification.orderSummary && (
                      <div className="border border-[#c3c6d7] rounded-3xl p-6 space-y-4 bg-white shadow-sm">
                        <h4 className="font-bold text-sm text-[#131b2e]">Order Summary</h4>
                        <div className="flex gap-4 items-center">
                          <img src={selectedNotification.orderSummary.image} alt="Product" className="w-16 h-16 rounded-2xl object-cover border border-[#c3c6d7]/30 shadow-sm" />
                          <div>
                            <p className="text-sm font-bold text-[#131b2e]">{selectedNotification.orderSummary.name}</p>
                            <p className="text-xs text-[#434655] mt-0.5">{selectedNotification.orderSummary.variant}</p>
                            <p className="text-xs font-bold text-[#004ac6] mt-1">Qty: {selectedNotification.orderSummary.qty}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success('Copied notification link');
                        }}
                        className="w-full py-4 border border-[#c3c6d7] rounded-2xl hover:bg-[#f7f9ff] text-[#434655] font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        title="Share notification"
                      >
                        <span className="material-symbols-outlined">share</span>
                        <span>Share Notification</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <section className="hidden lg:flex flex-col items-center justify-center w-[450px] border-l border-[#c3c6d7] bg-[#f7f9ff] text-[#737686] p-8 text-center shrink-0">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-40">touch_app</span>
                <h3 className="font-bold text-base text-[#131b2e] mb-1">Select a notification</h3>
                <p className="text-xs">Click on a notification from the list to view its details and related actions.</p>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />
      <FABGroup />
    </div>
  );
};

export default Notifications;
