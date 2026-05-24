import React, { useState } from 'react';

const SellerAIChat = () => {
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { sender: 'ai', text: "Hello Seller! I'm your UTEShop AI Assistant. How can I help you optimize your store sales and product listings today?" }
  ]);

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

  return (
    <>
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
                <div className={`p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed max-w-[80%] ${msg.sender === 'user'
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
    </>
  );
};

export default SellerAIChat;
