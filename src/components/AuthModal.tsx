import React, { useState } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  FileText, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
  initialMode?: 'user' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onLoginSuccess,
  initialMode = 'user'
}) => {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>(initialMode);
  const [isRegister, setIsRegister] = useState(false);
  
  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [nationalId, setNationalId] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: activeTab === 'admin' ? username : email,
          password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطایی در ورود به سیستم رخ داد.');
      }

      setSuccessMsg('خوش آمدید! ورود با موفقیت انجام شد.');
      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
        // Reset
        setUsername('');
        setPassword('');
        setEmail('');
        setFullName('');
        setMobile('');
        setNationalId('');
        setErrorMsg('');
        setSuccessMsg('');
      }, 1200);

    } catch (err: any) {
      setErrorMsg(err.message || 'نام کاربری یا رمز عبور اشتباه است.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          mobile,
          nationalId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطایی در ثبت‌نام رخ داد.');
      }

      setSuccessMsg('ثبت‌نام شما با موفقیت انجام شد. در حال ورود به پنل کاربری...');
      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
        // Reset
        setEmail('');
        setPassword('');
        setFullName('');
        setMobile('');
        setNationalId('');
        setErrorMsg('');
        setSuccessMsg('');
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در انجام ثبت‌نام. لطفاً فیلدها را مجدداً بررسی کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-fadeIn text-slate-800">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">ورود به سامانه هوشمند نمایندگی گلزار</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b text-xs font-bold bg-slate-50">
          <button
            onClick={() => {
              setActiveTab('user');
              setIsRegister(false);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-3.5 text-center transition-all ${
              activeTab === 'user'
                ? 'border-b-2 border-emerald-700 text-emerald-800 bg-white font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ورود و ثبت‌نام کاربران
          </button>
          <button
            onClick={() => {
              setActiveTab('admin');
              setIsRegister(false);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-3.5 text-center transition-all ${
              activeTab === 'admin'
                ? 'border-b-2 border-emerald-700 text-emerald-800 bg-white font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            پنل کارشناسان و مدیریت
          </button>
        </div>

        {/* Modal Form Container */}
        <div className="p-6 space-y-5">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs font-medium leading-relaxed">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold leading-relaxed flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Admin Login Form */}
          {activeTab === 'admin' && (
            <form onSubmit={handleLogin} className="space-y-4 text-right">
              <div className="text-center bg-amber-50 border border-amber-300 p-2.5 rounded-xl mb-2">
                <p className="text-[11px] text-amber-900 font-bold leading-relaxed">
                  🔑 کاربری مدیریت سیستم: <code className="bg-amber-200 px-1 py-0.5 rounded text-xs font-mono">sadegh</code> با رمز <code className="bg-amber-200 px-1 py-0.5 rounded text-xs font-mono">123456</code>
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">نام کاربری یا کدملی:</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="مثال: sadegh"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">رمز عبور:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="رمز عبور ۶ رقمی مدیریت"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'در حال ورود...' : 'ورود کارشناس به سیستم'}
              </button>
            </form>
          )}

          {/* User Login or Signup */}
          {activeTab === 'user' && !isRegister && (
            <form onSubmit={handleLogin} className="space-y-4 text-right">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">آدرس ایمیل:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 outline-none dir-ltr text-right"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">رمز عبور:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="رمز عبور شما"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'در حال ورود...' : 'ورود کاربران'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-xs text-emerald-800 font-bold hover:underline"
                >
                  حساب کاربری ندارید؟ برای ثبت نام کلیک کنید
                </button>
              </div>
            </form>
          )}

          {activeTab === 'user' && isRegister && (
            <form onSubmit={handleRegister} className="space-y-3.5 text-right">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">نام و نام خانوادگی متقاضی <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="مثال: امیر امیری"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">شماره موبایل فعال <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="مثال: 09121112233"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">کد ملی ده رقمی <span className="text-slate-400 text-[10px]">(اختیاری)</span></label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="مثال: 0078912345"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">آدرس ایمیل جهت ورود <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 outline-none dir-ltr text-right"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">تعیین رمز عبور <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="رمز عبور مطمئن"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-850 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'در حال ثبت‌نام...' : 'تکمیل عضویت و ورود مستقیم'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-xs text-emerald-800 font-bold hover:underline"
                >
                  قبلاً عضو شده‌اید؟ بازگشت به فرم ورود
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t text-center text-[11px] text-slate-500 font-medium">
          نمایندگی ۳۰۹۶۲ گلزار، تحت نظارت مستقیم شرکت سهامی بیمه ایران
        </div>

      </div>
    </div>
  );
};
