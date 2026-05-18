import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { sender: 'ai', text: "Hello Admin! I'm your Platform CMS Assistant. How can I assist you with platform governance today?" }
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
        text: `Analyzing platform metrics for "${newMsg.text}"... All systems are operating within optimal parameters.`
      }]);
    }, 1000);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: 'dashboard', category: 'General' },
    { id: 'users', label: 'User Management', icon: 'group', category: 'Management' },
    { id: 'promotions', label: 'Promotions', icon: 'campaign', category: 'Management' },
    { id: 'support', label: 'User Support', icon: 'support_agent', category: 'Management' },
    { id: 'finance_config', label: 'Finance Settings', icon: 'account_balance', category: 'Management' },
    { id: 'withdrawals', label: 'Withdrawal Approval', icon: 'payments', category: 'Management' },
    { id: 'logistics', label: 'Logistics Partners', icon: 'local_shipping', category: 'Management' },
    { id: 'rbac', label: 'Access Control', icon: 'admin_panel_settings', category: 'Security' },
    { id: 'security_logs', label: 'Security Logs', icon: 'security', category: 'Security' },
    { id: 'ui_config', label: 'UI/UX Settings', icon: 'palette', category: 'Appearance' },
    { id: 'platform_settings', label: 'Platform Settings', icon: 'settings', category: 'Appearance' },
  ];

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen flex font-['Manrope'] overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 z-50 shadow-sm">
        {/* Brand Identity */}
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#004ac6] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
              UA
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-lg leading-tight tracking-tighter">Admin CMS</h2>
              <p className="text-[10px] text-[#004ac6] font-black uppercase tracking-widest">Platform Authority</p>
            </div>
          </div>
        </div>

        {/* Admin Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item, index) => {
            const showCategory = index === 0 || navItems[index - 1].category !== item.category;
            return (
              <React.Fragment key={item.id}>
                {showCategory && (item.category !== 'General') && (
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
              <span className="text-[10px] font-bold text-slate-500 uppercase">Server Health</span>
              <span className="w-2 h-2 bg-[#2e7d32] rounded-full animate-pulse"></span>
            </div>
            <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#2e7d32]" style={{ width: '94%' }}></div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Latent: 12ms | Load: 0.45</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-4 flex items-center justify-center gap-3 px-4 py-3 bg-red-50 text-[#b3261e] hover:bg-red-100 transition-all rounded-xl text-sm font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Exit Admin CMS</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#F8FAFC]">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-40 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#004ac6] text-2xl">admin_panel_settings</span>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter">Platform Intelligence</h1>

            <div className="ml-8 hidden md:flex items-center bg-[#F1F5F9] rounded-2xl px-4 py-2.5 w-96 group focus-within:ring-2 focus-within:ring-[#004ac6]/20 transition-all border border-slate-200/60">
              <span className="material-symbols-outlined text-slate-400 text-xl group-focus-within:text-[#004ac6]">search</span>
              <input
                type="text"
                placeholder="Search users, shops, or product SKUs..."
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 font-medium ml-2 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-xl transition-all relative cursor-pointer border border-slate-100">
              <span className="material-symbols-outlined text-2xl">notifications</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#b3261e] rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3 bg-[#F1F5F9] pl-1 pr-4 py-1 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-200 transition-all group">
              <div className="w-8 h-8 rounded-full bg-[#004ac6] flex items-center justify-center text-white text-xs font-black shadow-md shadow-blue-200">
                AD
              </div>
              <span className="text-sm font-bold text-slate-700">{user?.fullName || 'System Admin'}</span>
              <span className="material-symbols-outlined text-slate-400 text-lg group-hover:translate-y-0.5 transition-transform">expand_more</span>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-10 max-w-[1280px] mx-auto w-full space-y-8">
          {activeTab === 'dashboard' && (
            <>
              {/* Welcome Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Global Dashboard</h2>
                  <p className="text-slate-600 text-base font-medium mt-1">Real-time health and transaction overview for UTEShop platform.</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm cursor-pointer">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    Past 30 Days
                  </button>
                  <button className="px-5 py-2.5 bg-[#004ac6] text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-[#004ac6]/30 hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer">
                    <span className="material-symbols-outlined text-sm">download</span>
                    Export Report
                  </button>
                </div>
              </div>

              {/* Global Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Global GMV */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-[#004ac6] transition-all duration-300">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-50 rounded-xl text-[#004ac6]">
                        <span className="material-symbols-outlined">trending_up</span>
                      </div>
                      <span className="text-xs font-bold text-[#2e7d32] bg-[#2e7d32]/10 px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                        24.8%
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Global GMV</p>
                    <h3 className="text-2xl font-black text-slate-900">2,845,900,000 <span class="text-sm font-medium text-slate-500">₫</span></h3>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">vs. last month: 2.2B ₫</p>
                  </div>
                </div>

                {/* Card 2: New Users */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-[#004ac6] transition-all duration-300">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                        <span className="material-symbols-outlined">person_add</span>
                      </div>
                      <span className="text-xs font-bold text-[#2e7d32] bg-[#2e7d32]/10 px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                        12.3%
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">New Users</p>
                    <h3 className="text-2xl font-black text-slate-900">15,242 <span className="text-sm font-medium text-slate-500">Scholars</span></h3>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">Total registered: 124.5k</p>
                  </div>
                </div>

                {/* Card 3: Active Promotions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-[#004ac6] transition-all duration-300">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-50 rounded-xl text-[#004ac6]">
                        <span className="material-symbols-outlined">campaign</span>
                      </div>
                      <span className="text-xs font-bold text-[#2e7d32] bg-[#2e7d32]/10 px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                        +5
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Active Promotions</p>
                    <h3 className="text-2xl font-black text-slate-900">24 <span className="text-sm font-medium text-slate-500">Live Now</span></h3>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">Vouchers claimed: 1,240</p>
                  </div>
                </div>

                {/* Card 4: Security Alerts */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-[#b3261e] transition-all duration-300">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-red-50 rounded-xl text-[#b3261e]">
                        <span className="material-symbols-outlined">security</span>
                      </div>
                      <span className="text-xs font-bold text-[#2e7d32] bg-[#2e7d32]/10 px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Healthy
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Security Status</p>
                    <h3 className="text-2xl font-black text-slate-900">0 <span className="text-sm font-medium text-slate-500">Incidents</span></h3>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">Last scan: 5 mins ago</p>
                  </div>
                </div>
              </div>

              {/* Platform Growth Analytics & Security Pulse */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* GMV Growth Chart */}
                <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Platform-wide GMV Growth</h2>
                      <p className="text-slate-500 text-sm font-medium mt-1">Aggregated transaction volume across all vendors.</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                      <button className="px-5 py-1.5 text-xs font-black uppercase tracking-widest bg-white text-[#004ac6] rounded-lg shadow-sm">Daily</button>
                      <button className="px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900">Weekly</button>
                      <button className="px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900">Monthly</button>
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col justify-end">
                    <div className="relative h-[280px] w-full flex items-end justify-between gap-6 px-4 border-b border-slate-100 pb-2">
                      <div className="flex-1 flex flex-col items-center group h-full justify-end relative">
                        <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">850M ₫</div>
                        <div className="w-full bg-[#004ac6]/10 rounded-t-xl transition-all group-hover:bg-[#004ac6]/30" style={{ height: '45%' }}></div>
                        <span className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">W1</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center group h-full justify-end relative">
                        <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">1.2B ₫</div>
                        <div className="w-full bg-[#004ac6]/20 rounded-t-xl transition-all group-hover:bg-[#004ac6]/30" style={{ height: '65%' }}></div>
                        <span className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">W2</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center group h-full justify-end relative">
                        <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">1.0B ₫</div>
                        <div className="w-full bg-[#004ac6]/15 rounded-t-xl transition-all group-hover:bg-[#004ac6]/30" style={{ height: '55%' }}></div>
                        <span className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">W3</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center group h-full justify-end relative">
                        <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">2.8B ₫</div>
                        <div className="w-full bg-[#004ac6] rounded-t-xl transition-all shadow-lg shadow-blue-100" style={{ height: '95%' }}></div>
                        <span className="mt-4 text-[10px] font-black text-[#004ac6] uppercase tracking-widest">Current</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Security Pulse */}
                <section className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6">Security Pulse</h3>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4 p-4 bg-red-50/50 rounded-xl border border-red-100">
                        <div className="p-2 bg-red-100 text-[#b3261e] rounded-lg">
                          <span className="material-symbols-outlined text-[20px]">policy</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Large Transaction Alert</p>
                          <p className="text-[11px] text-slate-600 mt-1 leading-snug">Shop #SH-2291 processed 150M ₫ in 2 minutes. Fraud check required.</p>
                          <div className="flex gap-3 mt-3">
                            <button className="text-[10px] font-black text-[#004ac6] hover:underline cursor-pointer">Review</button>
                            <button className="text-[10px] font-black text-[#b3261e] hover:underline cursor-pointer">Hold Funds</button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="p-2 bg-blue-100 text-[#004ac6] rounded-lg">
                          <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Role Elevation Request</p>
                          <p className="text-[11px] text-slate-600 mt-1 leading-snug">User #US-8821 requested Manager privileges for Operations Hub.</p>
                          <div className="flex gap-3 mt-3">
                            <button className="text-[10px] font-black text-[#004ac6] hover:underline cursor-pointer">Approve</button>
                            <button className="text-[10px] font-black text-slate-500 hover:underline cursor-pointer">Deny</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}

          {activeTab !== 'dashboard' && (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm min-h-[500px] flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-6xl text-[#004ac6] mb-4 animate-bounce">
                {navItems.find(i => i.id === activeTab)?.icon}
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                {navItems.find(i => i.id === activeTab)?.label} Module
              </h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                This administrative governance module is currently active. Use the controls below to configure platform parameters, manage access permissions, or export compliance logs.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => toast.success(`Settings for ${navItems.find(i => i.id === activeTab)?.label} saved successfully.`)}
                  className="px-6 py-3 bg-[#004ac6] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#004ac6]/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Save Configuration
                </button>
                <button 
                  onClick={() => toast.success(`Exporting ${navItems.find(i => i.id === activeTab)?.label} records...`)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
                >
                  Export Records
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
                  <h3 className="font-black text-sm tracking-tight">Admin AI Assistant</h3>
                  <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Platform Governance</p>
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

export default AdminDashboard;
