import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import FABGroup from '../components/FABGroup';
import { logout } from '../redux/authSlice';

const CancelOrder = () => {
  const { orderId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedReason, setSelectedReason] = useState('I want to change the shipping address');
  const [otherReasonText, setOtherReasonText] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOrderBrief = async () => {
      try {
        const token = (localStorage.getItem('token') || sessionStorage.getItem('token') || '') || '';
        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data && response.data.success) {
          const fetchedOrder = response.data.data;
          // Validate order status: only pending or confirmed can be cancelled
          if (!['pending', 'confirmed'].includes(fetchedOrder.status)) {
            toast.error('This order is already pending cancellation or has been shipped/completed.');
            navigate(`/order-history/${orderId}`);
            return;
          }
          setOrder(fetchedOrder);
        } else {
          toast.error('Order not found');
          navigate('/order-history');
        }
      } catch (error) {
        console.error('Error fetching order details for cancel:', error);
        toast.error('Unable to load order details.');
        navigate('/order-history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderBrief();
  }, [orderId, navigate]);

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logout());
    navigate('/login');
  };

  const handleSubmitCancellation = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    let finalReason = selectedReason;
    if (selectedReason === 'Other reason / Prefer not to say') {
      finalReason = otherReasonText.trim() || 'Other reason';
    } else if (otherReasonText.trim() !== '') {
      finalReason = `${selectedReason} - ${otherReasonText.trim()}`;
    }

    try {
      const token = (localStorage.getItem('token') || sessionStorage.getItem('token') || '') || '';
      const response = await axios.post(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
        { reason: finalReason },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.success) {
        const successMsg = response.data.message || 'Order cancelled successfully!';
        toast.success(successMsg);
        navigate('/order-history');
      } else {
        toast.error(response.data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      const errMsg = error.response?.data?.message || 'An error occurred while cancelling the order. Please try again.';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
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

  const cancellationReasons = [
    'I want to change the shipping address',
    'I want to change the payment method',
    'Found a better price elsewhere',
    'Other reason / Prefer not to say'
  ];

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

        {/* Cancellation Form Content */}
        <div className="flex-grow min-w-0 w-full space-y-8 lg:pl-4 text-left">
          <div className="flex items-center gap-3">
            <Link to={`/order-history/${orderId}`} className="p-2 hover:bg-[#f2f3ff] rounded-full transition-colors text-[#004ac6]">
              <span className="material-symbols-outlined font-bold">arrow_back</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#131b2e] tracking-tight">Cancel Order</h1>
          </div>

          {/* Order Brief */}
          <div className="bg-white border border-[#c3c6d7]/30 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="pb-3 border-b border-[#c3c6d7]/20 flex items-center justify-between">
              <p className="text-[10px] font-black text-[#004ac6] uppercase tracking-wider">Order #{order.orderCode}</p>
              <p className="text-xs text-[#737686] font-medium">Ordered on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            
            {/* List products in order brief */}
            <div className="divide-y divide-[#c3c6d7]/10">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4 py-3 items-center">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-16 h-16 rounded-2xl object-cover bg-[#f2f3ff] border border-[#c3c6d7]/20 flex-shrink-0"
                  />
                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-[#131b2e] text-sm truncate">{item.name}</h3>
                    <p className="text-xs text-[#434655] font-medium mt-0.5 truncate">
                      Variant: {item.variantName || 'Default'}
                    </p>
                    <p className="text-xs text-[#434655] font-semibold mt-1">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-[#004ac6]">{item.price?.toLocaleString()}₫</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#c3c6d7]/20 flex justify-between items-center">
              <span className="text-xs text-[#434655] font-bold">Total Payment:</span>
              <span className="text-lg font-black text-[#004ac6]">{order.totalFinal?.toLocaleString()}₫</span>
            </div>
          </div>

          {/* Cancellation Form */}
          <form onSubmit={handleSubmitCancellation} className="bg-white border border-[#c3c6d7]/30 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
            <div>
              <h3 className="text-lg font-extrabold text-[#131b2e] mb-6">Reason for Cancellation</h3>
              <div className="space-y-4">
                {cancellationReasons.map((reason, index) => (
                  <label 
                    key={index}
                    className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer hover:bg-[#f2f3ff]/40 transition-all group ${
                      selectedReason === reason ? 'border-[#004ac6] bg-[#f2f3ff]/20' : 'border-[#c3c6d7]/30'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="reason" 
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-5 h-5 text-[#004ac6] border-[#c3c6d7] focus:ring-[#004ac6]/20 cursor-pointer"
                    />
                    <span className={`font-bold text-sm transition-colors ${
                      selectedReason === reason ? 'text-[#004ac6]' : 'text-[#434655] group-hover:text-[#131b2e]'
                    }`}>
                      {reason}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-[#131b2e] mb-4">Additional Details (Optional)</h3>
              <textarea 
                placeholder="Please tell us more about why you are cancelling your order..." 
                value={otherReasonText}
                onChange={(e) => setOtherReasonText(e.target.value)}
                className="w-full bg-[#f2f3ff]/30 border border-[#c3c6d7]/30 rounded-2xl p-5 h-32 focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-all outline-none text-sm font-medium text-[#131b2e]"
              ></textarea>
            </div>

            {/* Policy Info */}
            <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex gap-4 text-left">
              <span className="material-symbols-outlined text-[#ba1a1a] select-none">info</span>
              <div className="text-xs">
                <p className="font-black text-[#93000a] uppercase tracking-wider mb-1">Cancellation Policy</p>
                <p className="text-[#93000a] font-medium leading-relaxed">
                  Once cancelled, your refund (if any) will be processed within 3-5 business days depending on your original payment method. This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                type="submit"
                disabled={submitting}
                className="flex-grow bg-[#ba1a1a] text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-rose-600/20 flex justify-center items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
              <Link 
                to={`/order-history/${orderId}`}
                className="flex-grow border border-[#c3c6d7] text-[#434655] py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#f2f3ff] transition-all text-center flex items-center justify-center"
              >
                Keep My Order
              </Link>
            </div>
          </form>
        </div>
      </div>
      <FABGroup />
    </Layout>
  );
};

export default CancelOrder;
