import React from 'react';
import { ShieldCheck, PhoneCall, MapPin, Mail, Clock, FileCheck2, Database, ExternalLink } from 'lucide-react';
import { IRAN_BIMEH_AGENCY } from '../types';

interface FooterProps {
  onOpenSupabaseModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSupabaseModal }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t-4 border-emerald-600 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: About Agency */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-black text-lg">
                ایران
              </div>
              <div>
                <h3 className="font-bold text-white text-base">بیمه ایران - نمایندگی گلزار</h3>
                <p className="text-amber-400 text-xs font-semibold">کد نمایندگی رسمی: ۳۰۹۶۲</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              نمایندگی رسمی ۳۰۹۶۲ بیمه ایران (گلزار). ارائه‌دهنده خدمات تخصصی مشاوره، استعلام آنلاین قیمت، اخذ مدارک الکترونیکی و صدور فوری انواع بیمه‌نامه‌های شخص ثالث، بدنه، آتش‌سوزی، درمان و مسئولیت.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[11px] px-2.5 py-1 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                دارای مجوز رسمی مرکزی بیمه ایران
              </span>
            </div>
          </div>

          {/* Col 2: Insurance Services */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-500" />
              خدمات استعلام و صدور
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>• استعلام و صدور آنلاین بیمه شخص ثالث خودرو</li>
              <li>• بیمه بدنه خودرو با حداکثر تخفیف‌های سابقه</li>
              <li>• بیمه آتش‌سوزی، ززلزله و سیل منازل و کارگاه‌ها</li>
              <li>• بیمه درمان تکمیلی انفرادی و گروهی</li>
              <li>• بیمه عمر و سرمایه‌گذاری با سود تضمینی</li>
              <li>• بیمه مسئولیت کارفرما در قبال کارکنان</li>
            </ul>
          </div>

          {/* Col 3: Agency Contact Info */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-500" />
              اطلاعات تماس نمایندگی گلزار
            </h4>

            <div className="space-y-2.5 text-xs text-slate-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{IRAN_BIMEH_AGENCY.address}</span>
              </p>

              <p className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تلفن دفتر: {IRAN_BIMEH_AGENCY.phone1} - {IRAN_BIMEH_AGENCY.phone2}</span>
              </p>

              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ساعات پاسخگویی: {IRAN_BIMEH_AGENCY.workingHours}</span>
              </p>

              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>پست الکترونیک: {IRAN_BIMEH_AGENCY.email}</span>
              </p>
            </div>
          </div>

          {/* Col 4: Supabase / Cloudflare & Next.js Specs */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              تنظیمات دیتابیس Supabase
            </h4>

            <p className="text-xs text-slate-400 leading-relaxed">
              این پروژه قابلیت اتصال مستقیم به دیتابیس Supabase و خروجی روی Cloudflare / Next.js را دارد.
            </p>

            <button
              onClick={onOpenSupabaseModal}
              className="w-full flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-lg transition-colors border border-emerald-600 shadow-sm"
            >
              <span>مشاهده دستورات SQL برای Supabase</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="text-emerald-400 font-semibold">تضمین امنیت اطلاعات:</p>
              <p>تمام مدارک و اطلاعات ثبت شده به صورت امن ذخیره گردیده و جهت صدور بیمه‌نامه به کارشناسان ارسال می‌گردد.</p>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© تمامی حقوق مادی و معنوی برای بیمه ایران (نمایندگی گلزار کد ۳۰۹۶۲) محفوظ است.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>شماره مجوز: {IRAN_BIMEH_AGENCY.licenseNumber}</span>
            <span>طراحی بهینه برای موتورهای جستجو (SEO)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
