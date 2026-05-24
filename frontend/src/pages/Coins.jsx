import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import FABGroup from '../components/FABGroup';
import { logout } from '../redux/authSlice';

const Coins = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [coinBalance, setCoinBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, earn, spend, refund

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchCoinData = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
        const response = await axios.get('http://localhost:5000/api/users/coins/transactions', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data && response.data.success) {
          setCoinBalance(response.data.data.coinBalance || 0);
          setTransactions(response.data.data.transactions || []);
        }
      } catch (error) {
        console.error('Error fetching coin history:', error);
        toast.error('Unable to load coin transaction history');
      } finally {
        setLoading(false);
      }
    };

    fetchCoinData();
  }, [user, navigate]);

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logout());
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === 'all') return true;
    return tx.type === activeTab;
  });

  const getTransactionDetails = (tx) => {
    const orderCode = tx.orderId?.orderCode || 'N/A';
    switch (tx.type) {
      case 'earn':
        return {
          title: 'Earned Reward Coins',
          desc: `Received from order #${orderCode}`,
          icon: 'add_task',
          colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
          amountSign: '+'
        };
      case 'spend':
        return {
          title: 'Used Coins Discount',
          desc: `Applied to order #${orderCode}`,
          icon: 'shopping_bag',
          colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
          amountSign: '-'
        };
      case 'refund':
        return {
          title: 'Refunded Coins',
          desc: `Credited back from cancelled order #${orderCode}`,
          icon: 'settings_backup_restore',
          colorClass: 'text-[#004ac6] bg-[#004ac6]/10 border-[#004ac6]/20',
          amountSign: '+'
        };
      default:
        return {
          title: 'Transaction',
          desc: tx.description || 'Coin balance updated',
          icon: 'monetization_on',
          colorClass: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
          amountSign: tx.amount >= 0 ? '+' : ''
        };
    }
  };

  const avatarSrc = user?.avatarUrl 
    ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:5000${user.avatarUrl}`) 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=004ac6&color=fff`;

  return (
    <Layout>
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 md:py-12 flex flex-col md:flex-row gap-8 items-start font-['Manrope']">
        
        {/* Sidebar Nav */}
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
            <Link to="/order-history" className="flex items-center px-4 py-3 space-x-3 text-[#434655] hover:bg-[#f7f9ff] hover:text-[#004ac6] transition-all font-medium rounded-xl">
              <span className="material-symbols-outlined">shopping_bag</span>
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
            {/* Active Item: My Coins */}
            <Link to="/coins" className="flex items-center px-4 py-3 space-x-3 bg-[#004ac6] text-white font-bold rounded-xl shadow-lg shadow-[#004ac6]/20 transition-all">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
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

          <div className="mt-6 pt-4 border-t border-[#c3c6d7]/30 text-left">
            <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 space-x-3 text-[#ba1a1a] hover:bg-[#ffdad6]/20 transition-all font-bold rounded-xl cursor-pointer">
              <span className="material-symbols-outlined">logout</span>
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 w-full text-left">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#131b2e] tracking-tight mb-1">My Wallet Coins</h1>
            <p className="text-base text-[#434655]">View your current coin balance and history of rewards & redemptions.</p>
          </div>

          {/* Premium Wallet Card (Gradient) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#004ac6] text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-700/50 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            {/* Glossy overlay effect */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#004ac6]/25 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none"></div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 text-blue-200/80 font-bold uppercase tracking-wider text-[11px]">
                <span className="material-symbols-outlined text-[18px]">stars</span>
                <span>UTEShop Reward Program</span>
              </div>
              <div className="space-y-1">
                <span className="text-[13px] text-slate-300 font-semibold">Available Coins Balance</span>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight">{coinBalance.toLocaleString()}</h2>
                  <span className="text-xl md:text-2xl font-extrabold text-amber-400">coins</span>
                </div>
              </div>
              <p className="text-xs text-slate-300/90 flex items-center gap-1.5 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full w-fit border border-white/5">
                <span className="material-symbols-outlined text-[14px] text-emerald-400">info</span>
                <span>Equivalent to: <b>{coinBalance.toLocaleString()}₫</b> (1 coin = 1 VND)</span>
              </p>
            </div>

            <div className="relative z-10 w-full md:w-auto bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex md:flex-col gap-4 justify-between items-center md:items-start text-left shrink-0">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Coin Utility</h4>
                <p className="text-[11px] text-slate-400 max-w-[200px] leading-normal">Use your coins to discount up to 100% of your order values at checkout.</p>
              </div>
              <Link 
                to="/search" 
                className="bg-white hover:bg-slate-100 text-[#131b2e] px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-black/10 flex items-center gap-1 transition-all"
              >
                <span>Shop Now</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

          </div>

          {/* Transactions List Area */}
          <div className="bg-white rounded-3xl shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-[#c3c6d7]/30 overflow-hidden">
            
            {/* Tabs Filter */}
            <div className="flex border-b border-[#c3c6d7]/30 overflow-x-auto no-scrollbar bg-[#f2f3ff]/30">
              {[
                { key: 'all', label: 'All Transactions' },
                { key: 'earn', label: 'Earned Reward' },
                { key: 'spend', label: 'Redeemed' },
                { key: 'refund', label: 'Refunded' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
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
              
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#004ac6]"></div>
                </div>
              ) : filteredTransactions.length === 0 ? (
                
                /* Empty state */
                <div className="py-16 text-center max-w-sm mx-auto space-y-4">
                  <div className="w-16 h-16 bg-[#eaedff] rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="material-symbols-outlined text-[#004ac6] text-[32px]">history</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#131b2e]">No transactions found</h3>
                  <p className="text-sm text-[#434655]">There are no coin transactions recorded under this category yet.</p>
                </div>

              ) : (
                
                /* List of transactions */
                <div className="divide-y divide-[#c3c6d7]/15">
                  {filteredTransactions.map((tx) => {
                    const info = getTransactionDetails(tx);
                    return (
                      <div 
                        key={tx._id} 
                        className="py-4 flex items-center justify-between gap-4 group hover:bg-[#fcfdff] transition-all rounded-xl px-2 -mx-2 text-left"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Circle Icon Badge */}
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${info.colorClass} group-hover:scale-105`}>
                            <span className="material-symbols-outlined text-[20px]">{info.icon}</span>
                          </div>
                          
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-[#131b2e] leading-snug truncate">{info.title}</h4>
                            <p className="text-xs text-[#434655] mt-0.5 truncate">{info.desc}</p>
                            <span className="text-[10px] text-[#737686] font-medium block mt-1.5">
                              {new Date(tx.createdAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right shrink-0">
                          <span className={`text-[15px] font-black ${
                            tx.type === 'spend' ? 'text-rose-600' : 'text-emerald-600'
                          }`}>
                            {info.amountSign}{tx.amount.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-[#737686] block mt-0.5">coins</span>
                        </div>

                      </div>
                    );
                  })}
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

export default Coins;
