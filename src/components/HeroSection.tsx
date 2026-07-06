import React from 'react';
import { 
  ShieldCheck, 
  Car, 
  Home, 
  HeartPulse, 
  Briefcase, 
  Plane, 
  FileCheck, 
  Clock, 
  Search,
  Sparkles,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { InsuranceType, IRAN_BIMEH_AGENCY } from '../types';

interface HeroSectionProps {
  onOpenForm: (type: InsuranceType) => void;
  onGoToTrack: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenForm, onGoToTrack }) => {
  const categories = [
    {
      type: 'third_party' as InsuranceType,
      title: 'بیمه شخص ثالث',
      subtitle: 'استعلام فوری و اعمال حداکثر تخفیف',
      icon: Car,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      badge: 'پرتقاضا‌ترین',
      badgeColor: 'bg-amber-400 text-slate-900'
    },
    {
      type: 'body' as InsuranceType,
      title: 'بیمه بدنه خودرو',
      subtitle: 'پوشش سرقت، تصادف و بلایای طبیعی',
      icon: ShieldCheck,
      color: 'bg-teal-700 hover:bg-teal-800 text-white',
      badge: 'تخفیف ویژه',
      badgeColor: 'bg-emerald-300 text-emerald-950'
    },
    {
      type: 'fire' as InsuranceType,
      title: 'بیمه آتش‌سوزی و زلزله',
      subtitle: 'محافظت از منازل، فروشگاه و کارگاه',
      icon: Home,
      color: 'bg-slate-800 hover:bg-slate-900 text-white',
      badge: 'پوشش کامل',
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      type: 'health' as InsuranceType,
      title: 'درمان تکمیلی',
      subtitle: 'پوشش هزینه‌های بیمارستانی و پاراکلینیکی',
      icon: HeartPulse,
      color: 'bg-emerald-800 hover:bg-emerald-900 text-white',
      badge: 'انفرادی و گروهی',
      badgeColor: 'bg-amber-200 text-amber-900'
    },
    {
      type: 'liability' as InsuranceType,
      title: 'بیمه مسئولیت',
      subtitle: 'مسئولیت کارفرما، پزشکان و مهندسان',
      icon: Briefcase,
      color: 'bg-slate-700 hover:bg-slate-800 text-white',
      badge: 'تضمینی',
      badgeColor: 'bg-slate-200 text-slate-800'
    },
    {
      type: 'travel' as InsuranceType,
      title: 'بیمه مسافرتی',
      subtitle: 'پوشش حوادث و درمان سفرهای خارجی',
      icon: Plane,
      color: 'bg-amber-700 hover:bg-amber-800 text-white',
      badge: 'بین‌المللی',
      badgeColor: 'bg-amber-200 text-amber-900'
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 text-white pt-8 pb-16">
      {/* Subtle Persian Geometric Background Accents */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Top Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-900/80 backdrop-blur border border-emerald-700 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>نمایندگی رسمی بیمه ایران کد ۳۰۹۶۲ (گلزار)</span>
            <span className="bg-amber-400 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
              تأیید شده
            </span>
          </div>

          <button
            onClick={onGoToTrack}
            className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 font-bold bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full backdrop-blur border border-amber-400/30 transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>پیگیری درخواست با کد یا شماره موبایل</span>
          </button>
        </div>

        {/* Main Title & Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Right Column: Hero Headline & Text */}
          <div className="lg:col-span-7 space-y-6 text-right">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-white">
              استعلام آنلاین، ارسال مدارک و <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-amber-200">
                صدور فوری بیمه‌نامه ایران
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl">
              بدون نیاز به مراجعه حضوری! فرم استعلام را پر کنید، تصویر مدارک (کارت خودرو یا بیمه‌نامه قبلی) را بارگذاری نمایید تا کارشناسان رسمی نمایندگی گلزار (کد ۳۰۹۶۲) پس از بررسی دقیق، جهت صدور و ارسال بیمه‌نامه با شما تماس بگیرند.
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-medium text-emerald-100">
              <div className="flex items-center gap-2 bg-emerald-900/40 border border-emerald-800/60 p-2.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ارسال آسان مدارک آنلاین</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-900/40 border border-emerald-800/60 p-2.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>اعمال سوابق و تخفیف‌ها</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-900/40 border border-emerald-800/60 p-2.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>کد پیگیری و اطلاع پیامکی</span>
              </div>
            </div>

            {/* Emergency Phone Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
              <a
                href={`tel:${IRAN_BIMEH_AGENCY.phone1.replace(/-/g, '')}`}
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-5 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm"
              >
                <span>مشاوره تلفنی با کارشناس: {IRAN_BIMEH_AGENCY.phone1}</span>
                <ArrowLeft className="w-4 h-4" />
              </a>

              <span className="text-slate-400 text-xs">
                کد مجوز: <strong className="text-slate-200">{IRAN_BIMEH_AGENCY.licenseNumber}</strong>
              </span>
            </div>
          </div>

          {/* Left Column: Agency Hero Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl shadow-emerald-950">
              <img 
                src="/src/assets/images/iran_bimeh_hero_1783066024817.jpg" 
                alt="بیمه ایران نمایندگی گلزار ۳۰۹۶۲"
                referrerPolicy="no-referrer"
                className="w-full h-72 sm:h-80 object-cover object-center transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
                <span className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded w-fit mb-2">
                  دفتر رسمی کد ۳۰۹۶۲
                </span>
                <h3 className="font-bold text-lg text-white">نمایندگی گلزار بیمه ایران</h3>
                <p className="text-xs text-slate-300">پاسخگویی سریع، تضمین قیمت مصوب و تحویل بیمه‌نامه</p>
              </div>
            </div>
          </div>

        </div>

        {/* Categories Section - Insurance Selection */}
        <div className="mt-14">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              انتخاب نوع بیمه‌نامه جهت استعلام قیمت و صدور
            </h2>
            <p className="text-xs text-slate-300">
              روی یکی از گزینه‌های زیر کلیک کنید تا فرم مربوطه باز شود
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={cat.type}
                  onClick={() => onOpenForm(cat.type)}
                  className="group relative bg-slate-800/90 hover:bg-emerald-950/90 border border-slate-700 hover:border-emerald-500/80 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/30 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-900/60 group-hover:bg-amber-400 text-emerald-300 group-hover:text-slate-950 flex items-center justify-center transition-all duration-300">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${cat.badgeColor}`}>
                        {cat.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors mb-1">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                      {cat.subtitle}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-amber-300">
                    <span>تکمیل فرم و ارسال مدارک</span>
                    <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
