/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Bot, User, Sparkles, MessageSquare, AlertCircle, Phone, 
  CheckSquare, Square, Calculator, ShieldCheck, ChevronDown, ChevronUp, Check, Info, ArrowLeft
} from 'lucide-react';
import { Message } from '../types';
import { calculateHull, formatToman, toPersianDigits } from '../data/insuranceRates';

interface SmartConsultantProps {
  currentPreferences: any;
  onApplyAIRecommendation: (insuranceType: string, config: any) => void;
}

const QUICK_QUESTIONS = [
  "استعلام قیمت بیمه بدنه سمند ۹۸ (ارزش ۸۰۰ میلیون تومان)",
  "چرا بیمه عمر ایران (مان) بهترین گزینه سرمایه‌گذاری است؟",
  "شرایط تخفیف عدم خسارت بیمه شخص ثالث در سال جاری چگونه است؟",
  "پوشش نوسان قیمت در بیمه بدنه چه فایده‌ای دارد؟",
  "آیا بیمه آتش‌سوزی ساختمان شامل اثاثیه خانه هم می‌شود؟"
];

// Car presets including user's specific Samand 1398 800M Toman
const CAR_PRESETS = [
  { id: 'samand_soren', name: 'سمند سورن EF7', year: 1398, valueToman: 800000000 },
  { id: 'peugeot_206', name: 'پژو ۲۰۶ تیپ ۲', year: 1400, valueToman: 600000000 },
  { id: 'dena_plus', name: 'دنا پلاس توربو', year: 1401, valueToman: 950000000 },
  { id: 'pride_131', name: 'پراید ۱۳۱', year: 1398, valueToman: 300000000 },
  { id: 'custom', name: 'خودروی سفارشی / سایر', year: 1399, valueToman: 700000000 },
];

export default function SmartConsultant({ currentPreferences, onApplyAIRecommendation }: SmartConsultantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'سلام! من دستیار بیمه هوشمند نمایندگی گلزار بیمه ایران (کد ۴۴۵۶) هستم. چطور می‌توانم شما را در انتخاب مناسب‌ترین پوشش، استعلام نرخ‌ها یا مشاوره تخصصی بیمه‌های ثالث، بدنه، آتش‌سوزی، عمر و مسافرتی کمک کنم؟',
      timestamp: new Date().toLocaleTimeString('fa-IR'),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for interactive Bimeh Iran step-by-step Hull Insurance inquiry
  const [showHullInquiryWidget, setShowHullInquiryWidget] = useState(true);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0); // Default to Samand 1398 800M Toman
  const [customValueToman, setCustomValueToman] = useState(800000000);
  const [customManufactureYear, setCustomManufactureYear] = useState(1398);

  // Step 1: Want supplementary coverages? (آیا پوشش های تکمیلی میخوای؟)
  const [wantsAddons, setWantsAddons] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Step 2: Previously had Hull insurance? (آیا تا به حال بیمه بدنه داشته اید؟)
  const [hadPreviousInsurance, setHadPreviousInsurance] = useState(false);
  const [noClaimYears, setNoClaimYears] = useState(0);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, wantsAddons, hadPreviousInsurance]);

  // Calculate current hull quote based on selections
  const activeVehicleValueRials = (selectedPresetIndex === 4 ? customValueToman : CAR_PRESETS[selectedPresetIndex].valueToman) * 10;
  const activeManufactureYear = selectedPresetIndex === 4 ? customManufactureYear : CAR_PRESETS[selectedPresetIndex].year;

  const currentQuote = calculateHull({
    vehicleType: 'sedan',
    vehicleValue: activeVehicleValueRials,
    manufactureYear: activeManufactureYear,
    noClaimYears: hadPreviousInsurance ? noClaimYears : 0,
    selectedAddons: wantsAddons ? selectedAddons : [],
  });

  const toggleAddon = (addonKey: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonKey) ? prev.filter(a => a !== addonKey) : [...prev, addonKey]
    );
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Check if user is asking about hull insurance / pricing
    if (textToSend.includes('بدنه') || textToSend.includes('قیمت') || textToSend.includes('استعلام') || textToSend.includes('سمند')) {
      setShowHullInquiryWidget(true);
    }

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('fa-IR'),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/smart-consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userPreferences: {
            ...currentPreferences,
            hullQuoteData: currentQuote,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('سیستم هوشمند موقتاً پاسخگو نیست.');
      }

      const data = await response.json();
      
      const assistantMsg: Message = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString('fa-IR'),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setError('امکان برقراری ارتباط با سرور هوشمند نیست. لطفاً اتصال اینترنت خود را بررسی کنید یا از محاسبگرهای دستی نرخ‌ها استفاده نمایید.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Push quote breakdown directly into chat as an official Bimeh Iran quote card
  const handlePushQuoteToChat = () => {
    const carName = selectedPresetIndex === 4 ? 'خودرو' : CAR_PRESETS[selectedPresetIndex].name;
    const valueStr = formatToman(activeVehicleValueRials / 10);
    const grossPriceStr = formatToman(currentQuote.grossBaseNoDiscountRials / 10);
    const finalPriceStr = formatToman(currentQuote.finalPremium / 10);

    let breakdownText = `📋 **نتیجه استعلام رسمی بیمه بدنه - بیمه ایران (نمایندگی گلزار کد ۴۴۵۶)**\n\n`;
    breakdownText += `🚗 **خودرو:** ${carName} مدل ${toPersianDigits(activeManufactureYear)}\n`;
    breakdownText += `💎 **ارزش اعلامی:** ${valueStr}\n\n`;
    breakdownText += `💰 **نرخ پایه بدون تخفیف:** ${grossPriceStr}\n`;
    
    if (hadPreviousInsurance && noClaimYears > 0) {
      breakdownText += `✅ **تخفیف عدم خسارت (${toPersianDigits(noClaimYears)} سال):** ${toPersianDigits(currentQuote.noClaimRate * 100)}٪ تخفیف\n`;
    }
    breakdownText += `✅ **تخفیف پرداخت نقدی بیمه ایران:** ۱۰٪ تخفیف\n`;

    if (wantsAddons && selectedAddons.length > 0) {
      breakdownText += `➕ **پوشش‌های تکمیلی انتخاب‌شده:** ${toPersianDigits(selectedAddons.length)} مورد (${formatToman(currentQuote.addonCost / 10)})\n`;
    }

    breakdownText += `\n🏷️ **مبلغ نهایی قابل پرداخت با احتساب موارد انتخابی:**\n**${finalPriceStr}**`;

    const assistantMsg: Message = {
      id: Math.random().toString(),
      sender: 'assistant',
      text: breakdownText,
      timestamp: new Date().toLocaleTimeString('fa-IR'),
    };

    setMessages(prev => [...prev, assistantMsg]);
  };

  return (
    <div id="smart-consultant-section" className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-[720px] shadow-2xl">
      {/* Consultant Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-indigo-900 px-5 py-3.5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-amber-400 p-2 rounded-xl text-slate-900 shadow-md">
            <Bot size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
              مشاور هوشمند بیمه ایران
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-medium px-2 py-0.5 rounded-full border border-amber-400/30">
                کد ۴۴۵۶
              </span>
            </h3>
            <p className="text-blue-100 text-[10px] font-light">استعلام لحظه‌ای نرخ رسمی سندیکای بیمه ایران</p>
          </div>
        </div>
        <button
          onClick={() => setShowHullInquiryWidget(!showHullInquiryWidget)}
          className="flex items-center gap-1.5 text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition cursor-pointer shadow"
        >
          <Calculator size={14} />
          <span>{showHullInquiryWidget ? 'بستن استعلام' : 'استعلام هوشمند بدنه'}</span>
        </button>
      </div>

      {/* Embedded Interactive Bimeh Iran Step-by-Step Inquiry Box */}
      <AnimatePresence>
        {showHullInquiryWidget && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-950 border-b border-slate-800 p-4 space-y-4 max-h-[380px] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck size={16} />
                استعلام گام‌به‌گام بیمه بدنه خودرو (فرمول رسمی بیمه ایران)
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                بر اساس آیین‌نامه سندیکا
              </span>
            </div>

            {/* Vehicle Selection Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-400 block mb-1">انتخاب خودرو و ارزش معاملاتی:</label>
                <select
                  value={selectedPresetIndex}
                  onChange={(e) => setSelectedPresetIndex(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                >
                  {CAR_PRESETS.map((p, idx) => (
                    <option key={p.id} value={idx}>
                      {p.name} - مدل {toPersianDigits(p.year)} - ارزش {formatToman(p.valueToman)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPresetIndex === 4 && (
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">ارزش خودرو (تومان):</label>
                  <input
                    type="number"
                    step="50000000"
                    value={customValueToman}
                    onChange={(e) => setCustomValueToman(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-blue-500 focus:outline-none text-right font-sans"
                  />
                </div>
              )}
            </div>

            {/* Price without discount announcement */}
            <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-blue-300 font-medium block">نرخ پایه بدون تخفیف (حق بیمه پایه + مالیات و عوارض):</span>
                <span className="text-base font-black text-amber-400">
                  {formatToman(currentQuote.grossBaseNoDiscountRials / 10)}
                </span>
                <span className="text-[10px] text-slate-400 block mr-1">
                  ({toPersianDigits(currentQuote.grossBaseNoDiscountRials.toLocaleString('fa-IR'))} ریال)
                </span>
              </div>
              <div className="text-[10px] text-slate-300 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-left">
                تخفیف نقدی ۱۰٪ بیمه ایران: <span className="text-emerald-400 font-bold">{formatToman(currentQuote.cashDiscountRials / 10)}</span>
              </div>
            </div>

            {/* Required Questions Section */}
            <div className="space-y-3 bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              {/* Question 1: Supplementary Coverages */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-xs font-bold text-slate-200">آیا پوشش‌های تکمیلی می‌خواهی؟</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setWantsAddons(true)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      wantsAddons ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    بله
                  </button>
                  <button
                    onClick={() => { setWantsAddons(false); setSelectedAddons([]); }}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      !wantsAddons ? 'bg-slate-800 text-slate-300' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    خیر
                  </button>
                </div>
              </div>

              {/* Sub-options for Addons if Yes */}
              {wantsAddons && (
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-2">
                  <span className="text-[11px] text-blue-300 font-semibold block mb-1">پیشنهاد پوشش‌های تکمیلی بیمه ایران:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'theft_parts', title: 'سرقت درجا قطعات و لوازم', pct: '۱۵٪' },
                      { id: 'glass_breakage', title: 'شکست شیشه به تنهایی', pct: '۵٪' },
                      { id: 'acid', title: 'پاشیدن رنگ، اسید و مواد شیمیایی', pct: '۵٪' },
                      { id: 'natural_disasters', title: 'بلایای طبیعی (زلزله، سیل و آتشفشان)', pct: '۱۰٪' },
                      { id: 'price_fluctuation', title: 'نوسان قیمت بازار (تا سقف ۵۰٪)', pct: '۱۲٪' },
                      { id: 'transit', title: 'ترانزیت و خروج از کشور', pct: '۸٪' },
                    ].map(addon => {
                      const isSelected = selectedAddons.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          className={`p-2 rounded-lg border text-right transition flex items-center justify-between cursor-pointer text-[11px] ${
                            isSelected 
                              ? 'bg-blue-900/30 border-blue-500 text-blue-200' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {isSelected ? <CheckSquare size={14} className="text-blue-400" /> : <Square size={14} />}
                            {addon.title}
                          </span>
                          <span className="text-[10px] text-amber-400/90 font-mono">{addon.pct}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Question 2: Had previous Hull insurance? */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-xs font-bold text-slate-200">آیا تا به حال بیمه بدنه داشته اید؟</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setHadPreviousInsurance(true); if (noClaimYears === 0) setNoClaimYears(1); }}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      hadPreviousInsurance ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    بله
                  </button>
                  <button
                    onClick={() => { setHadPreviousInsurance(false); setNoClaimYears(0); }}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      !hadPreviousInsurance ? 'bg-slate-800 text-slate-300' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    خیر
                  </button>
                </div>
              </div>

              {/* Instructional Guide text requested by user */}
              <div className="text-[11px] text-amber-300/90 bg-amber-400/10 border border-amber-400/20 p-2.5 rounded-lg font-light leading-relaxed">
                📌 <strong>راهنما:</strong> در صورت اینکه جواب بله هست دکمه کنار سوال رو بزنید و هرکدام رو بله زد پوشش‌ها بهش پیشنهاد داده بشه و یا تعداد سال‌های عدم خسارت رو بنویسید.
              </div>

              {/* Sub-field for No claim years if Yes */}
              {hadPreviousInsurance && (
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-2">
                  <label className="text-[11px] text-blue-300 font-semibold block">
                    تعداد سال‌های عدم خسارت بیمه بدنه (جهت اعمال تخفیف):
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { years: 1, label: '۱ سال (۲۵٪)' },
                      { years: 2, label: '۲ سال (۳۵٪)' },
                      { years: 3, label: '۳ سال (۴۵٪)' },
                      { years: 4, label: '۴ سال+ (۶۰٪)' },
                    ].map(item => (
                      <button
                        key={item.years}
                        onClick={() => setNoClaimYears(item.years)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer border text-center ${
                          noClaimYears === item.years
                            ? 'bg-amber-400 text-slate-950 border-amber-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Final Recalculated Output with options */}
            <div className="bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-500/30 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5 text-right">
                <span className="text-[10px] text-emerald-400 font-bold block">قیمت نهایی با احتساب موارد انتخابی و تخفیفات:</span>
                <span className="text-lg font-black text-white">
                  {formatToman(currentQuote.finalPremium / 10)}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  ({toPersianDigits(currentQuote.finalPremium.toLocaleString('fa-IR'))} ریال)
                </span>
              </div>

              <button
                onClick={handlePushQuoteToChat}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg"
              >
                <span>ارسال استعلام رسمی به چت</span>
                <ArrowLeft size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Stage */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/80 custom-scrollbar relative">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 max-w-[88%] ${
                msg.sender === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-amber-400 text-slate-900'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
              </div>
              <div
                className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-400 text-slate-950 rounded-tr-none'
                    : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                <div
                  className={`text-[9px] mt-2 block text-left ${
                    msg.sender === 'user' ? 'text-slate-800' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 max-w-[85%] ml-auto"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
              <Bot size={15} />
            </div>
            <div className="p-4 bg-slate-900 text-slate-200 border border-slate-800 rounded-2xl rounded-tl-none flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-300"></span>
              </div>
              <span className="text-xs text-slate-400">دستیار هوشمند بیمه ایران در حال محاسبه نرخ و تحلیل قوانین است...</span>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Questions Recommendation Drawer */}
      <div className="bg-slate-950 border-t border-slate-800 p-2.5 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-blue-300 hover:text-white px-3 py-1.5 rounded-full transition-all duration-200 ease-in-out cursor-pointer inline-flex items-center gap-1 flex-shrink-0 disabled:opacity-50"
          >
            <MessageSquare size={11} className="text-blue-400" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Input Stage */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="bg-slate-900 p-3 border-t border-slate-800 flex gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="سوال خود یا جزئیات خودروی مورد نظرتان را اینجا بنویسید..."
          disabled={isLoading}
          className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="bg-amber-400 hover:bg-amber-500 disabled:bg-slate-800 text-slate-950 disabled:text-slate-600 font-bold px-4 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Send size={18} className="rotate-180" />
        </button>
      </form>
    </div>
  );
}

