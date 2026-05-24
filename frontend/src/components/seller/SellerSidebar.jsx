import React from 'react';

const SellerSidebar = ({ activeTab, setActiveTab, navItems, handleLogout }) => {
  return (
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
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item, index) => {
          const showCategory = index === 0 || navItems[index - 1].category !== item.category;
          const isActive = activeTab === item.id ||
            (activeTab === 'add-product' && item.id === 'products') ||
            (activeTab === 'order-detail' && item.id === 'orders');
          return (
            <React.Fragment key={item.id}>
              {showCategory && item.category === 'Settings' && (
                <div className="pt-4 pb-2 px-4 border-t border-slate-100/80 mt-2">
                </div>
              )}
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-[1.25rem] transition-all text-[15px] group cursor-pointer ${isActive
                  ? 'bg-[#E8EFFF] text-[#004ac6] font-bold shadow-sm shadow-blue-100/50'
                  : 'text-[#475569] font-medium hover:bg-slate-50'
                  }`}
              >
                <span
                  className="material-symbols-outlined text-[24px] w-6 flex justify-center group-hover:scale-110 transition-transform"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon === 'dashboard' ? 'space_dashboard' : item.icon}
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
              onClick={() => setActiveTab('wallet')}
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
  );
};

export default SellerSidebar;
