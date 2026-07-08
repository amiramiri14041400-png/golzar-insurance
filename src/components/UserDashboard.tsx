import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  Search, 
  LogOut, 
  ExternalLink,
  ChevronLeft,
  Briefcase,
  TrendingUp,
  ShieldAlert,
  Download
} from 'lucide-react';
import { User, Inquiry, InquiryStatus } from '../types';

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
  onOpenNewInquiry: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ 
  user, 
  onLogout, 
  onOpenNewInquiry 
}) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchMyInquiries = async () => {
    setLoading(true);
    try {
      const url = `/api/my-inquiries?mobile=${encodeURIComponent(user.mobile)}` + 
        (user.nationalId ? `&nationalId=${encodeURIComponent(user.nationalId)}` : '');
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
    } catch (err) {
      console.error('Error fetching user inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyInquiries();
  }, [user.mobile, user.nationalId]);

  // Calculations
  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'pending').length,
    inProgress: inquiries.filter(i => i.status === 'in_progress').length,
    issued: inquiries.filter(i => i.status === 'issued').length,
    ready: inquiries.filter(i => i.status === 'ready_for_issuance').length
  };

  const filteredInquiries = inquiries.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = 
      item.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.expertNotes && item.expertNotes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case 'pending': return { label: 'در انتظار بررسی', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'in_progress': return { label: 'در حال کارشناسی', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'ready_for_issuance': return { label: 'آماده صدور (واریز وجه)', color: 'bg-teal-100 text-teal-900 border-teal-300' };
      case 'issued': return { label: 'صادر شده', color: 'bg-emerald-700 text-white border-emerald-800' };
      case 'rejected': return { label: 'لغو / رد شده', color: 'bg-rose-100 text-rose-900 border-rose-300' };
      default: return { label: status, color: 'bg-slate-100 text-slate-800' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn text-right dir-rtl">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-emerald-800 px-3 py-1 rounded-full text-xs text-amber-300 font-bold">
            <UserIcon className="w-4 h-4" />
            <span>پروفایل کاربری تأیید شده</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            جناب آقای/سرکار خانم <span className="text-amber-300">{user.fullName}</span>، خوش آمدید
          </h2>
          <p className="text-xs text-slate-300">
            در این بخش می‌توانید استعلام‌های ثبت‌شده خود را مدیریت و پیگیری نموده و فایل بیمه‌نامه صادر شده را دانلود نمایید.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={fetchMyInquiries}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/15 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>بروزرسانی وضعیت</span>
          </button>

          <button
            onClick={onOpenNewInquiry}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-amber-400/15"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>ثبت درخواست استعلام جدید</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-2.5 bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 rounded-xl border border-rose-800/60 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* User Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">کل درخواست‌ها</span>
            <span className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <FileText className="w-4.5 h-4.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          <div className="text-[10px] text-slate-400 font-bold">بیمه‌نامه‌های استعلامی شما</div>
        </div>

        {/* Pending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">در انتظار بررسی</span>
            <span className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <Clock className="w-4.5 h-4.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.pending}</p>
          <div className="text-[10px] text-amber-700 font-bold">نیاز به تایید کارشناس</div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">در حال کارشناسی</span>
            <span className="p-2 bg-blue-50 rounded-lg text-blue-700">
              <TrendingUp className="w-4.5 h-4.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.inProgress}</p>
          <div className="text-[10px] text-blue-700 font-bold">استعلام از سیستم جامع</div>
        </div>

        {/* Ready for Pay */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">آماده صدور</span>
            <span className="p-2 bg-teal-50 rounded-lg text-teal-700">
              <AlertCircle className="w-4.5 h-4.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.ready}</p>
          <div className="text-[10px] text-teal-700 font-bold">منتظر واریز حق‌بیمه</div>
        </div>

        {/* Issued */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 md:col-span-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">صادر شده و نهایی</span>
            <span className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-800">{stats.issued}</p>
          <div className="text-[10px] text-emerald-700 font-bold">بیمه‌نامه معتبر فعال</div>
        </div>

      </div>

      {/* Grid: Profile Info & Inquiries List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Right Side: Profile Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-5">
          <h3 className="font-extrabold text-sm text-slate-900 pb-3 border-b border-slate-100">
            مشخصات پروفایل شما
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
              <span className="text-slate-500 font-bold">نام و نام خانوادگی:</span>
              <span className="text-slate-900 font-black">{user.fullName}</span>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
              <span className="text-slate-500 font-bold">شماره همراه:</span>
              <span className="text-slate-900 font-mono font-bold">{user.mobile}</span>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
              <span className="text-slate-500 font-bold">آدرس ایمیل:</span>
              <span className="text-slate-900 font-mono text-[11px]">{user.email}</span>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
              <span className="text-slate-500 font-bold">کد ملی ده رقمی:</span>
              <span className="text-slate-900 font-mono font-bold">{user.nationalId || 'ثبت نشده'}</span>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
              <span className="text-slate-500 font-bold">عضویت از تاریخ:</span>
              <span className="text-slate-600 font-medium">{user.createdAt.split(' - ')[0]}</span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4" />
              تضمین امنیت و صحت اسناد
            </h4>
            <p className="text-[10px] text-emerald-800 leading-relaxed font-medium">
              تمامی اطلاعات و مدارک آپلودشده توسط شما در سرورهای امن نمایندگی گلزار بیمه ایران محفوظ بوده و به صورت مستقیم جهت استعلام سوابق و صدور در وب‌سرویس مرکزی سنهاب بیمه مرکزی ارسال می‌گردد.
            </p>
          </div>
        </div>

        {/* Left Side: inquiries table/list */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          
          {/* Header & Filters */}
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-slate-900">
                لیست استعلام‌ها و بیمه‌نامه‌های من
              </h3>
              <p className="text-[11px] text-slate-500">
                درخواست‌های استعلام و سوابق بیمه‌نامه‌های صادر شده شما در نمایندگی گلزار
              </p>
            </div>

            {/* Quick search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="جستجو با کد پیگیری..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-8 pl-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:border-emerald-600 outline-none w-full md:w-52"
              />
            </div>
          </div>

          {/* Quick status filter buttons */}
          <div className="px-5 py-3 border-b flex items-center gap-2 overflow-x-auto text-[11px] font-bold bg-white">
            <span className="text-slate-400 whitespace-nowrap ml-1">فیلتر وضعیت:</span>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterStatus === 'all' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              همه ({inquiries.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterStatus === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-950 hover:bg-amber-100'
              }`}
            >
              در انتظار بررسی ({stats.pending})
            </button>
            <button
              onClick={() => setFilterStatus('in_progress')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterStatus === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-950 hover:bg-blue-100'
              }`}
            >
              کارشناسی ({stats.inProgress})
            </button>
            <button
              onClick={() => setFilterStatus('issued')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterStatus === 'issued' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-950 hover:bg-emerald-100'
              }`}
            >
              صادر شده ({stats.issued})
            </button>
          </div>

          {/* List or Loader */}
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-700" />
              <span>در حال بارگذاری اطلاعات استعلام‌های شما...</span>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs space-y-4">
              <p>هیچ درخواست استعلامی در این وضعیت یا با این کد پیگیری پیدا نشد.</p>
              <button
                onClick={onOpenNewInquiry}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                ثبت اولین استعلام
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredInquiries.map((inq) => {
                const badge = getStatusBadge(inq.status);
                return (
                  <div key={inq.id} className="p-5 hover:bg-slate-50/50 transition-colors space-y-3.5">
                    
                    {/* Top Row: Type and code */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span className="font-extrabold text-slate-800 text-sm">
                          {inq.insuranceType === 'third_party' ? 'بیمه شخص ثالث خودرو' :
                           inq.insuranceType === 'body' ? 'بیمه بدنه خودرو' :
                           inq.insuranceType === 'fire' ? 'بیمه آتش‌سوزی و زلزله' :
                           inq.insuranceType === 'health' ? 'بیمه درمان تکمیلی' : inq.insuranceType}
                        </span>
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-mono dir-ltr">
                          {inq.trackingCode}
                        </span>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border text-[11px] font-medium text-slate-600">
                      <div>
                        <span>تاریخ ثبت:</span>
                        <span className="text-slate-900 block font-bold pt-0.5">{inq.createdAt.split(' - ')[0]}</span>
                      </div>
                      <div>
                        <span>پلاک یا مشخصات:</span>
                        <span className="text-slate-900 block font-bold pt-0.5 font-mono">{inq.formData?.plateNumber || inq.formData?.vehicleType || 'کارشناسی عمومی'}</span>
                      </div>
                      <div>
                        <span>استان/شهر:</span>
                        <span className="text-slate-900 block font-bold pt-0.5">{inq.province} / {inq.city}</span>
                      </div>
                      <div>
                        <span>کدملی متقاضی:</span>
                        <span className="text-slate-900 block font-bold pt-0.5 font-mono">{inq.nationalId}</span>
                      </div>
                    </div>

                    {/* Expert notes if exists */}
                    {inq.expertNotes && (
                      <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-[11px] text-emerald-950 space-y-1">
                        <strong className="text-emerald-800 font-bold block">💬 یادداشت کارشناس رسمی نمایندگی:</strong>
                        <p className="leading-relaxed font-medium">{inq.expertNotes}</p>
                      </div>
                    )}

                    {/* Actions and direct download button */}
                    <div className="flex justify-between items-center pt-1.5 text-xs">
                      <span className="text-slate-400 font-bold text-[10px]">
                        آخرین تغییرات: {inq.updatedAt}
                      </span>

                      <div className="flex gap-2">
                        {inq.status === 'issued' && inq.issuedPolicyUrl && (
                          <a
                            href={inq.issuedPolicyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-lg text-xs shadow flex items-center gap-1.5 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>دانلود بیمه‌نامه صادر شده</span>
                          </a>
                        )}

                        {inq.status === 'ready_for_issuance' && (
                          <button
                            onClick={() => alert(`مشتری گرامی، جهت فعال‌سازی نهایی بیمه‌نامه با کد پیگیری ${inq.trackingCode}، همکاران ما تا دقایقی دیگر جهت صدور فاکتور و واریز حق بیمه با شما تماس خواهند گرفت.`)}
                            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-lg text-xs shadow flex items-center gap-1 transition-colors animate-pulse"
                          >
                            <span>پرداخت حق‌بیمه آنلاین</span>
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
