/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shield, Bot, Phone, Award, Clock, MapPin, 
  HelpCircle, ChevronDown, CheckCircle2, HeartHandshake, Zap, Landmark 
} from 'lucide-react';
import SmartConsultant from './components/SmartConsultant';
import PricingCalculator from './components/PricingCalculator';
import LeadForm from './components/LeadForm';
import { toPersianDigits } from './data/insuranceRates';

export default function App() {
  const [preferences, setPreferences] = useState<any>({
    type: 'third_party',
  });

  const [selectedQuote, setSelectedQuote] = useState<{
    type: string;
    calculatedData: any;
    inputs: any;
  } | null>(null);

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handlePreferencesChange = (newPrefs: any) => {
    setPreferences(newPrefs);
  };

  const handleSelectQuote = (type: string, calculatedData: any, inputs: any) => {
    setSelectedQuote({ type, calculatedData, inputs });
  };

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "تخفیف عدم خسارت بیمه شخص ثالث چگونه محاسبه می‌شود و سقف آن چقدر است؟",
      a: "تخفیف عدم خسارت شخص ثالث سالانه ۵٪ به حق بیمه شما اضافه می‌شود. سقف این تخفیف پس از ۱۴ سال کارکرد بدون خسارت به ۷۰٪ می‌رسد. در صورت بروز حادثه و استفاده از بیمه، تخفیف‌های شما به صورت پلکانی کاهش می‌یابد و کاملاً صفر نمی‌شود."
    },
    {
      q: "پوشش نوسان قیمت بازار در بیمه بدنه چه ضرورتی دارد؟",
      a: "با توجه به تورم و افزایش مداوم قیمت خودروها، اگر خودروی شما در طول سال گران شود و حادثه‌ای رخ دهد، شرکت بیمه خسارت را بر اساس ارزش زمان صدور بیمه‌نامه پرداخت می‌کند. با خرید پوشش نوسان قیمت (تا سقف ۵۰٪ یا ۱۰۰٪)، خودروی شما به ارزش روز بیمه شده و خسارت کامل پرداخت می‌گردد."
    },
    {
      q: "طرح عمر و پس‌انداز 'مان' بیمه ایران چه مزایایی نسبت به بانک دارد؟",
      a: "بیمه عمر مان علاوه بر پرداخت سود تضمینی و سود مشارکت حاصل از سرمایه‌گذاری‌های دولتی بیمه ایران، پوشش‌های فوق‌العاده درمانی و حمایتی مانند هزینه‌های پزشکی حادثه، غرامت بیماری‌های خاص، معافیت از پرداخت حق بیمه در صورت ازکارافتادگی و سرمایه فوت را نیز به بیمه‌گذار ارائه می‌دهد که بانک فاقد این موارد است."
    },
    {
      q: "فرانشیز در بیمه به چه معناست؟",
      a: "فرانشیز سهم یا درصدی از خسارت است که پرداخت آن بر عهده خود بیمه‌گذار است. به عنوان مثال، در اولین خسارت بیمه بدنه معمولاً فرانشیز ۱۰٪ است؛ یعنی ۹۰٪ خسارت ارزیابی شده توسط بیمه ایران پرداخت می‌شود و ۱۰٪ مابقی سهم شما خواهد بود."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white" dir="rtl">
      {/* Visual Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main App Bar / Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-700 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/10">
              <Shield size={24} className="text-amber-300 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">بیمه ایران</h1>
                <span className="bg-amber-400 text-slate-950 font-bold text-[9px] px-2 py-0.5 rounded-md">نمایندگی گلزار</span>
              </div>
              <p className="text-slate-400 text-[10px] font-medium">سامانه هوشمند مشاوره، استعلام و نرخ‌دهی دقیق (کد ۴۴۵۶)</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1 hover:text-slate-200 cursor-pointer">
              <MapPin size={14} className="text-blue-500" />
              تهران، خیابان گلزار، پلاک ۴۴
            </span>
            <span className="flex items-center gap-1 hover:text-slate-200 cursor-pointer">
              <Clock size={14} className="text-blue-500" />
              ساعت کاری: ۸:۳۰ الی ۱۷:۰۰
            </span>
          </div>

          <div>
            <a
              href="tel:02144567890"
              className="bg-slate-900 hover:bg-slate-850 text-blue-400 hover:text-blue-300 font-bold px-4 py-2.5 rounded-xl border border-blue-500/20 text-xs flex items-center gap-1.5 transition-all duration-200 shadow-md hover:scale-[1.02]"
            >
              <Phone size={14} />
              <span>۰۲۱-۴۴۵۶۷۸۹۰</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Welcome Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-950/20 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full blur-[40px] pointer-events-none" />
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-amber-400/10 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/20">
              <Zap size={13} />
              <span>طرح مشاوره و استعلام نرخ هوشمند بر اساس تعرفه‌های رسمی سال جاری</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              آرامش و امنیت شما با <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">اولین و معتبرترین</span> شرکت بیمه دولتی کشور
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-light">
              در نمایندگی گلزار (کد ۴۴۵۶ بیمه ایران) با استفاده از هوش مصنوعی و آخرین نرخ‌نامه‌های مصوب بیمه مرکزی، ریسک‌های خود را تحلیل کنید، قیمت دقیق پوشش‌های ثالث، بدنه، آتش‌سوزی و زلزله، عمر مان و مسافرتی را در لحظه بسنجید و پیش‌نویس استعلام خود را آنلاین صادر نمایید.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/60 text-center">
            <div className="space-y-1">
              <span className="text-slate-500 text-[10px] font-bold block">رتبه رضایت مشتریان</span>
              <span className="text-sm sm:text-base font-black text-white flex items-center justify-center gap-1">
                <Award size={15} className="text-amber-400" />
                رتبه ممتاز کشوری
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 text-[10px] font-bold block">پشتوانه پرداخت خسارت</span>
              <span className="text-sm sm:text-base font-black text-white flex items-center justify-center gap-1">
                <Landmark size={15} className="text-blue-400" />
                ۱۰۰٪ تضمین دولتی
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 text-[10px] font-bold block">پرداخت خسارت سریع</span>
              <span className="text-sm sm:text-base font-black text-white flex items-center justify-center gap-1">
                <Clock size={15} className="text-emerald-400" />
                کمتر از ۲۴ ساعت
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 text-[10px] font-bold block">خدمت‌رسانی بی‌وقفه</span>
              <span className="text-sm sm:text-base font-black text-white flex items-center justify-center gap-1">
                <HeartHandshake size={15} className="text-pink-400" />
                ۲۴ ساعت شبانه‌روز
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Right Section: Smart AI Advisor & Assistant */}
          <div className="xl:col-span-4 order-2 xl:order-1 flex flex-col justify-between">
            <div className="space-y-4 sticky top-24">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Bot size={14} className="text-blue-500" />
                  تحلیل زنده ترجیحات مشتری
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-light">
                  دستیار هوشمند ما با تحلیل اطلاعاتی که در محاسبگر سمت چپ وارد می‌کنید، سقف پوشش‌های توصیه‌شده و پوشش‌های ضروری برای کاهش ریسک مالی شما را بازگو می‌کند.
                </p>
                {preferences.calculatedPremium && (
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] flex justify-between items-center text-slate-300 font-sans">
                    <span>آخرین حق بیمه محاسباتی:</span>
                    <span className="text-amber-400 font-bold">
                      {preferences.type === 'life' 
                        ? toPersianDigits(preferences.calculatedPremium.toLocaleString('fa-IR')) + ' تومان سرمایه انباشته'
                        : toPersianDigits(Math.round(preferences.calculatedPremium / 10).toLocaleString('fa-IR')) + ' تومان'}
                    </span>
                  </div>
                )}
              </div>
              <SmartConsultant currentPreferences={preferences} onApplyAIRecommendation={() => {}} />
            </div>
          </div>

          {/* Left Section: Price Calculator Tab view */}
          <div className="xl:col-span-8 order-1 xl:order-2 space-y-8">
            <PricingCalculator 
              onPreferencesChange={handlePreferencesChange} 
              onSelectQuote={handleSelectQuote} 
            />

            {/* Accordion FAQ Guide Base */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-slate-100">
                <HelpCircle size={20} className="text-amber-400" />
                <h3 className="font-bold text-base">راهنما و سوالات متداول بیمه ایران (نمایندگی گلزار)</h3>
              </div>
              
              <div className="space-y-2">
                {faqs.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div 
                      key={idx} 
                      className="border border-slate-800 rounded-xl overflow-hidden transition-all duration-200"
                    >
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full flex items-center justify-between p-4 bg-slate-950/40 hover:bg-slate-950/60 text-right transition cursor-pointer text-sm font-semibold text-slate-300"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown 
                          size={16} 
                          className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-400' : ''}`} 
                        />
                      </button>
                      
                      {isOpen && (
                        <div className="p-4 bg-slate-950 text-xs text-slate-400 leading-relaxed font-light border-t border-slate-800">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Floating/Overlay Modal for Lead Submission */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl animate-in fade-in zoom-in duration-300 my-auto">
            <LeadForm 
              selectedInsuranceType={selectedQuote.type} 
              calculatedData={selectedQuote.calculatedData} 
              inputs={selectedQuote.inputs} 
              onClose={() => setSelectedQuote(null)} 
            />
          </div>
        </div>
      )}

      {/* Footer Details */}
      <footer className="bg-slate-950 border-t border-slate-800 text-xs text-slate-500 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-300 text-sm">نمایندگی گلزار بیمه ایران</span>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded">کد ۴۴۵۶</span>
            </div>
            <p className="leading-relaxed font-light">
              اولین و با سابقه‌ترین ارائه‌دهنده کلیه خدمات صدور و پرداخت خسارت بیمه‌های خودرو، عمر، مسئولیت، مهندسی و باربری با تضمین و پشتوانه ۱۰۰٪ دولتی شرکت سهامی بیمه ایران در تهران.
            </p>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-slate-300 block">اطلاعات تماس و دسترسی</span>
            <div className="space-y-1.5 font-light">
              <div>📍 آدرس: تهران، خیابان گلزار، پلاک ۴۴، ساختمان پزشکان، طبقه همکف</div>
              <div>📞 تلفن تماس: ۰۲۱-۴۴۵۶۷۸۹۰ | فکس: ۰۲۱-۴۴۵۶۷۸۹۱</div>
              <div>✉️ ایمیل نمایندگی: golzar4456@iraninsurance.ir</div>
            </div>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-slate-300 block">قوانین و مقررات قانونی</span>
            <p className="leading-relaxed font-light text-[11px]">
              کلیه محاسبات، جریمه‌ها و تخفیف‌های ارائه شده در این پورتال هوشمند بر اساس آیین‌نامه‌های مصوب شورای عالی بیمه و دستورالعمل‌های رسمی سندیکای بیمه‌گران ایران بوده و فرآیند نهایی صدور مشروط به استعلام کد ملی و تایید سوابق سیستم بیمه‌گری مرکزی خواهد بود.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/60 mt-8 pt-6 text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-light">
          <span>تمامی حقوق مادی و معنوی محفوظ و متعلق به نمایندگی گلزار بیمه ایران (کد ۴۴۵۶) می‌باشد. طراحی با استفاده از دستیار هوشمند گوگل.</span>
          <span>سال ۱۴۰۵ هجری شمسی</span>
        </div>
      </footer>
    </div>
  );
}
