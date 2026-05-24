import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import FABGroup from '../components/FABGroup';
import { logout } from '../redux/authSlice';

const translateTimelineNote = (note) => {
  if (!note) return '';
  let translated = note;
  const mappings = {
    'Đặt hàng thành công - Chờ xác nhận thanh toán': 'Order placed successfully - Pending payment confirmation',
    'Đơn hàng đã được xác nhận - Cửa hàng đang chuẩn bị sản phẩm': 'Order confirmed - Shop is preparing the products',
    'Đơn hàng đã được giao cho đơn vị vận chuyển SPX': 'Order handed over to SPX shipping partner',
    'Giao hàng thành công': 'Delivery successful',
    'Đơn hàng đã bị hủy. Lý do:': 'Order has been cancelled. Reason:',
    'Đơn hàng đã bị hủy': 'Order has been cancelled',
    'Đơn hàng bị hủy bởi Khách hàng. Lý do:': 'Order cancelled by customer. Reason:',
    'Trạng thái đơn hàng cập nhật thành': 'Order status updated to',
    'Hoàn xu cho đơn hàng bị hủy': 'Coin refund for cancelled order'
  };

  for (const [key, val] of Object.entries(mappings)) {
    if (translated.includes(key)) {
      translated = translated.replace(key, val);
    }
  }
  return translated;
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const token = (localStorage.getItem('token') || sessionStorage.getItem('token') || '') || '';
        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data && response.data.success) {
          setOrder(response.data.data);
        } else {
          toast.error('Order not found');
          navigate('/order-history');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast.error('Unable to load order details.');
        navigate('/order-history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, navigate]);

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

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-40 w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004ac6]"></div>
        </div>
      </Layout>
    );
  }

  if (!order) return null;

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
      case 'confirmed':
        return 'bg-blue-500/10 text-blue-600 border border-blue-500/20';
      case 'shipped':
        return 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20';
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
      case 'canceled':
        return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
      case 'cancel_pending':
        return 'bg-purple-500/10 text-purple-600 border border-purple-500/20';
      case 'refunded':
        return 'bg-purple-500/10 text-purple-600 border border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border border-gray-500/20';
    }
  };

  // Determine stepper active states
  const isPending = order.status === 'pending';
  const isConfirmed = order.status === 'confirmed';
  const isShipped = order.status === 'shipped';
  const isDelivered = order.status === 'delivered';
  const isCanceled = order.status === 'canceled';
  const isCancelPending = order.status === 'cancel_pending';
  const isRefunded = order.status === 'refunded';

  const step1Active = !isCanceled && !isCancelPending && !isRefunded;
  const step2Active = isConfirmed || isShipped || isDelivered;
  const step3Active = isShipped || isDelivered;
  const step4Active = isDelivered;

  // Parse address parts or show directly
  const deliveryAddress = order.paymentOrderId?.address || "123 Han Thuyen Street, Linh Trung Ward, Thu Duc City, Ho Chi Minh City";

  return (
    <Layout>
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-4 flex flex-col md:flex-row gap-8 items-start">
        {/* SideNavBar */}
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
        <div className="flex-grow min-w-0 space-y-8 lg:pl-4 text-left w-full">
          {/* Order Status Header */}
          <div className="bg-white border border-[#c3c6d7]/30 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Link to="/order-history" className="p-1 hover:bg-[#f2f3ff] rounded-full transition-colors -ml-1 text-[#004ac6]">
                    <span className="material-symbols-outlined font-bold">arrow_back</span>
                  </Link>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-[#131b2e] tracking-tight">Order #{order.orderCode}</h1>
                </div>
                <p className="text-xs text-[#434655] font-medium">
                  Ordered on {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={`px-5 py-2 rounded-full font-black text-[11px] uppercase tracking-widest border ${getStatusClass(order.status)}`}>
                {isPending ? 'Pending' :
                 isConfirmed ? 'Confirmed' :
                 isShipped ? 'Shipped' :
                 isDelivered ? 'Delivered' :
                 isCanceled ? 'Cancelled' :
                 isCancelPending ? 'Cancel Pending' :
                 isRefunded ? 'Refunded' : order.status}
              </span>
            </div>

            {!isCanceled && !isCancelPending && !isRefunded ? (
              <div className="flex items-center justify-between px-2 md:px-8 relative pt-4 pb-2">
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                    step1Active ? 'bg-[#004ac6] text-white shadow-[#004ac6]/20' : 'bg-[#f2f3ff] text-[#434655] border border-[#c3c6d7]/30'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">inventory</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider ${step1Active ? 'text-[#004ac6]' : 'text-[#434655]'}`}>Ordered</span>
                </div>
                <div className={`h-0.5 flex-grow ${step2Active ? 'bg-[#004ac6]' : 'bg-gray-200'}`}></div>
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                    step2Active ? 'bg-[#004ac6] text-white shadow-[#004ac6]/20' : 'bg-[#f2f3ff] text-[#434655] border border-[#c3c6d7]/30'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider ${step2Active ? 'text-[#004ac6]' : 'text-[#434655]'}`}>Confirmed</span>
                </div>
                <div className={`h-0.5 flex-grow ${step3Active ? 'bg-[#004ac6]' : 'bg-gray-200'}`}></div>
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                    step3Active ? 'bg-[#004ac6] text-white shadow-[#004ac6]/20' : 'bg-[#f2f3ff] text-[#434655] border border-[#c3c6d7]/30'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider ${step3Active ? 'text-[#004ac6]' : 'text-[#434655]'}`}>Shipped</span>
                </div>
                <div className={`h-0.5 flex-grow ${step4Active ? 'bg-[#004ac6]' : 'bg-gray-200'}`}></div>
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                    step4Active ? 'bg-[#004ac6] text-white shadow-[#004ac6]/20' : 'bg-[#f2f3ff] text-[#434655] border border-[#c3c6d7]/30'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider ${step4Active ? 'text-[#004ac6]' : 'text-[#434655]'}`}>Delivered</span>
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-2xl flex items-start gap-4 ${
                isCanceled ? 'bg-rose-50 border border-rose-100' :
                isRefunded ? 'bg-purple-50 border border-purple-100' : 'bg-purple-50 border border-purple-100'
              }`}>
                <span className={`material-symbols-outlined text-3xl ${
                  isCanceled ? 'text-rose-500' :
                  isRefunded ? 'text-purple-500' : 'text-purple-500'
                }`}>
                  {isCanceled ? 'cancel' : isRefunded ? 'settings_backup_restore' : 'hourglass_empty'}
                </span>
                <div>
                  <h4 className={`font-extrabold text-sm ${
                    isCanceled ? 'text-rose-700' :
                    isRefunded ? 'text-purple-700' : 'text-purple-700'
                  }`}>
                    {isCanceled ? 'Order has been cancelled' :
                     isRefunded ? 'Order has been refunded' : 'Cancellation Request Pending'}
                  </h4>
                  {isRefunded && (
                    <p className="text-xs text-purple-600 mt-1 font-semibold">
                      This order has been cancelled and refunded successfully.
                    </p>
                  )}
                  {!isCanceled && !isRefunded && (
                    <p className="text-xs text-purple-600 mt-1 font-semibold">
                      Your cancellation request is awaiting shop confirmation.
                    </p>
                  )}
                  {order.cancellation && (
                    <>
                      <p className={`text-xs mt-1 font-semibold ${isCanceled ? 'text-rose-600' : 'text-purple-600'}`}>
                        Cancellation reason: {order.cancellation.reason}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${isCanceled ? 'text-rose-500' : 'text-purple-500'}`}>
                        Requested at: {new Date(order.cancellation.cancelledAt).toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cột trái: Thông tin vận chuyển và Log */}
            <div className="lg:col-span-7 space-y-8 w-full">
              <div className="bg-white border border-[#c3c6d7]/30 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[#c3c6d7]/20 pb-4">
                  <h2 className="text-lg font-extrabold text-[#131b2e] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#004ac6]">local_shipping</span>
                    Shipping Information
                  </h2>
                  {!isCanceled && (
                    <div className="text-right">
                      <p className="text-[10px] text-[#737686] font-bold uppercase tracking-wider">Tracking Number</p>
                      <p className="font-extrabold text-[#004ac6] text-base">SPX-{order.orderCode.split('-')[2] || '948210'}</p>
                    </div>
                  )}
                </div>

                {/* Timeline tiến độ */}
                <div className="bg-[#f2f3ff]/40 rounded-2xl p-5 border border-[#c3c6d7]/10">
                  <div className="space-y-6 relative border-l border-[#004ac6]/20 ml-2.5 pl-6">
                    {order.timeline?.map((evt, idx) => (
                      <div key={idx} className="relative text-left">
                        <div className={`absolute -left-[30px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white ring-4 ${
                          idx === 0 ? 'bg-[#004ac6] ring-[#004ac6]/10' : 'bg-gray-300 ring-transparent'
                        }`}></div>
                        <div>
                          <p className={`font-bold text-xs ${idx === 0 ? 'text-[#131b2e]' : 'text-[#434655]'}`}>
                            {translateTimelineNote(evt.note)}
                          </p>
                          <p className="text-[10px] text-[#737686] font-medium mt-0.5">
                            {new Date(evt.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Địa chỉ giao hàng */}
                <div className="flex gap-4 p-5 bg-[#f2f3ff]/20 rounded-2xl border border-[#c3c6d7]/20">
                  <span className="material-symbols-outlined text-[#004ac6] text-2xl">location_on</span>
                  <div>
                    <p className="text-[10px] text-[#737686] font-bold uppercase tracking-wider mb-1">Shipping Address</p>
                    <p className="font-extrabold text-[#131b2e] text-sm">
                      {user?.fullName} — (+84) {user?.phone || '987 654 321'}
                    </p>
                    <p className="text-xs text-[#434655] font-medium mt-1 leading-relaxed">
                      {deliveryAddress}
                    </p>
                  </div>
                </div>

                {/* Thông tin thanh toán (Lịch sử thanh toán) */}
                {order.paymentOrderId && (
                  <div className="flex gap-4 p-5 bg-[#f2f3ff]/20 rounded-2xl border border-[#c3c6d7]/20">
                    <span className="material-symbols-outlined text-[#004ac6] text-2xl">credit_card</span>
                    <div className="flex-grow">
                      <p className="text-[10px] text-[#737686] font-bold uppercase tracking-wider mb-2">Payment History</p>
                      <div className="text-xs text-[#434655] space-y-1.5">
                        <p>
                          Method: <span className="font-bold text-[#131b2e] uppercase">{order.paymentOrderId.paymentMethod === 'cod' ? 'COD' : order.paymentOrderId.paymentMethod}</span>
                        </p>
                        <p>
                          Payment Code: <span className="font-bold text-[#131b2e]">{order.paymentOrderId.paymentCode}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          Overall Status: 
                          <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider ${
                            order.paymentOrderId.paymentStatus === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                            order.paymentOrderId.paymentStatus === 'refunded' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' :
                            order.paymentOrderId.paymentStatus === 'failed' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          }`}>
                            {order.paymentOrderId.paymentStatus === 'success' ? 'Success' :
                             order.paymentOrderId.paymentStatus === 'refunded' ? 'Refunded' :
                             order.paymentOrderId.paymentStatus === 'failed' ? 'Failed' : 'Pending'}
                          </span>
                        </p>

                        {/* Attempts History */}
                        {order.paymentTransactions && order.paymentTransactions.length > 0 ? (
                          <div className="mt-4 pt-4 border-t border-[#c3c6d7]/20 space-y-3">
                            <p className="text-[10px] text-[#737686] font-extrabold uppercase tracking-wider">Transaction Attempts</p>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                              {order.paymentTransactions.map((tx, idx) => (
                                <div 
                                  key={idx} 
                                  className="p-3 rounded-xl bg-white border border-[#c3c6d7]/20 flex justify-between items-center hover:shadow-sm hover:border-[#004ac6]/30 transition-all duration-200"
                                >
                                  <div className="space-y-0.5 text-left">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold text-[#131b2e] text-[11px] truncate max-w-[120px] md:max-w-none">
                                        {tx.transactionId || 'No Txn Ref'}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded-full font-black text-[8px] uppercase tracking-wider ${
                                        tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/10' :
                                        tx.status === 'failed' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/10' : 'bg-amber-500/10 text-amber-600 border border-amber-500/10'
                                      }`}>
                                        {tx.status}
                                      </span>
                                    </div>
                                    {tx.status === 'success' && tx.responseData && (tx.responseData.vnpTransactionNo || tx.responseData.vnp_TransactionNo) && (
                                      <p className="text-[9px] text-[#737686] font-medium">
                                        Gateway Ref: <span className="font-semibold text-[#131b2e]">{tx.responseData.vnpTransactionNo || tx.responseData.vnp_TransactionNo}</span>
                                      </p>
                                    )}
                                    <p className="text-[10px] text-[#737686] font-medium">
                                      {new Date(tx.paymentDate).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="font-extrabold text-xs text-[#004ac6]">
                                      {tx.amount?.toLocaleString()}₫
                                    </p>
                                    <p className="text-[9px] text-[#737686] font-bold uppercase tracking-wider mt-0.5">
                                      {tx.paymentMethod === 'cod' ? 'COD' : tx.paymentMethod}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : order.paymentTransaction ? (
                          <div className="mt-2 pt-2 border-t border-[#c3c6d7]/20 text-[11px] text-[#737686] space-y-0.5 text-left">
                            <p>Transaction ID: <span className="font-semibold text-[#131b2e]">{order.paymentTransaction.transactionId}</span></p>
                            {order.paymentTransaction.status === 'success' && order.paymentTransaction.responseData && (order.paymentTransaction.responseData.vnpTransactionNo || order.paymentTransaction.responseData.vnp_TransactionNo) && (
                              <p>Gateway Ref: <span className="font-semibold text-[#131b2e]">{order.paymentTransaction.responseData.vnpTransactionNo || order.paymentTransaction.responseData.vnp_TransactionNo}</span></p>
                            )}
                            <p>Amount: <span className="font-semibold text-[#131b2e]">{order.paymentTransaction.amount?.toLocaleString()}₫</span></p>
                            <p>Transaction Time: <span className="font-semibold text-[#131b2e]">{new Date(order.paymentTransaction.paymentDate).toLocaleString()}</span></p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cột phải: Tóm tắt đơn hàng */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-white border border-[#c3c6d7]/30 rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="text-lg font-extrabold text-[#131b2e] mb-6">Order Summary</h2>

                {/* Danh sách sản phẩm */}
                <div className="space-y-4 mb-6 pb-6 border-b border-[#c3c6d7]/20">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover bg-[#f2f3ff] border border-[#c3c6d7]/20"
                      />
                      <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-xs text-[#131b2e] leading-tight truncate">{item.name}</h4>
                        <p className="text-[10px] text-[#737686] mt-0.5 font-medium">
                          Quantity: {item.quantity} | {item.variantName || 'Standard'}
                        </p>
                        <p className="font-bold text-xs text-[#004ac6] mt-1">
                          {item.price?.toLocaleString()}₫
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chi tiết chi phí */}
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-[#434655] font-medium">
                    <span>Subtotal</span>
                    <span className="text-[#131b2e] font-semibold">{order.subtotalAmount?.toLocaleString()}₫</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#434655] font-medium">
                    <span>Shipping Fee</span>
                    <span className="text-[#131b2e] font-semibold">{order.shippingFee?.toLocaleString()}₫</span>
                  </div>
                  {order.couponDiscount > 0 && (
                    <div className="flex justify-between text-xs text-rose-500 font-bold">
                      <span>Voucher Discount</span>
                      <span>-{order.couponDiscount?.toLocaleString()}₫</span>
                    </div>
                  )}
                  {order.coinDiscount > 0 && (
                    <div className="flex justify-between text-xs text-rose-500 font-bold">
                      <span>Coins Used</span>
                      <span>-{order.coinDiscount?.toLocaleString()}₫</span>
                    </div>
                  )}


                  <div className="pt-4 border-t border-[#c3c6d7]/20 mt-4 text-left">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] text-[#737686] font-bold uppercase tracking-wider">Total</span>
                      <span className="text-xl text-[#004ac6] font-black">
                        {order.totalFinal?.toLocaleString()}₫
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <button
                        onClick={() => toast.success('Contacting Customer Service...')}
                        className="w-full bg-[#004ac6] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-[#004ac6]/10 flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[18px]">support_agent</span> Contact Support
                      </button>

                      <button
                        onClick={() => toast.success('Invoice downloaded successfully')}
                        className="w-full bg-[#f2f3ff] text-[#131b2e] py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#c3c6d7]/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[18px]">description</span> Download Invoice
                      </button>

                      {order.status === 'pending' &&
                       order.paymentOrderId?.paymentMethod === 'vnpay' &&
                       ['pending', 'failed'].includes(order.paymentOrderId?.paymentStatus) && (
                        <button
                          onClick={() => handleRepay(order.paymentOrderId.paymentCode)}
                          className="w-full bg-gradient-to-r from-[#005ba4] to-[#007cc4] hover:from-[#004780] hover:to-[#006bb0] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-[#005ba4]/10 flex items-center justify-center gap-1.5 cursor-pointer mb-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">credit_card</span> Pay Now
                        </button>
                      )}

                      {['pending', 'confirmed'].includes(order.status) && (
                        <Link
                          to={`/order-history/${order.id}/cancel`}
                          className="w-full border border-rose-300 text-rose-600 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-rose-50 transition-all flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[18px]">cancel</span> Request Order Cancellation
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FABGroup />
    </Layout>
  );
};

export default OrderDetail;
