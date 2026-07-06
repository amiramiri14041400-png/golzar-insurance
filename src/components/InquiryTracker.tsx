import React, { useState } from 'react';
import { 
  Search, 
  ShieldCheck, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  PhoneCall, 
  User, 
  Calendar, 
  Sparkles, 
  ExternalLink,
  ChevronLeft,
  RefreshCw,
  FileCheck,
  Building
} from 'lucide-react';
import { Inquiry, SmsLog, IRAN_BIMEH_AGENCY } from '../types';

interface InquiryTrackerProps {
  onBackToHome: () => void;
  initialQuery?: string;
}

export const InquiryTracker: React.FC<InquiryTrackerProps> = ({ onBackToHome, initialQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Inquiry[] | null>(null);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setErrorMsg('لطفاً کد پیگیری (مانند IR30962-84910) یا شماره موبایل خود را وارد کنید.');
      return;
    }

    setIsSearching(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/inquiries/track/${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      setIsSearching(false);

      if (data.success && data.inquiries) {
        setResults(data.inquiries);

        // Also fetch SMS logs
        const smsRes = await fetch('/api/sms-logs');
        const smsData = await smsRes.json();
        if (Array.isArray(smsData)) {
          setSmsLogs(smsData.filter((s: SmsLog) => 
            data.inquiries.some((inq: Inquiry) => inq.trackingCode === s.trackingCode)
          ));
        }
      } else {
        setResults([]);
        setErrorMsg(data.message || 'هیچ پرونده‌ای با این کد پیگیری یا شماره پیدا نشد.');
      }
    } catch (err) {
      setIsSearching(false);
      setErrorMsg('خطا در ارتباط با سرور. لطفاً دوباره تلاش نمایید.');
    }
  };

  const getStatusBadge = (status: Inquiry['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: 'در انتظار بررسی اولیه کارشناس',
          color: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: Clock
        };
      case 'in_progress':
        return {
          label: 'در حال کارشناسی و استعلام سوابق',
          color: 'bg-sky-100 text-sky-900 border-sky-300',
          icon: RefreshCw
        };
      case 'ready_for_issuance':
        return {
          label: 'تأیید شده / آماده صدور و واریز',
          color: 'bg-purple-100 text-purple-900 border-purple-300',
          icon: Sparkles
        };
      case 'issued':
        return {
          label: 'بیمه‌نامه صادر گردید (ارسال شد)',
          color: 'bg-emerald-100 text-emerald-950 border-emerald-400 font-bold',
          icon: CheckCircle2
        };
      case 'rejected':
        return {
          label: 'انصراف / لغو شده',
          color: 'bg-rose-100 text-rose-900 border-rose-300',
          icon: AlertTriangle
        };
      default:
        return {
          label: 'در حال بررسی',
          color: 'bg-slate-100 text-slate-800',
          icon: Clock
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 animate-fadeIn">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-800 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>بازگشت به صفحه اصلی</span>
        </button>

        <div className="text-left">
          <span className="bg-amber-100 text-amber-900 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-amber-300">
            نمایندگی گلزار کد ۳۰۹۶۲
          </span>
        </div>
      </div>

      {/* Tracker Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center font-black mx-auto shadow-lg text-lg">
            ۳۰۹۶۲
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">سامانه پیگیری آنلاین درخواست‌های بیمه</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            جهت اطلاع از آخرین وضعیت کارشناسی، استعلام قیمت، وضعیت صدور و پیامک‌های ارسالی، کد پیگیری یا شماره همراه خود را جستجو نمایید.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto pt-2">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 p-1.5 rounded-2xl">
              <Search className="w-5 h-5 text-amber-400 shrink-0 mr-2" />
              <input 
                type="text"
                placeholder="کد پیگیری (مثال: IR30962-84910) یا شماره همراه..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shrink-0 shadow"
              >
                {isSearching ? 'در حال جستجو...' : 'پیگیری'}
              </button>
            </div>
          </form>
        </div>

        {/* Search Error */}
        {errorMsg && (
          <div className="p-6 text-center text-rose-700 bg-rose-50 border-b border-rose-100 text-xs font-semibold flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Results Section */}
        {results && results.length > 0 && (
          <div className="p-6 sm:p-8 space-y-8 bg-slate-50">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center justify-between">
              <span>تعداد پرونده‌های یافت شده: {results.length} مورد</span>
              <span className="text-xs text-emerald-700 font-normal">بیمه ایران - دفتر گلزار کد ۳۰۹۶۲</span>
            </h2>

            {results.map((inquiry) => {
              const statusInfo = getStatusBadge(inquiry.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div key={inquiry.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                  
                  {/* Status Banner */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">کد پیگیری:</span>
                        <strong className="text-lg font-black font-mono text-emerald-800 dir-ltr">
                          {inquiry.trackingCode}
                        </strong>
                      </div>
                      <p className="text-xs text-slate-600 font-semibold">
                        متقاضی: {inquiry.fullName} | شماره تماس: {inquiry.mobile}
                      </p>
                    </div>

                    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span>{statusInfo.label}</span>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-slate-500 font-bold block border-b border-slate-200 pb-1">
                        جزئیات بیمه‌نامه
                      </span>
                      <p className="flex justify-between">
                        <span className="text-slate-600">نوع بیمه:</span>
                        <strong className="text-slate-900">
                          {inquiry.insuranceType === 'third_party' ? 'شخص ثالث خودرو' : inquiry.insuranceType === 'body' ? 'بیمه بدنه' : inquiry.insuranceType === 'fire' ? 'آتش‌سوزی' : 'درمان'}
                        </strong>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-600">تاریخ ثبت استعلام:</span>
                        <span className="font-medium text-slate-800">{inquiry.createdAt}</span>
                      </p>
                      {inquiry.formData?.estimatedPriceTomans && (
                        <p className="flex justify-between pt-1 border-t border-slate-200 text-emerald-800 font-bold">
                          <span>حق‌بیمه برآوردی:</span>
                          <span>{Number(inquiry.formData.estimatedPriceTomans).toLocaleString('fa-IR')} تومان</span>
                        </p>
                      )}
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 md:col-span-2">
                      <span className="text-slate-500 font-bold block border-b border-slate-200 pb-1">
                        توضیحات و گزارش کارشناس نمایندگی گلزار
                      </span>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {inquiry.expertNotes || 'پرونده شما در صف بررسی کارشناسی قرار دارد. پس از بررسی مدارک، با شما تماس گرفته می‌شود.'}
                      </p>

                      {inquiry.issuedPolicyUrl && (
                        <div className="pt-2">
                          <a 
                            href={inquiry.issuedPolicyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors"
                          >
                            <FileCheck className="w-4 h-4 text-amber-400" />
                            <span>دانلود نسخه الکترونیکی بیمه‌نامه صادره</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Documents Section */}
                  {inquiry.documents && inquiry.documents.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-bold text-slate-700 mb-2 block">مدارک ارسالی شما:</span>
                      <div className="flex flex-wrap gap-3">
                        {inquiry.documents.map(doc => (
                          <div key={doc.id} className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg border border-slate-200 text-xs">
                            <img src={doc.fileUrl} alt={doc.label} className="w-8 h-8 rounded object-cover" />
                            <span className="font-semibold text-slate-800">{doc.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SMS History Log */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تاریخچه اطلاع‌رسانی پیامکی (سامانه فراز اس‌ام‌اس نمایندگی):</span>
                    </span>

                    <div className="space-y-2">
                      {smsLogs.length > 0 ? (
                        smsLogs.map(sms => (
                          <div key={sms.id} className="bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl text-xs space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                              <span>ارسال شده به: {sms.mobile}</span>
                              <span>زمان: {sms.sentAt}</span>
                            </div>
                            <p className="text-slate-800 leading-relaxed font-medium">{sms.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-500">
                          پیامک ثبت اولیه درخواست به شماره {inquiry.mobile} ارسال شده است.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Emergency Contact Box */}
      <div className="bg-emerald-900 text-white p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-right">
          <h3 className="font-bold text-base">نیاز به پیگیری تلفنی مستقیم دارید؟</h3>
          <p className="text-xs text-emerald-200">
            کارشناسان نمایندگی گلزار (کد ۳۰۹۶۲) آماده پاسخگویی به سوالات شما هستند.
          </p>
        </div>

        <a
          href={`tel:${IRAN_BIMEH_AGENCY.phone1.replace(/-/g, '')}`}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl transition-all shrink-0 shadow flex items-center gap-2"
        >
          <PhoneCall className="w-4 h-4" />
          <span>تماس با {IRAN_BIMEH_AGENCY.phone1}</span>
        </a>
      </div>

    </div>
  );
};
