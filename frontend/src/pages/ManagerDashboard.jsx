import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import toast from 'react-hot-toast';
import axios from 'axios';

const ManagerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { sender: 'ai', text: "Hello Manager! I'm your Operations Assistant. How can I help you streamline store approvals and violations today?" }
  ]);

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logout());
    navigate('/login');
    toast.success('Logged out successfully');
  };

  useEffect(() => {
    const fetchUnreadCount = async () => {
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
          const unread = data.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Fetch unread notifications error:', error);
      }
    };

    fetchUnreadCount();
  }, [user]);

  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const newMsg = { sender: 'user', text: aiInput };
    setAiMessages(prev => [...prev, newMsg]);
    setAiInput('');

    setTimeout(() => {
      setAiMessages(prev => [...prev, {
        sender: 'ai',
        text: `Reviewing operational queues for "${newMsg.text}"... 24 pending shop registrations require your attention.`
      }]);
    }, 1000);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: 'dashboard', category: 'General' },
    { id: 'shop_approval', label: 'Shop Approval', icon: 'storefront', category: 'Approvals' },
    { id: 'product_approval', label: 'Product Approval', icon: 'inventory_2', category: 'Approvals' },
    { id: 'violations', label: 'Violations', icon: 'report_problem', category: 'Safety & Monitoring' },
    { id: 'statistics', label: 'Statistics', icon: 'bar_chart', category: 'Safety & Monitoring' },
  ];

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen flex font-['Manrope'] overflow-hidden">
      {/* Manager Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 z-50 shadow-sm">
        {/* Brand Identity */}
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#004ac6] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
              UM
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-lg leading-tight tracking-tighter">Manager</h2>
              <p className="text-[10px] text-[#004ac6] font-black uppercase tracking-widest">Operations Hub</p>
            </div>
          </div>
        </div>

        {/* Manager Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item, index) => {
            const showCategory = index === 0 || navItems[index - 1].category !== item.category;
            return (
              <React.Fragment key={item.id}>
                {showCategory && (
                  <div className="pt-6 pb-2 px-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.category}</p>
                  </div>
                )}
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-sm font-medium group cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-[#E8EFFF] text-[#004ac6] font-bold shadow-sm'
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

        {/* System Status */}
        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Operational Health</span>
              <span className="w-2 h-2 bg-[#2e7d32] rounded-full animate-pulse"></span>
            </div>
            <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#2e7d32]" style={{ width: '98%' }}></div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Uptime: 99.9% | Tasks: 12</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-4 flex items-center justify-center gap-3 px-4 py-3 bg-red-50 text-[#b3261e] hover:bg-red-100 transition-all rounded-xl text-sm font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Exit Manager</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#F8FAFC]">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-40 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#004ac6] text-2xl">engineering</span>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter">Operations Intelligence</h1>

            <div className="ml-8 hidden md:flex items-center bg-[#F1F5F9] rounded-2xl px-4 py-2.5 w-96 group focus-within:ring-2 focus-within:ring-[#004ac6]/20 transition-all border border-slate-200/60">
              <span className="material-symbols-outlined text-slate-400 text-xl group-focus-within:text-[#004ac6]">search</span>
              <input
                type="text"
                placeholder="Search tasks, shops, or products..."
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 font-medium ml-2 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
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
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3 bg-[#F1F5F9] pl-1 pr-4 py-1 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-200 transition-all group">
              <div className="w-8 h-8 rounded-full bg-[#004ac6] flex items-center justify-center text-white text-xs font-black shadow-md shadow-blue-200">
                NB
              </div>
              <span className="text-sm font-bold text-slate-700">{user?.fullName || 'Operations Manager'}</span>
              <span className="material-symbols-outlined text-slate-400 text-lg group-hover:translate-y-0.5 transition-transform">expand_more</span>
            </div>
          </div>
        </header>

        {/* Stats Grid & Trends */}
        <div className="p-10 max-w-[1280px] mx-auto w-full space-y-10">
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:border-[#004ac6] transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#004ac6] flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl">storefront</span>
                    </div>
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Shops</p>
                  <h3 className="text-3xl font-black text-slate-900">24</h3>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:border-[#f59e0b] transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#f59e0b] flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl">inventory_2</span>
                    </div>
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Products</p>
                  <h3 className="text-3xl font-black text-slate-900">156</h3>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:border-[#b3261e] transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#b3261e] flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl">report</span>
                    </div>
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Reports</p>
                  <h3 className="text-3xl font-black text-slate-900">08</h3>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:border-[#2e7d32] transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 text-[#2e7d32] flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl">check_circle</span>
                    </div>
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Resolved Today</p>
                  <h3 className="text-3xl font-black text-slate-900">42</h3>
                </div>
              </div>

              {/* Trends */}
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Approval Trends</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Operational throughput over last 7 days</p>
                  </div>
                </div>
                <div className="h-80 flex items-end gap-4 border-b border-slate-100 pb-2">
                  <div className="flex-1 bg-[#004ac6]/10 h-[40%] rounded-2xl hover:bg-[#004ac6]/30 transition-all relative group">
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">120</span>
                  </div>
                  <div className="flex-1 bg-[#004ac6]/10 h-[60%] rounded-2xl hover:bg-[#004ac6]/30 transition-all relative group">
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">180</span>
                  </div>
                  <div className="flex-1 bg-[#004ac6] h-[85%] rounded-2xl hover:brightness-110 transition-all relative group shadow-lg shadow-blue-100">
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">256</span>
                  </div>
                  <div className="flex-1 bg-[#004ac6]/10 h-[45%] rounded-2xl hover:bg-[#004ac6]/30 transition-all relative group"></div>
                  <div className="flex-1 bg-[#004ac6]/10 h-[55%] rounded-2xl hover:bg-[#004ac6]/30 transition-all relative group"></div>
                  <div className="flex-1 bg-[#004ac6] h-[70%] rounded-2xl hover:brightness-110 transition-all relative group shadow-lg shadow-blue-100"></div>
                  <div className="flex-1 bg-[#004ac6]/10 h-[30%] rounded-2xl hover:bg-[#004ac6]/30 transition-all relative group"></div>
                </div>
                <div className="flex justify-between mt-4 px-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mon</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tue</span>
                  <span className="text-[10px] font-black text-[#004ac6] uppercase tracking-widest">Wed (Today)</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thu</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fri</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sat</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sun</span>
                </div>
              </div>

              {/* Task Queue & Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Task Queue */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Pending Tasks</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">High priority requests</p>
                    </div>
                    <button onClick={() => toast.success('Viewing all pending tasks')} className="text-[#004ac6] text-[10px] font-black uppercase tracking-widest hover:underline cursor-pointer">View All</button>
                  </div>
                  <div className="space-y-4 flex-1">
                    <div onClick={() => toast.success('Opening TechGear Solutions application')} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#004ac6]/30 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#004ac6] flex items-center justify-center">
                          <span className="material-symbols-outlined text-xl">store</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">TechGear Solutions</p>
                          <p className="text-[10px] text-slate-400 font-medium">Shop Registration • 2h ago</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-[#004ac6] transition-colors">chevron_right</span>
                    </div>

                    <div onClick={() => toast.success('Opening iPhone 15 Pro Max approval')} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#004ac6]/30 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#f59e0b] flex items-center justify-center">
                          <span className="material-symbols-outlined text-xl">inventory_2</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">iPhone 15 Pro Max (Refurbished)</p>
                          <p className="text-[10px] text-slate-400 font-medium">Product Approval • 4h ago</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-[#004ac6] transition-colors">chevron_right</span>
                    </div>

                    <div onClick={() => toast.success('Opening Counterfeit Report #824')} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#004ac6]/30 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-red-100 text-[#b3261e] flex items-center justify-center">
                          <span className="material-symbols-outlined text-xl">gavel</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Counterfeit Report #824</p>
                          <p className="text-[10px] text-slate-400 font-medium">Violation Report • 6h ago</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-[#004ac6] transition-colors">chevron_right</span>
                    </div>
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">System Activity</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time operation logs</p>
                    </div>
                    <span className="w-2 h-2 bg-[#2e7d32] rounded-full animate-pulse"></span>
                  </div>
                  <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100 flex-1">
                    <div className="relative pl-12">
                      <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border-4 border-[#F8FAFC] shadow-sm flex items-center justify-center z-10">
                        <span className="material-symbols-outlined text-[#2e7d32] text-lg">check_circle</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Shop Approved</p>
                        <p className="text-xs text-slate-500 mt-1">"FashionHub" has been successfully verified.</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">15 mins ago • By NB</p>
                      </div>
                    </div>

                    <div className="relative pl-12">
                      <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border-4 border-[#F8FAFC] shadow-sm flex items-center justify-center z-10">
                        <span className="material-symbols-outlined text-[#b3261e] text-lg">block</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Product Rejected</p>
                        <p className="text-xs text-slate-500 mt-1">"Gucci Replica Bag" violates counterfeit policy.</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">1 hour ago • System Bot</p>
                      </div>
                    </div>

                    <div className="relative pl-12">
                      <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border-4 border-[#F8FAFC] shadow-sm flex items-center justify-center z-10">
                        <span className="material-symbols-outlined text-[#004ac6] text-lg">info</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Security Alert</p>
                        <p className="text-xs text-slate-500 mt-1">Multiple login attempts from unknown IP.</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">3 hours ago • Security</p>
                      </div>
                    </div>
                  </div>
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
                {navItems.find(i => i.id === activeTab)?.label} Queue
              </h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                You are viewing the operational queue for {navItems.find(i => i.id === activeTab)?.label}. All items are organized by submission timestamp and risk score.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => toast.success(`Batch approving items in ${navItems.find(i => i.id === activeTab)?.label}...`)}
                  className="px-6 py-3 bg-[#004ac6] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#004ac6]/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Batch Approve All
                </button>
                <button 
                  onClick={() => toast.success(`Exporting audit log for ${navItems.find(i => i.id === activeTab)?.label}...`)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
                >
                  Export Audit Log
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
                  <h3 className="font-black text-sm tracking-tight">Manager AI Assistant</h3>
                  <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Operations Expert</p>
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

export default ManagerDashboard;
