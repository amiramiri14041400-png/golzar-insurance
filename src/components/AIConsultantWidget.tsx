import React, { useState } from 'react';
import { Sparkles, MessageCircle, Send, X, Bot, User, ShieldCheck } from 'lucide-react';

export const AIConsultantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: 'سلام! من مشاور هوشمند بیمه ایران (نمایندگی گلزار کد ۳۰۹۶۲) هستم. هر سوالی درباره استعلام قیمت، انتقال تخفیف، یا پوشش‌های بیمه دارید بپرسید.'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText })
      });

      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
    } catch (err) {
      console.error('AI chat error:', err);
      setMessages(prev => [
        ...prev, 
        { sender: 'bot', text: 'پاسخگویی با خطا مواجه شد. جهت راهنمایی دقیق می‌توانید با ۰۲۱-۸۸۹۹۰۰۱۱ تماس بگیرید.' }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 dir-rtl">
      
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-gradient-to-r from-emerald-800 to-slate-900 hover:from-emerald-700 hover:to-slate-800 text-white p-3.5 rounded-2xl shadow-2xl border-2 border-amber-400 flex items-center gap-2.5 transition-all duration-300 hover:scale-105"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow animate-pulse">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-amber-300">مشاور هوشمند بیمه</p>
            <p className="text-[10px] text-emerald-200">پاسخ آنلاین به سوالات بیمه</p>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-[90vw] sm:w-96 overflow-hidden flex flex-col h-[480px] animate-fadeIn">
          
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">مشاور هوشمند بیمه ایران</h4>
                <p className="text-[10px] text-emerald-200">نمایندگی گلزار کد ۳۰۹۶۲</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-800 text-white rounded-br-none font-medium'
                      : 'bg-white text-slate-800 border shadow-sm rounded-bl-none font-normal'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium">
                <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>مشاور در حال پاسخگویی...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-3 bg-white border-t flex items-center gap-2">
            <input
              type="text"
              placeholder="سوال خود درباره بیمه شخص ثالث، بدنه..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white font-medium"
            />
            <button
              onClick={handleSendMessage}
              disabled={isTyping}
              className="p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
