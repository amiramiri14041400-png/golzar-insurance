import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, X, PhoneCall, ShieldCheck, RefreshCw } from 'lucide-react';
import { IRAN_BIMEH_AGENCY } from '../types';

interface AiConsultantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiConsultantDrawer: React.FC<AiConsultantDrawerProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'سلام! من مشاور هوشمند بیمه ایران (نمایندگی گلزار کد ۳۰۹۶۲) هستم. هر سوالی در مورد نرخ تخفیف‌ها، پوشش مالی شخص ثالث، شرایط بیمه بدنه یا مراحل دریافت خسارت دارید بپرسید تا راهنماییتون کنم.'
    }
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userText = prompt.trim();
    setPrompt('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText })
      });

      const data = await res.json();
      setLoading(false);
      setMessages(prev => [...prev, { sender: 'ai', text: data.response || 'پاسخی دریافت نشد.' }]);
    } catch (err) {
      setLoading(false);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: 'در حال حاضر ارتباط با دستیار هوشمند قطع است. لطفاً مستقیماً با کارشناسان نمایندگی گلزار تماس بگیرید: ۰۲۱-۸۸۹۹۰۰۱۱'
      }]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-slideLeft">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white p-4 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">مشاور هوشمند بیمه ایران</h3>
              <p className="text-[11px] text-emerald-200">نمایندگی گلزار (کد ۳۰۹۶۲)</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-emerald-800 text-emerald-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {messages.map((m, idx) => (
            <div 
              key={idx}
              className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-emerald-800 text-white rounded-br-none'
                  : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-none font-medium'
              }`}>
                {m.text}
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 items-center text-slate-500 text-xs italic">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
              <span>مشاور در حال پاسخگویی...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
          
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input 
              type="text"
              placeholder="سوال خود را درباره شرایط بیمه بپرسید..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600 font-medium"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-800 hover:bg-emerald-900 text-white p-2.5 rounded-xl shrink-0 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>تماس با تلفن دفتر:</span>
            <a href={`tel:${IRAN_BIMEH_AGENCY.phone1.replace(/-/g, '')}`} className="font-bold text-emerald-800">
              {IRAN_BIMEH_AGENCY.phone1}
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
