import React from 'react';
import { Link } from 'react-router-dom';

const FABGroup = () => {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
      {/* Message FAB */}
      <Link to="/messages" className="w-16 h-16 bg-[#004ac6] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all group relative border border-[#004ac6]/10">
        <span className="material-symbols-outlined text-3xl">chat</span>
        <div className="absolute -top-1 -right-1 w-7 h-7 bg-white text-[#004ac6] font-black flex items-center justify-center rounded-full border-2 border-[#004ac6] shadow-lg text-[12px]">2</div>
        <span className="absolute right-full mr-4 px-3 py-1.5 bg-[#131b2e] text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Messages</span>
      </Link>
      {/* AI Chatbot FAB */}
      <button className="w-16 h-16 bg-[#004ac6] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all group relative border border-[#004ac6]/10">
        <span className="material-symbols-outlined text-3xl">smart_toy</span>
        <div className="absolute -top-1 -right-1 w-7 h-7 bg-white text-[#ba1a1a] font-black flex items-center justify-center rounded-full border-2 border-[#ba1a1a] shadow-lg text-[12px]">1</div>
        <span className="absolute right-full mr-4 px-3 py-1.5 bg-[#131b2e] text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">AI Assistant</span>
      </button>
    </div>
  );
};

export default FABGroup;
