import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShieldCheck, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  PhoneCall, 
  MessageSquare, 
  Download, 
  ExternalLink,
  User,
  Car,
  Home,
  HeartPulse,
  Send,
  MapPin
} from 'lucide-react';
import { Inquiry, SmsLog, IRAN_BIMEH_AGENCY } from '../types';

interface TrackInquiryViewProps {
  initialSearchQuery?: string;
  onOpenNewInquiry: () => void;
}

export const TrackInquiryView: React.FC<TrackInquiryViewProps> = ({ 
  initialSearchQuery = '', 
  onOpenNewInquiry 
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialSearchQuery) {
      handleSearch(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const handleSearch = async (queryToUse?: string) => {
    const term = (queryToUse || searchQuery).trim();
    if (!term) return;

    setIsSearching(true);
    setErrorMsg('');
    setHasSearched(true);

    try {
      const res = await fetch(`/api/inquiries/track/${encodeURIComponent(term)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setInquiries(data.inquiries);
      } else {
        setInquiries([]);
        setErrorMsg(data.message || 'هیچ درخواستی با این مشخصات یافت نشد.');
      }

      // Also fetch SMS logs
      const smsRes = await fetch('/api/sms-logs');
      if (smsRes.ok) {
        const smsData = await smsRes.json();
        setSmsLogs(smsData.filter((s: SmsLog) => s.trackingCode.toLowerCase() === term.toLowerCase() || s.mobile === term));
      }
    } catch (err) {
      console.error('Track error:', err);
      setErrorMsg('خطا در برقراری ارتباط با سرور.');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusBadge = (status: Inquiry['status']) => {
    switch (status) {
      case 'pending':
        return { label: 'در انتظار بررسی', bg: 'bg-amber-100 text-amber-900 border-amber-300', icon: Clock };
      case 'in_progress':
        return { label: 'در حال کارشناسی و بررسی', bg: 'bg-blue-100 text-blue-900 border-blue-300', icon: Clock };
      case 'ready_for_issuance':
        return { label: 'آماده صدور و واریز وجه', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: ShieldCheck };
      case 'issued':
        return { label: 'صادر شده (تکمیل)', bg: 'bg-emerald-700 text-white border-emerald-800', icon: CheckCircle2 };
      case 'rejected':
        return { label: 'لغو / رد شده', bg: 'bg-rose-100 text-rose-900 border-rose-300', icon: AlertCircle };
      default:
        return { label: 'در حال بررسی', bg: 'bg-slate-100 text-slate-800 border-slate-300', icon: Clock };
    }
  };

  const getStatusStepIndex = (status: Inquiry['status']) => {
    switch (status) {
      case 'pending': return 1;
      case 'in_progress': return 2;
      case 'ready_for_issuance': return 3;
      case 'issued': return 4;
      default: return 1;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-800/60 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-900/80 border border-emerald-700 px-3 py-1 rounded-full text-xs text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>سامانه پیگیری آنلاین درخواست‌های بیمه ایران نمایندگی گلزار ۳۰۹۶۲</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            پیگیری آخرین وضعیت استعلام و صدور بیمه‌نامه
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            جهت اطلاع از مرحله کارشناسی، صدور یا دریافت فایل الکترونیکی بیمه‌نامه، کد پیگیری (مانند IR30962-84910)، شماره همراه یا کد ملی خود را وارد نمایید.
          </p>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-slate-200 space-y-4">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5" />
            <input 
              type="text" 
              placeholder="کد پیگیری (مثال: IR30962-84910) یا شماره موبایل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-sm font-medium bg-slate-50"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm rounded-xl shadow-md transition-colors shrink-0 flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <span>در حال جستجو...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>جستجوی وضعیت</span>
              </>
            )}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>کدهای نمونه جهت تست سریع:</span>
          <button 
            onClick={() => { setSearchQuery('IR30962-84910'); handleSearch('IR30962-84910'); }}
            className="bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 px-2.5 py-1 rounded-md font-mono font-bold border"
          >
            IR30962-84910
          </button>
          <button 
            onClick={() => { setSearchQuery('IR30962-62915'); handleSearch('IR30962-62915'); }}
            className="bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 px-2.5 py-1 rounded-md font-mono font-bold border"
          >
            IR30962-62915 (صادر شده)
          </button>
        </div>
      </div>

      {/* Error / Not Found message */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-medium">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results Section */}
      {inquiries.length > 0 && (
        <div className="space-y-6">
          {inquiries.map((inq) => {
            const statusInfo = getStatusBadge(inq.status);
            const StatusIcon = statusInfo.icon;
            const activeStep = getStatusStepIndex(inq.status);

            return (
              <div 
                key={inq.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-lg p-5 sm:p-8 space-y-6"
              >
                {/* Inquiry Top Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 font-medium">کد پیگیری درخواست:</span>
                    <h3 className="text-2xl font-black text-slate-900 dir-ltr text-right font-mono tracking-wider">
                      {inq.trackingCode}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${statusInfo.bg}`}>
                      <StatusIcon className="w-4 h-4" />
                      {statusInfo.label}
                    </span>

                    <span className="text-xs text-slate-400">
                      ثبت: {inq.createdAt}
                    </span>
                  </div>
                </div>

                {/* Progress Step Bar */}
                <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 mb-4">گام‌های صدور بیمه‌نامه:</h4>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs relative">
                    
                    {/* Step 1 */}
                    <div className="space-y-2 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold ${
                        activeStep >= 1 ? 'bg-emerald-700 text-white shadow' : 'bg-slate-200 text-slate-600'
                      }`}>
                        ۱
                      </div>
                      <span className={`font-semibold block text-[11px] ${activeStep >= 1 ? 'text-emerald-900 font-bold' : 'text-slate-500'}`}>
                        ثبت اولیه استعلام
                      </span>
                    </div>

                    {/* Step 2 */}
                    <div className="space-y-2 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold ${
                        activeStep >= 2 ? 'bg-emerald-700 text-white shadow' : 'bg-slate-200 text-slate-600'
                      }`}>
                        ۲
                      </div>
                      <span className={`font-semibold block text-[11px] ${activeStep >= 2 ? 'text-emerald-900 font-bold' : 'text-slate-500'}`}>
                        بررسی کارشناس
                      </span>
                    </div>

                    {/* Step 3 */}
                    <div className="space-y-2 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold ${
                        activeStep >= 3 ? 'bg-emerald-700 text-white shadow' : 'bg-slate-200 text-slate-600'
                      }`}>
                        ۳
                      </div>
                      <span className={`font-semibold block text-[11px] ${activeStep >= 3 ? 'text-emerald-900 font-bold' : 'text-slate-500'}`}>
                        آماده‌سازی صدور
                      </span>
                    </div>

                    {/* Step 4 */}
                    <div className="space-y-2 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold ${
                        activeStep >= 4 ? 'bg-emerald-700 text-white shadow' : 'bg-slate-200 text-slate-600'
                      }`}>
                        ۴
                      </div>
                      <span className={`font-semibold block text-[11px] ${activeStep >= 4 ? 'text-emerald-900 font-bold' : 'text-slate-500'}`}>
                        صدور و تحویل
                      </span>
                    </div>

                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  
                  {/* Customer & Vehicle Info */}
                  <div className="bg-slate-50 p-4 rounded-2xl border space-y-3">
                    <h5 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-emerald-700" />
                      مشخصات بیمه‌گذار و درخواست:
                    </h5>

                    <p><strong className="text-slate-600">نام کامل:</strong> {inq.fullName}</p>
                    <p><strong className="text-slate-600">کد ملی:</strong> {inq.nationalId}</p>
                    <p><strong className="text-slate-600">شماره همراه:</strong> {inq.mobile}</p>
                    <p><strong className="text-slate-600">استان / شهر:</strong> {inq.province} - {inq.city}</p>
                    {inq.address && <p><strong className="text-slate-600">آدرس تحویل:</strong> {inq.address}</p>}
                  </div>

                  {/* Form Data & Price */}
                  <div className="bg-slate-50 p-4 rounded-2xl border space-y-3">
                    <h5 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-700" />
                      جزئیات فنی بیمه‌نامه:
                    </h5>

                    {inq.formData.vehicleType && <p><strong className="text-slate-600">نوع خودرو:</strong> {inq.formData.vehicleType}</p>}
                    {inq.formData.modelYear && <p><strong className="text-slate-600">سال ساخت:</strong> {inq.formData.modelYear}</p>}
                    {inq.formData.plateNumber && <p><strong className="text-slate-600">پلاک:</strong> {inq.formData.plateNumber}</p>}
                    {inq.formData.noClaimDiscount && <p><strong className="text-slate-600">تخفیف سابقه:</strong> {inq.formData.noClaimDiscount}</p>}
                    {inq.formData.estimatedPriceTomans && (
                      <p className="pt-2 border-t font-bold text-emerald-800 text-sm">
                        حق بیمه تقریبی: {Number(inq.formData.estimatedPriceTomans).toLocaleString('fa-IR')} تومان
                      </p>
                    )}
                  </div>

                </div>

                {/* Expert Notes */}
                {inq.expertNotes && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs space-y-1">
                    <p className="font-bold text-amber-900 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-amber-700" />
                      یادداشت کارشناس نمایندگی گلزار:
                    </p>
                    <p className="text-slate-700 leading-relaxed">{inq.expertNotes}</p>
                  </div>
                )}

                {/* Download Issued Policy if Available */}
                {inq.status === 'issued' && inq.issuedPolicyUrl && (
                  <div className="p-4 bg-emerald-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-700 shadow-md">
                    <div className="space-y-1 text-center sm:text-right">
                      <h5 className="font-bold text-amber-300 text-sm">بیمه‌نامه شما با موفقیت صادر گردید!</h5>
                      <p className="text-xs text-emerald-200">
                        تاریخ صدور رسمی: {inq.issuedAt || '۱۴۰۳/۰۴/۰۶'} | نمایندگی گلزار کد ۳۰۹۶۲
                      </p>
                    </div>

                    <a
                      href={inq.issuedPolicyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow transition-colors flex items-center gap-2 shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>دانلود فایل بیمه‌نامه (PDF)</span>
                    </a>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* SMS Logs History */}
      {smsLogs.length > 0 && (
        <div className="bg-white rounded-2xl border p-5 space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-700" />
            تاریخچه پیامک‌های اطلاع‌رسانی ارسال شده به شما:
          </h4>

          <div className="space-y-2">
            {smsLogs.map((sms) => (
              <div key={sms.id} className="p-3 bg-slate-50 rounded-xl border text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span>سامانه پیامکی نمایندگی ({sms.provider})</span>
                  <span>{sms.sentAt}</span>
                </div>
                <p className="text-slate-800 font-medium leading-relaxed">{sms.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Contact & New Inquiry shortcut */}
      <div className="bg-slate-100 p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">نیاز به ثبت استعلام بیمه جدید دارید؟</h4>
          <p className="text-xs text-slate-600">استعلام آنلاین انواع بیمه‌نامه‌ها در نمایندگی گلزار ۳۰۹۶۲</p>
        </div>

        <button
          onClick={onOpenNewInquiry}
          className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition-colors shrink-0"
        >
          ثبت استعلام بیمه جدید
        </button>
      </div>

    </div>
  );
};
