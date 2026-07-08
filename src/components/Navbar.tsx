import React, { useState } from 'react';
import { 
  ShieldCheck, 
  PhoneCall, 
  Search, 
  UserCog, 
  FileText, 
  Car, 
  Home, 
  HeartPulse, 
  Clock, 
  Menu, 
  X,
  Sparkles,
  MapPin,
  User,
  LogOut,
  Lock
} from 'lucide-react';
import { IRAN_BIMEH_AGENCY, InsuranceType, User as UserType } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'track' | 'admin' | 'supabase' | 'user_dashboard';
  setActiveTab: (tab: 'home' | 'track' | 'admin' | 'supabase' | 'user_dashboard') => void;
  onOpenForm: (type: InsuranceType) => void;
  currentUser: UserType | null;
  onLogout: () => void;
  onOpenLoginModal: (mode: 'user' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenForm,
  currentUser,
  onLogout,
  onOpenLoginModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Bar with Agency Code & Phone */}
      <div className="bg-emerald-900 text-emerald-50 text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-700/50">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              کد نمایندگی: {IRAN_BIMEH_AGENCY.code} ({IRAN_BIMEH_AGENCY.name})
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-300">
              <MapPin className="w-3 h-3 text-emerald-400" />
              {IRAN_BIMEH_AGENCY.city} - {IRAN_BIMEH_AGENCY.agentName}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="hidden md:inline-flex items-center gap-1 text-emerald-200">
              <Clock className="w-3 h-3 text-emerald-400" />
              ساعات کاری: {IRAN_BIMEH_AGENCY.workingHours.split('|')[0]}
            </span>
            <a 
              href={`tel:${IRAN_BIMEH_AGENCY.phone1.replace(/-/g, '')}`} 
              className="flex items-center gap-1.5 font-bold text-amber-300 hover:text-amber-200 transition-colors bg-emerald-800/80 px-2 py-0.5 rounded"
            >
              <PhoneCall className="w-3 h-3 animate-pulse" />
              تماس مستقیم: {IRAN_BIMEH_AGENCY.phone1}
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4 text-right">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-11 h-11 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-black shadow-md shadow-emerald-900/20 group-hover:bg-emerald-800 transition-all duration-300">
            <span className="text-xl">ایران</span>
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[9px] font-extrabold px-1 py-0.2 rounded shadow-sm">
              ۳۰۹۶۲
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                بیمه ایران <span className="text-emerald-700">نمایندگی گلزار</span>
              </h1>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-300">
                کد ۳۰۹۶۲
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              سامانه استعلام آنلاین، ارسال مدارک و صدور فوری بیمه‌نامه
            </p>
          </div>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeTab === 'home' 
                ? 'bg-emerald-50 text-emerald-800 font-bold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            صفحه اصلی و استعلام
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
              activeTab === 'track' 
                ? 'bg-emerald-50 text-emerald-800 font-bold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-4 h-4 text-emerald-600" />
            پیگیری وضعیت درخواست
          </button>

          {currentUser && currentUser.role === 'user' && (
            <button
              onClick={() => setActiveTab('user_dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                activeTab === 'user_dashboard' 
                  ? 'bg-emerald-900 text-white font-black' 
                  : 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <User className="w-4 h-4 text-amber-400" />
              میز کاربری من
            </button>
          )}

          {currentUser && currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                activeTab === 'admin' 
                  ? 'bg-slate-900 text-white font-black' 
                  : 'bg-amber-100 text-amber-900 font-bold border border-amber-200 hover:bg-amber-200'
              }`}
            >
              <UserCog className="w-4 h-4 text-emerald-700" />
              داشبورد مدیریت
            </button>
          )}

          {/* Quick Shortcuts */}
          <button
            onClick={() => onOpenForm('third_party')}
            className="flex items-center gap-1 px-3 py-2 text-slate-650 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-lg transition-all"
          >
            <Car className="w-4 h-4 text-emerald-600 animate-bounce" />
            شخص ثالث
          </button>

          <button
            onClick={() => onOpenForm('body')}
            className="flex items-center gap-1 px-3 py-2 text-slate-650 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-lg transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            بیمه بدنه
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all border border-slate-200 text-xs ${
              activeTab === 'supabase'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            کدهای Supabase
          </button>
        </nav>

        {/* Action Button & Admin/User Link */}
        <div className="flex items-center gap-2">
          
          {currentUser ? (
            <div className="flex items-center gap-2">
              {/* User Greeting Block */}
              <div className="hidden sm:block text-right bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <p className="text-[10px] text-slate-400 font-bold">خوش آمدید</p>
                <p className="text-xs font-extrabold text-slate-900">{currentUser.fullName}</p>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-all"
                title="خروج از حساب کاربری"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {/* Login for Customers */}
              <button
                onClick={() => onOpenLoginModal('user')}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border border-emerald-500 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-all shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>ورود کاربران</span>
              </button>

              {/* Login for Admins */}
              <button
                onClick={() => onOpenLoginModal('admin')}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border border-slate-700 text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>ورود مدیران</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 text-sm font-medium animate-fadeIn text-right">
          <button
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className="w-full text-right py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-800 font-semibold"
          >
            صفحه اصلی و ثبت استعلام
          </button>

          <button
            onClick={() => { setActiveTab('track'); setMobileMenuOpen(false); }}
            className="w-full text-right py-2 px-3 rounded-lg hover:bg-slate-100 text-emerald-800 font-semibold flex items-center justify-between"
          >
            <span>پیگیری وضعیت با کد یا موبایل</span>
            <Search className="w-4 h-4 text-emerald-600" />
          </button>

          {currentUser && currentUser.role === 'user' && (
            <button
              onClick={() => { setActiveTab('user_dashboard'); setMobileMenuOpen(false); }}
              className="w-full text-right py-2 px-3 rounded-lg bg-emerald-850 text-white font-extrabold flex items-center justify-between"
            >
              <span>میز کاربری من</span>
              <User className="w-4 h-4 text-amber-400" />
            </button>
          )}

          {currentUser && currentUser.role === 'admin' && (
            <button
              onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
              className="w-full text-right py-2 px-3 rounded-lg bg-slate-900 text-white font-extrabold flex items-center justify-between"
            >
              <span>پنل مدیریت کارشناس</span>
              <UserCog className="w-4 h-4 text-emerald-400" />
            </button>
          )}

          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 px-3 mb-1">انواع استعلام فوری:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => { onOpenForm('third_party'); setMobileMenuOpen(false); }} 
                className="p-2 rounded bg-slate-50 text-right hover:bg-emerald-50 text-slate-700 font-medium"
              >
                بیمه شخص ثالث
              </button>
              <button 
                onClick={() => { onOpenForm('body'); setMobileMenuOpen(false); }} 
                className="p-2 rounded bg-slate-50 text-right hover:bg-emerald-50 text-slate-700 font-medium"
              >
                بیمه بدنه خودرو
              </button>
              <button 
                onClick={() => { onOpenForm('fire'); setMobileMenuOpen(false); }} 
                className="p-2 rounded bg-slate-50 text-right hover:bg-emerald-50 text-slate-700 font-medium"
              >
                بیمه آتش‌سوزی
              </button>
            </div>
          </div>

          {!currentUser && (
            <div className="pt-3 border-t grid grid-cols-2 gap-2">
              <button
                onClick={() => { onOpenLoginModal('user'); setMobileMenuOpen(false); }}
                className="py-2.5 px-3 rounded-lg border border-emerald-500 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-center"
              >
                ورود کاربران
              </button>
              <button
                onClick={() => { onOpenLoginModal('admin'); setMobileMenuOpen(false); }}
                className="py-2.5 px-3 rounded-lg border border-slate-700 text-white bg-slate-900 hover:bg-slate-800 text-xs font-bold text-center"
              >
                ورود مدیران
              </button>
            </div>
          )}

          <button
            onClick={() => { setActiveTab('supabase'); setMobileMenuOpen(false); }}
            className="w-full text-right py-2 px-3 rounded-lg border border-slate-200 text-xs font-bold flex items-center justify-between mt-2 text-slate-600"
          >
            <span>کد SQL و راهنمای Supabase</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      )}
    </header>
  );
};
