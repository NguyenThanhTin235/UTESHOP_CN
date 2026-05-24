import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import FABGroup from '../components/FABGroup';
import { logout } from '../redux/authSlice';

const OrderHistory = () => {
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    perPage: 5
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = (localStorage.getItem('token') || sessionStorage.getItem('token') || '') || '';
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          status: activeTab,
          search: searchTerm,
          page: currentPage,
          limit: 5
        }
      });
      if (response.data && response.data.success) {
        setOrders(response.data.data || []);
        if (response.data.meta && response.data.meta.pagination) {
          setPagination(response.data.meta.pagination);
        }
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Unable to load order list. Please try again later.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, searchTerm, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleTabChange = (statusKey) => {
    setActiveTab(statusKey);
    setCurrentPage(1);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logout());
    navigate('/login');
  };

  const handleRepay = async (paymentCode) => {
    if (!paymentCode) {
      toast.error('Invalid payment code');
      return;
    }
    try {
      const token = (localStorage.getItem('token') || sessionStorage.getItem('token') || '') || '';
      const response = await axios.post(
        'http://localhost:5000/api/checkout/repay-vnpay',
        { paymentCode },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.success && response.data.data?.redirectUrl) {
        toast.success('Redirecting to VNPAY...');
        window.location.href = response.data.data.redirectUrl;
      } else {
        toast.error(response.data?.message || 'Khởi tạo thanh toán lại thất bại');
      }
    } catch (error) {
      console.error('Error repaying VNPAY order:', error);
      toast.error(
        error.response?.data?.message || 
        'Không thể khởi tạo lại giao dịch thanh toán. Vui lòng thử lại sau.'
      );
    }
  };

  const avatarSrc = user?.avatarUrl 
    ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:5000${user.avatarUrl}`) 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=004ac6&color=fff`;

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancel_pending', label: 'Cancel Pending' },
    { key: 'canceled', label: 'Cancelled' },
    { key: 'refunded', label: 'Refunded' }
  ];

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { text: 'Pending', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: 'pending_actions' };
      case 'confirmed':
        return { text: 'Confirmed', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: 'verified' };
      case 'shipped':
        return { text: 'Shipped', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20', icon: 'local_shipping' };
      case 'delivered':
        return { text: 'Delivered', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: 'check_circle' };
      case 'canceled':
        return { text: 'Cancelled', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', icon: 'cancel' };
      case 'cancel_pending':
        return { text: 'Cancel Pending', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', icon: 'hourglass_empty' };
      case 'refunded':
        return { text: 'Refunded', color: 'text-purple-600 bg-purple-500/10 border-purple-500/20', icon: 'settings_backup_restore' };
      default:
        return { text: status, color: 'text-gray-500 bg-gray-500/10 border-gray-500/20', icon: 'info' };
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-4 flex flex-col md:flex-row gap-8 items-start">
        {/* SideNavBar (Đồng bộ với Profile) */}
        <aside className="w-full md:w-72 flex flex-col gap-4 md:sticky md:top-24 flex-shrink-0">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#c3c6d7]/30 mb-2 text-left">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#004ac6] flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                <img src={avatarSrc} alt={user?.fullName || 'Avatar'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-[#131b2e] tracking-tight truncate">{user?.fullName || 'User'}</h3>
                <p className="text-sm text-[#434655]">{user?.tier || 'Standard Member'}</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-1 text-left">
            <Link to="/user/profile" className="flex items-center px-4 py-3 space-x-3 text-[#434655] hover:bg-[#f7f9ff] hover:text-[#004ac6] transition-all font-medium rounded-xl">
              <span className="material-symbols-outlined">person</span>
              <span>Personal Profile</span>
            </Link>
            <Link to="/order-history" className="flex items-center px-4 py-3 space-x-3 bg-[#004ac6] text-white font-bold rounded-xl shadow-lg shadow-[#004ac6]/20 transition-all">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
              <span>Order History</span>
            </Link>
            <Link to="/reviews" className="flex items-center px-4 py-3 space-x-3 text-[#434655] hover:bg-[#f7f9ff] hover:text-[#004ac6] transition-all font-medium rounded-xl">
              <span className="material-symbols-outlined">star</span>
              <span>My Reviews</span>
            </Link>
            <Link to="/wishlist" className="flex items-center px-4 py-3 space-x-3 text-[#434655] hover:bg-[#f7f9ff] hover:text-[#004ac6] transition-all font-medium rounded-xl">
              <span className="material-symbols-outlined">favorite</span>
              <span>Wishlist</span>
            </Link>
            <Link to="/address-book" className="flex items-center px-4 py-3 space-x-3 text-[#434655] hover:bg-[#f7f9ff] hover:text-[#004ac6] transition-all font-medium rounded-xl">
              <span className="material-symbols-outlined">location_on</span>
              <span>Shipping Address</span>
            </Link>
            <Link to="/coins" className="flex items-center px-4 py-3 space-x-3 text-[#434655] hover:bg-[#f7f9ff] hover:text-[#004ac6] transition-all font-medium rounded-xl">
              <span className="material-symbols-outlined">monetization_on</span>
              <span>My Coins</span>
            </Link>
            <Link to="/messages" className="flex items-center px-4 py-3 space-x-3 text-[#434655] hover:bg-[#f7f9ff] hover:text-[#004ac6] transition-all font-medium rounded-xl">
              <span className="material-symbols-outlined">chat</span>
              <span>Messages</span>
            </Link>
            <Link to="/security" className="flex items-center px-4 py-3 space-x-3 text-[#434655] hover:bg-[#f7f9ff] hover:text-[#004ac6] transition-all font-medium rounded-xl">
              <span className="material-symbols-outlined">security</span>
              <span>Security Settings</span>
            </Link>
          </nav>

          <div className="mt-6 pt-4 border-t border-[#c3c6d7]/50 text-left">
            <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 space-x-3 text-[#b3261e] hover:bg-[#b3261e]/10 transition-all font-medium rounded-xl cursor-pointer">
              <span className="material-symbols-outlined">logout</span>
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 w-full text-left">
          <div className="bg-white rounded-3xl shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-[#c3c6d7]/30 overflow-hidden">
            {/* Tabs Trạng thái */}
            <div className="flex border-b border-[#c3c6d7]/30 overflow-x-auto no-scrollbar bg-[#f2f3ff]/30">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex-shrink-0 px-8 py-5 text-sm font-bold transition-all ${
                    activeTab === tab.key
                      ? 'text-[#004ac6] border-b-2 border-[#004ac6]'
                      : 'text-[#434655] hover:bg-[#f2f3ff]/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 md:p-8">
              {/* Ô Tìm kiếm */}
              <form onSubmit={handleSearchSubmit} className="relative mb-8">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#434655]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search by order code, product name or shop name..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full bg-[#f2f3ff]/50 border-none rounded-2xl py-3.5 pl-12 pr-24 text-sm focus:ring-2 focus:ring-[#004ac6]/20 transition-all outline-none text-[#131b2e] font-medium"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#004ac6] text-white px-5 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all"
                >
                  Search
                </button>
              </form>

              {/* Loader */}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#004ac6]"></div>
                </div>
              ) : orders.length === 0 ? (
                /* Empty state */
                <div className="text-center py-16 space-y-4 max-w-md mx-auto">
                  <div className="w-20 h-20 bg-[#004ac6]/10 rounded-full flex items-center justify-center mx-auto mb-2 text-[#004ac6]">
                    <span className="material-symbols-outlined text-4xl">history_toggle_off</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#131b2e]">No orders found</h3>
                  <p className="text-sm text-[#434655]">
                    You have no orders in this status or matching your search term.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/search"
                      className="inline-flex items-center gap-2 bg-[#004ac6] text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 shadow-md shadow-[#004ac6]/10"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              ) : (
                /* Danh sách đơn hàng */
                <div className="space-y-6">
                  {orders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <div
                        key={order.id}
                        className="p-6 border border-[#c3c6d7]/40 rounded-3xl hover:border-[#004ac6]/20 transition-all bg-white"
                      >
                        {/* Header của Đơn hàng */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#c3c6d7]/20 gap-3">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#004ac6] font-semibold">store</span>
                            <span className="font-extrabold text-[#131b2e] tracking-tight">
                              {order.shopId?.name || 'UTEShop Store'}
                            </span>
                            <button className="px-3 py-1 bg-[#004ac6]/10 text-[#004ac6] rounded-full text-[10px] font-bold flex items-center gap-1.5 hover:bg-[#004ac6]/20 transition-colors">
                              <span className="material-symbols-outlined text-[12px]">chat_bubble</span> Chat
                            </button>
                          </div>
                           <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${statusConfig.color}`}>
                             <span className="material-symbols-outlined text-[14px] font-bold">{statusConfig.icon}</span>
                             <span className="text-[10px] font-black uppercase tracking-widest">
                               {statusConfig.text}
                             </span>
                           </div>
                         </div>

                        {/* Sản phẩm trong Đơn hàng */}
                        <div className="divide-y divide-[#c3c6d7]/10">
                          {order.items?.map((item) => (
                            <Link
                              to={`/order-history/${order.id}`}
                              key={item.id}
                              className="flex gap-4 py-4 items-start hover:opacity-90 transition-opacity group"
                            >
                              <img
                                className="w-20 h-20 rounded-2xl bg-[#f2f3ff] object-cover border border-[#c3c6d7]/20"
                                src={item.imageUrl}
                                alt={item.name}
                              />
                              <div className="flex-grow min-w-0">
                                <h4 className="font-bold text-[#131b2e] text-base group-hover:text-[#004ac6] transition-colors truncate">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-[#434655] mt-1 font-medium truncate">
                                  Variant: {item.variantName || 'Default'}
                                </p>
                                <p className="text-xs text-[#131b2e] mt-2 font-bold">x{item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-base text-[#004ac6] font-extrabold">
                                  {item.price?.toLocaleString()}₫
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>

                        {/* Footer của Đơn hàng */}
                        <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t border-[#c3c6d7]/20 gap-4">
                          <div className="flex flex-col gap-1 items-start">
                            <p className="text-xs text-[#737686] font-semibold">
                              Order Code: <span className="text-[#131b2e] font-extrabold">{order.orderCode}</span>
                            </p>
                            {order.paymentOrderId && (
                              <p className="text-xs text-[#737686] font-semibold">
                                Payment: <span className={`font-bold ${
                                  order.paymentOrderId.paymentStatus === 'success' ? 'text-emerald-600' :
                                  order.paymentOrderId.paymentStatus === 'refunded' ? 'text-purple-600' :
                                  order.paymentOrderId.paymentStatus === 'failed' ? 'text-rose-600' : 'text-amber-500'
                                }`}>
                                  {order.paymentOrderId.paymentMethod === 'cod' ? 'COD (Cash on Delivery)' : 'VNPAY'} - {
                                    order.paymentOrderId.paymentStatus === 'success' ? 'Paid' :
                                    order.paymentOrderId.paymentStatus === 'refunded' ? 'Refunded' :
                                    order.paymentOrderId.paymentStatus === 'failed' ? 'Failed' : 'Unpaid'
                                  }
                                </span>
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
                            <div className="text-right">
                              <span className="text-[#434655] text-xs font-medium">Total: </span>
                              <span className="text-lg text-[#004ac6] font-black">
                                {order.totalFinal?.toLocaleString()}₫
                              </span>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Link
                                to={`/order-history/${order.id}`}
                                className="border border-[#c3c6d7] text-[#434655] hover:bg-[#f2f3ff] hover:text-[#004ac6] px-5 py-2 rounded-xl font-bold text-xs transition-all text-center"
                              >
                                Details
                              </Link>

                              {order.status === 'pending' &&
                               order.paymentOrderId?.paymentMethod === 'vnpay' &&
                               ['pending', 'failed'].includes(order.paymentOrderId?.paymentStatus) && (
                                 <button
                                   onClick={() => handleRepay(order.paymentOrderId.paymentCode)}
                                   className="bg-[#004ac6] text-white px-5 py-2 rounded-xl font-bold text-xs hover:opacity-90 transition-all text-center cursor-pointer"
                                 >
                                   Pay Now
                                 </button>
                              )}

                              {['pending', 'confirmed'].includes(order.status) && (
                                <Link
                                  to={`/order-history/${order.id}/cancel`}
                                  className="border border-rose-200 text-rose-600 hover:bg-rose-50 px-5 py-2 rounded-xl font-bold text-xs transition-all text-center"
                                >
                                  Cancel
                                </Link>
                              )}

                              {order.status === 'delivered' && (
                                <button 
                                  onClick={() => toast.success('Invoice downloaded')}
                                  className="border border-[#c3c6d7] text-[#434655] hover:bg-[#f2f3ff] px-5 py-2 rounded-xl font-bold text-xs transition-all text-center"
                                >
                                  Invoice
                                </button>
                              )}

                              {['delivered', 'canceled'].includes(order.status) && (
                                <button
                                  onClick={() => {
                                    toast.success('Added items to cart to reorder!');
                                    navigate('/cart');
                                  }}
                                  className="bg-[#004ac6] text-white px-5 py-2 rounded-xl font-bold text-xs hover:opacity-90 transition-all text-center"
                                >
                                  Reorder
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Phân trang */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center gap-1.5">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#c3c6d7] hover:bg-[#f2f3ff] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-xs transition-all ${
                          currentPage === index + 1
                            ? 'bg-[#004ac6] text-white shadow-md shadow-[#004ac6]/10'
                            : 'hover:bg-[#f2f3ff] text-[#434655]'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button
                      disabled={currentPage === pagination.totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#c3c6d7] hover:bg-[#f2f3ff] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      <FABGroup />
    </Layout>
  );
};

export default OrderHistory;
