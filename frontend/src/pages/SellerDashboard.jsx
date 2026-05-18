import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import toast from 'react-hot-toast';

const SellerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { sender: 'ai', text: "Hello Seller! I'm your UTEShop AI Assistant. How can I help you optimize your store sales and product listings today?" }
  ]);

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logout());
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const newMsg = { sender: 'user', text: aiInput };
    setAiMessages(prev => [...prev, newMsg]);
    setAiInput('');

    setTimeout(() => {
      setAiMessages(prev => [...prev, {
        sender: 'ai',
        text: `Analyzing store inventory for "${newMsg.text}"... Your top selling product "Wireless Scholar Mouse" has 152 units sold.`
      }]);
    }, 1000);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', category: 'Main' },
    { id: 'products', label: 'Products', icon: 'inventory_2', category: 'Main' },
    { id: 'orders', label: 'Orders', icon: 'shopping_cart', category: 'Main' },
    { id: 'cancellations', label: 'Cancellations', icon: 'cancel', category: 'Main' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics', category: 'Main' },
    { id: 'reviews', label: 'Reviews', icon: 'star', category: 'Main' },
    { id: 'messages', label: 'Messages', icon: 'chat_bubble', category: 'Main' },
    { id: 'settings', label: 'Settings', icon: 'settings', category: 'Settings' },
  ];

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen flex font-['Manrope'] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 z-50 shadow-sm">
        {/* Seller Identity */}
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#004ac6] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
              US
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">Seller Center</h2>
              <p className="text-xs text-slate-500 font-medium">Premium Merchant</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item, index) => {
            const showCategory = index === 0 || navItems[index - 1].category !== item.category;
            return (
              <React.Fragment key={item.id}>
                {showCategory && item.category === 'Settings' && (
                  <div className="pt-6 pb-2 px-4 border-t border-slate-100 mt-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System</p>
                  </div>
                )}
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-sm font-medium group cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-[#E8EFFF] text-[#004ac6] font-bold shadow-sm shadow-blue-100'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform"
                    style={{ fontVariationSettings: activeTab === item.id ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Revenue Card */}
        <div className="px-6 py-4 mt-auto border-t border-slate-100">
          <div className="bg-[#004ac6] rounded-[24px] p-5 text-white relative overflow-hidden shadow-lg shadow-blue-200/50">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <span className="material-symbols-outlined text-4xl">account_balance_wallet</span>
            </div>
            <div className="relative z-10">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Total Balance</p>
              <h3 className="text-lg font-black mb-4 flex items-baseline gap-1">
                45,820,000 <span className="text-[10px] font-medium opacity-80">₫</span>
              </h3>
              <button 
                onClick={() => toast.success('Accessing Seller Wallet...')} 
                className="flex items-center justify-center w-full bg-white text-[#004ac6] py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
              >
                Access Wallet
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-4 flex items-center justify-center gap-3 px-4 py-3 bg-red-50 text-[#b3261e] hover:bg-red-100 transition-all rounded-xl text-sm font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Exit Seller Center</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#F8FAFC]">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-40 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#004ac6] text-2xl">dashboard_customize</span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>

            <div className="ml-8 hidden md:flex items-center bg-[#F1F5F9] rounded-2xl px-4 py-2.5 w-80 group focus-within:ring-2 focus-within:ring-blue-100 transition-all border border-slate-200/60">
              <span className="material-symbols-outlined text-slate-400 text-xl group-focus-within:text-[#004ac6]">search</span>
              <input
                type="text"
                placeholder="Search analytics..."
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 placeholder:font-medium ml-2 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-8 w-px bg-slate-200 mx-2"></div>

            <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-xl transition-all relative cursor-pointer border border-slate-100">
              <span className="material-symbols-outlined text-2xl">notifications</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3 bg-[#F1F5F9] pl-1 pr-4 py-1 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-200 transition-all group">
              <div className="w-8 h-8 rounded-full bg-[#004ac6] flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-200">
                JD
              </div>
              <span className="text-sm font-bold text-slate-700">{user?.fullName || 'John Doe'}</span>
              <span className="material-symbols-outlined text-slate-400 text-lg group-hover:translate-y-0.5 transition-transform">expand_more</span>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-10 max-w-[1280px] mx-auto w-full space-y-8">
          {activeTab === 'dashboard' && (
            <>
              {/* Bento Grid Stats (4 cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Today's Revenue */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-[#004ac6] transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="material-symbols-outlined text-[#004ac6]">payments</span>
                      <span className="text-xs font-bold text-[#2e7d32] bg-[#2e7d32]/10 px-2 py-1 rounded-full">+12.5%</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Today's Revenue</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">12,450,000 <span className="text-sm font-normal text-slate-500">VND</span></h3>
                  </div>
                </div>

                {/* Card 2: New Orders */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-[#004ac6] transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="material-symbols-outlined text-slate-600">local_shipping</span>
                      <span className="text-xs font-bold text-[#2e7d32] bg-[#2e7d32]/10 px-2 py-1 rounded-full">+5.2%</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">New Orders</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">42 <span className="text-sm font-normal text-slate-500">Orders</span></h3>
                  </div>
                </div>

                {/* Card 3: Out of Stock Items */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-[#b3261e] transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="material-symbols-outlined text-[#b3261e]">inventory</span>
                      <span className="text-xs font-bold text-[#b3261e] bg-[#b3261e]/10 px-2 py-1 rounded-full">-3.1%</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Out of Stock</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">3 <span className="text-sm font-normal text-slate-500">Products</span></h3>
                  </div>
                </div>

                {/* Card 4: Chat Response Rate */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-[#2e7d32] transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="material-symbols-outlined text-[#2e7d32]">forum</span>
                      <span className="text-xs font-bold text-[#2e7d32] bg-[#2e7d32]/10 px-2 py-1 rounded-full">+0.8%</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Chat Response Rate</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">98.5 <span className="text-sm font-normal text-slate-500">%</span></h3>
                  </div>
                </div>
              </div>

              {/* Revenue Analytics Section */}
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Revenue Trends</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Performance comparison across different time periods</p>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                    <button className="px-5 py-1.5 text-sm font-bold bg-white text-[#004ac6] rounded-lg shadow-sm">Daily</button>
                    <button className="px-5 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">Weekly</button>
                    <button className="px-5 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">Monthly</button>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-end">
                  <div className="relative h-[280px] w-full flex items-end justify-between gap-6 px-4 border-b border-slate-100 pb-2">
                    <div className="flex-1 flex flex-col items-center group h-full justify-end relative">
                      <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">4.2M ₫</div>
                      <div className="w-full bg-[#004ac6]/20 rounded-t-lg transition-all group-hover:bg-[#004ac6]" style={{ height: '40%' }}></div>
                      <span className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mon</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center group h-full justify-end relative">
                      <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">6.5M ₫</div>
                      <div className="w-full bg-[#004ac6]/20 rounded-t-lg transition-all group-hover:bg-[#004ac6]" style={{ height: '60%' }}></div>
                      <span className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tue</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center group h-full justify-end relative">
                      <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">5.1M ₫</div>
                      <div className="w-full bg-[#004ac6]/20 rounded-t-lg transition-all group-hover:bg-[#004ac6]" style={{ height: '50%' }}></div>
                      <span className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wed</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center group h-full justify-end relative">
                      <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">9.8M ₫</div>
                      <div className="w-full bg-[#004ac6]/60 rounded-t-lg transition-all group-hover:bg-[#004ac6]" style={{ height: '85%' }}></div>
                      <span className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thu</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center group h-full justify-end relative">
                      <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">12.45M ₫</div>
                      <div className="w-full bg-[#004ac6] rounded-t-lg transition-all shadow-md shadow-blue-100" style={{ height: '75%' }}></div>
                      <span className="mt-4 text-[10px] font-bold text-[#004ac6] uppercase tracking-widest">Today</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center group h-full justify-end relative">
                      <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">3.5M ₫</div>
                      <div className="w-full bg-[#004ac6]/20 rounded-t-lg transition-all group-hover:bg-[#004ac6]" style={{ height: '35%' }}></div>
                      <span className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sat</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center group h-full justify-end relative">
                      <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">3.0M ₫</div>
                      <div className="w-full bg-[#004ac6]/20 rounded-t-lg transition-all group-hover:bg-[#004ac6]" style={{ height: '30%' }}></div>
                      <span className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sun</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Detailed Stats Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Recent Orders</h3>
                    <button onClick={() => toast.success('Viewing all recent orders')} className="text-[#004ac6] text-xs font-bold hover:underline cursor-pointer">View All</button>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-tighter border-b border-slate-100 bg-slate-50/50">
                          <th className="px-6 py-4">Order ID</th>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Amount</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-xs font-mono font-bold text-[#004ac6]">#ORD-9921</td>
                          <td className="px-6 py-4 text-xs font-medium">Alex Johnson</td>
                          <td className="px-6 py-4 text-xs font-bold">1,250,000₫</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#004ac6] text-[10px] font-bold border border-blue-100">Processing</span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-xs font-mono font-bold text-[#004ac6]">#ORD-9920</td>
                          <td className="px-6 py-4 text-xs font-medium">Maria Garcia</td>
                          <td className="px-6 py-4 text-xs font-bold">450,000₫</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded-full bg-green-50 text-[#2e7d32] text-[10px] font-bold border border-green-100">Completed</span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-xs font-mono font-bold text-[#004ac6]">#ORD-9919</td>
                          <td className="px-6 py-4 text-xs font-medium">Kevin Smith</td>
                          <td className="px-6 py-4 text-xs font-bold">2,100,000₫</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded-full bg-red-50 text-[#b3261e] text-[10px] font-bold border border-red-100">Cancelled</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-auto p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <span className="text-[11px] text-slate-500 font-medium">Showing <span className="text-slate-900 font-bold">1-3</span> of <span className="text-slate-900 font-bold">42</span> orders</span>
                    <div className="flex items-center gap-1">
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white transition-all cursor-not-allowed opacity-50">
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#004ac6] text-white text-xs font-bold shadow-sm">1</button>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-white text-xs font-bold transition-all cursor-pointer">2</button>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-white text-xs font-bold transition-all cursor-pointer">3</button>
                      <span className="px-1 text-slate-400">...</span>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Store Performance & Top Selling */}
                <div className="space-y-8 flex flex-col justify-between">
                  {/* Store Performance */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-6">Store Performance</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-slate-500 font-medium">Fulfillment Rate</span>
                        <span className="text-sm font-bold text-[#004ac6]">98%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#004ac6]" style={{ width: '98%' }}></div>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-slate-500 font-medium">Response Time</span>
                        <span className="text-sm font-bold text-[#2e7d32]">&lt; 5 mins</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2e7d32]" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Top Selling */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col justify-between">
                    <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-4">Top Selling</h3>
                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/60 shrink-0">
                          <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100" alt="Product" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">Wireless Scholar Mouse</p>
                          <p className="text-[10px] text-slate-500 font-medium">152 units sold</p>
                        </div>
                        <span className="text-xs font-bold text-[#004ac6] bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">#1</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/60 shrink-0">
                          <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100" alt="Product" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">Academic Sport Sneakers</p>
                          <p className="text-[10px] text-slate-500 font-medium">89 units sold</p>
                        </div>
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">#2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Growth Insights & Marketing Tips */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 border border-blue-100">
                      <span className="material-symbols-outlined text-[#004ac6]">auto_graph</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Growth Insight</h4>
                      <p className="text-xs text-slate-600 leading-tight mt-0.5 font-medium">Your revenue is up 12% compared to last Thursday. Keep it up!</p>
                    </div>
                  </div>
                  <button onClick={() => toast.success('Loading full growth report...')} className="px-5 py-2.5 bg-[#004ac6] text-white text-xs font-bold rounded-xl shadow-md shadow-[#004ac6]/20 hover:brightness-110 transition-all shrink-0 cursor-pointer">View Full Report</button>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 border border-slate-200/60">
                      <span className="material-symbols-outlined text-slate-600">campaign</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Marketing Tip</h4>
                      <p className="text-xs text-slate-600 leading-tight mt-0.5 font-medium">Flash sales usually boost weekend traffic by 30%. Plan ahead.</p>
                    </div>
                  </div>
                  <button onClick={() => toast.success('Opening promo creation tool...')} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all shrink-0 cursor-pointer shadow-sm">Create Promo</button>
                </div>
              </div>
            </>
          )}

          {activeTab !== 'dashboard' && (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm min-h-[500px] flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-6xl text-[#004ac6] mb-4 animate-bounce">
                {navItems.find(i => i.id === activeTab)?.icon}
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                {navItems.find(i => i.id === activeTab)?.label} Management
              </h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                Manage your store {navItems.find(i => i.id === activeTab)?.label.toLowerCase()} efficiently. Use the tools below to add new listings, update stock levels, or handle customer requests.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => toast.success(`Creating new item in ${navItems.find(i => i.id === activeTab)?.label}...`)}
                  className="px-6 py-3 bg-[#004ac6] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#004ac6]/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Create New {navItems.find(i => i.id === activeTab)?.label}
                </button>
                <button 
                  onClick={() => toast.success(`Exporting ${navItems.find(i => i.id === activeTab)?.label} data...`)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
                >
                  Export Data
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
          <button
            onClick={() => setShowAI(!showAI)}
            className="w-16 h-16 bg-[#004ac6] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all group relative border border-white/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-3xl">smart_toy</span>
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-white text-[#b3261e] font-black flex items-center justify-center rounded-full border-2 border-[#b3261e] shadow-lg text-[12px]">1</div>
            <span className="absolute right-full mr-4 px-3 py-1.5 bg-[#131b2e] text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">AI Assistant</span>
          </button>
        </div>

        {/* AI Chat Window */}
        {showAI && (
          <div className="fixed bottom-28 right-8 w-96 h-[550px] bg-white rounded-[2rem] shadow-2xl border border-slate-200 flex flex-col z-[60] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="p-6 bg-[#004ac6] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight">AI Assistant</h3>
                  <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Always Online</p>
                </div>
              </div>
              <button onClick={() => setShowAI(false)} className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50/50 flex flex-col">
              {aiMessages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-[#004ac6]/10 text-[#004ac6]'}`}>
                    <span className="material-symbols-outlined text-sm">{msg.sender === 'user' ? 'person' : 'smart_toy'}</span>
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed max-w-[80%] ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
              <form onSubmit={handleAiSubmit} className="flex gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200/60">
                <input
                  type="text"
                  placeholder="Ask AI anything..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium px-2 outline-none"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                />
                <button type="submit" className="w-10 h-10 bg-[#004ac6] text-white rounded-xl flex items-center justify-center hover:scale-105 transition-all cursor-pointer shadow-md shadow-[#004ac6]/20">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerDashboard;
