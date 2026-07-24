import React, { useState } from 'react';
import { User, Lock, Key, Smartphone, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  initialMode: 'user' | 'admin';
  onClose: () => void;
  onUserLoginSuccess: (userInfo: { name: string; phone: string }) => void;
  onAdminLoginSuccess: () => void;
}

export default function AuthModal({
  initialMode,
  onClose,
  onUserLoginSuccess,
  onAdminLoginSuccess
}: AuthModalProps) {
  const [mode, setMode] = useState<'user' | 'admin'>(initialMode);
  
  // User login state
  const [userPhone, setUserPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  // Admin login state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');

  const handleUserSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPhone || userPhone.length < 10) {
      setErrorMsg('لطفاً شماره همراه ۱۱ رقمی معتبر وارد کنید.');
      return;
    }
    setErrorMsg('');
    setOtpSent(true);
  };

  const handleUserVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setErrorMsg('کد تایید ۴ رقمی را وارد کنید (نمونه: ۱۲۳۴).');
      return;
    }
    setErrorMsg('');
    onUserLoginSuccess({
      name: userName.trim() || 'بیمه‌گذار محترم',
      phone: userPhone,
    });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin credentials or quick login
    if (
      (adminUsername.toLowerCase() === 'admin' && adminPassword === 'admin') ||
      (adminUsername === '09123456789' && adminPassword === '123456') ||
      adminUsername === '4456'
    ) {
      setErrorMsg('');
      onAdminLoginSuccess();
    } else {
      setErrorMsg('نام کاربری یا رمز عبور مدیر اشتباه است. (راهنما: admin / admin)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg text-xs transition"
        >
          ✕
        </button>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setMode('user');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'user'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User size={15} />
            <span>ورود کاربران و مشتریان</span>
          </button>
          <button
            onClick={() => {
              setMode('admin');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck size={15} />
            <span>ورود مدیران نمایندگی</span>
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* USER LOGIN FORM */}
        {mode === 'user' && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-white">ورود به پنل بیمه‌گذار</h3>
              <p className="text-xs text-slate-400">مشاهده سوابق استعلام‌ها و پیگیری صدور بیمه‌نامه‌ها</p>
            </div>

            {!otpSent ? (
              <form onSubmit={handleUserSendOtp} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">نام و نام خانوادگی (اختیاری):</label>
                  <input
                    type="text"
                    placeholder="مثال: علی محمدی"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">شماره تلفن همراه:</label>
                  <div className="relative">
                    <Smartphone size={16} className="absolute right-3.5 top-3 text-slate-500" />
                    <input
                      type="tel"
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-3.5 py-2.5 text-slate-200 text-left font-mono focus:outline-none focus:border-blue-500"
                      dir="ltr"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  ارسال کد تایید پیامکی
                </button>
              </form>
            ) : (
              <form onSubmit={handleUserVerifyOtp} className="space-y-4 text-xs">
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 p-3 rounded-xl text-[11px] text-center">
                  کد تایید پیامکی به شماره <span className="font-mono font-bold">{userPhone}</span> ارسال شد.
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">کد تایید ۴ رقمی (کد تست: ۱۲۳۴):</label>
                  <input
                    type="text"
                    placeholder="۱۲۳۴"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl transition cursor-pointer"
                  >
                    اصلاح شماره
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    تایید و ورود به سیستم
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ADMIN LOGIN FORM */}
        {mode === 'admin' && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-white">ورود مدیران نمایندگی گلزار</h3>
              <p className="text-xs text-slate-400">کد نمایندگی ۴۴۵۶ - بیمه ایران</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">نام کاربری یا کد نمایندگی:</label>
                <div className="relative">
                  <User size={16} className="absolute right-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="admin"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">رمز عبور اختصاصی:</label>
                <div className="relative">
                  <Lock size={16} className="absolute right-3.5 top-3 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                💡 <span className="font-bold text-amber-300">راهنمای تست سریع:</span> می‌توانید با نام کاربری <span className="font-mono text-white">admin</span> و رمز <span className="font-mono text-white">admin</span> یا کلیک روی دکمه زیر به صورت مستقیم وارد شوید.
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                ورود به داشبورد مدیریتی
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminUsername('admin');
                  setAdminPassword('admin');
                  onAdminLoginSuccess();
                }}
                className="w-full bg-slate-800 hover:bg-slate-750 text-amber-300 font-bold py-2 rounded-xl text-xs transition border border-amber-500/20 cursor-pointer"
              >
                ⚡ ورود مستقیم مدیر نمونه (یک کلیک)
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
