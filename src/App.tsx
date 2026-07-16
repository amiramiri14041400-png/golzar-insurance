import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { InsuranceFormModal } from './components/InsuranceFormModal';
import { InquiryTracker } from './components/InquiryTracker';
import { AdminPanel } from './components/AdminPanel';
import { UserDashboard } from './components/UserDashboard';
import { AuthModal } from './components/AuthModal';
import { SupabaseGuideModal } from './components/SupabaseGuideModal';
import { AiConsultantDrawer } from './components/AiConsultantDrawer';
import { Footer } from './components/Footer';
import { InsuranceType, IRAN_BIMEH_AGENCY, User } from './types';
import { 
  ShieldCheck, 
  Calculator, 
  Upload, 
  MessageSquare, 
  Clock, 
  PhoneCall, 
  CheckCircle2, 
  Car, 
  Home, 
  HeartPulse, 
  Award, 
  HelpCircle,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'track' | 'admin' | 'supabase' | 'user_dashboard'>('home');
  const [selectedInsuranceType, setSelectedInsuranceType] = useState<InsuranceType>('third_party');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [initialPremiumOverride, setInitialPremiumOverride] = useState<number | null>(null);
  const [prefilledFields, setPrefilledFields] = useState<any>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [searchTrackingQuery, setSearchTrackingQuery] = useState('');
  const [isConsultantOpen, setIsConsultantOpen] = useState(false);

  // Authentication States
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('golzar_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'user' | 'admin'>('user');

  const handleOpenForm = (type: InsuranceType) => {
    setSelectedInsuranceType(type);
    setInitialPremiumOverride(null);
    setPrefilledFields(null);
    setIsFormModalOpen(true);
  };

  const handleConfirmAndIssue = (type: InsuranceType, premium: number, args?: any) => {
    setSelectedInsuranceType(type);
    setInitialPremiumOverride(premium);
    setPrefilledFields(args);
    setIsFormModalOpen(true);
    setIsConsultantOpen(false);
  };

  const handleSuccessSubmitted = (trackingCode: string) => {
    setSearchTrackingQuery(trackingCode);
    setActiveTab('track');
  };

  const handleOpenLoginModal = (mode: 'user' | 'admin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('golzar_user', JSON.stringify(user));
    
    // Redirect to relevant panel
    if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('user_dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('golzar_user');
    setActiveTab('home');
  };

  const handleGoToDashboard = () => {
    if (!currentUser) return;
    if (currentUser.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('user_dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white dir-rtl">
      
      {/* Navbar Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenForm={handleOpenForm} 
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLoginModal={handleOpenLoginModal}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        
        {activeTab === 'home' && (
          <div className="space-y-16">
            
            {/* Hero Section */}
            <HeroSection 
              onOpenForm={handleOpenForm}
              onGoToTrack={() => setActiveTab('track')}
              currentUser={currentUser}
              onOpenLoginModal={handleOpenLoginModal}
              onGoToDashboard={handleGoToDashboard}
            />

            {/* Why Choose Iran Insurance Agency Golzar Code 30962 */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8">
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-10">
                
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
                    مزایای ویژه نمایندگی ۳۰۹۶۲ بیمه ایران
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    چرا بیمه خود را از نمایندگی گلزار خریداری کنیم؟
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    با بیش از یک دهه تجربه در ارائه انواع بیمه‌نامه‌های تخصصی، با تضمین اعمال بالاترین تخفیف‌های قانونی و کارشناسی دقیق.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Feature 1 */}
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-700 text-amber-300 flex items-center justify-center font-bold shadow">
                      <Calculator className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">محاسبه آنلاین حدود قیمت</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      همان‌جا در فرم استعلام، حق بیمه پرداختی خود را به همراه تخفیفات سابقه به صورت شفاف و لحظه‌ای مشاهده نمایید.
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold shadow">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">ارسال اسان مدارک</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      بارگذاری سریع تصویر روی کارت خودرو، بیمه‌نامه قبلی و کارت ملی بدون نیاز به مراجعه حضوری.
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center font-bold shadow">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">پیگیری و اطلاع پیامکی</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      صدور کد پیگیری اختصاصی و ارسال پیامک لحظه‌ای در تمام مراحل کارشناسی و صدور بیمه‌نامه.
                    </p>
                  </div>

                  {/* Feature 4 */}
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow">
                      <Award className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">تضمین اعتبار رسمی بیمه ایران</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      صدور مستقیم در سامانه اصلی شرکت سهامی بیمه ایران تحت کد نمایندگی رسمی ۳۰۹۶۲ (گلزار).
                    </p>
                  </div>

                </div>

              </div>
            </section>

            {/* Consultant & Agency Office Info Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8">
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 rounded-3xl p-8 sm:p-10 text-white shadow-2xl border border-emerald-700/50 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                <div className="lg:col-span-5 relative">
                  <div className="rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-xl">
                    <img 
                      src="/src/assets/images/agency_consultant_1783066039218.jpg" 
                      alt="کارشناس نمایندگی گلزار بیمه ایران کد ۳۰۹۶۲" 
                      referrerPolicy="no-referrer"
                      className="w-full h-64 object-cover object-center"
                    />
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 bg-emerald-900/80 border border-emerald-700 px-3 py-1 rounded-full text-xs text-amber-300 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>پاسخگویی حضوری و تلفنی</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    مشاوره تخصصی و تحویل بیمه‌نامه درب منزل یا محل کار
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    دفتر نمایندگی گلزار با امکان استعلام آنلاین و ارسال رایگان نسخه فیزیکی بیمه‌نامه در سراسر تهران و ارسال الکترونیکی معتبر به سراسر کشور خدمت‌رسانی می‌نماید.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold">
                    <button
                      onClick={() => handleOpenForm('third_party')}
                      className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm"
                    >
                      <span>شروع ثبت استعلام آنلاین</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <a
                      href={`tel:${IRAN_BIMEH_AGENCY.phone1.replace(/-/g, '')}`}
                      className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all flex items-center gap-2"
                    >
                      <PhoneCall className="w-4 h-4 text-amber-300" />
                      <span>تماس تلفنی: {IRAN_BIMEH_AGENCY.phone1}</span>
                    </a>
                  </div>
                </div>

              </div>
            </section>

            {/* FAQ Section */}
            <section className="max-w-4xl mx-auto px-4 sm:px-8 pb-8">
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-lg space-y-6">
                <div className="flex items-center gap-2 text-slate-900 border-b pb-4">
                  <HelpCircle className="w-6 h-6 text-emerald-700" />
                  <h3 className="text-xl font-bold">سوالات متداول استعلام و صدور بیمه ایران</h3>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  
                  <div className="p-4 bg-slate-50 rounded-2xl border space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">چگونه تخفیف‌های عدم خسارت بیمه قبلی منتقل می‌شود؟</h4>
                    <p className="text-slate-600">
                      با بارگذاری تصویر بیمه‌نامه قبلی یا کارت خودرو، کارشناسان نمایندگی گلزار سوابق شما را از سامانه بیمه مرکزی استعلام نموده و حداکثر تخفیف استحقاقی را روی بیمه‌نامه جدید اعمال می‌نمایند.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">آیا صدور بیمه‌نامه به صورت اقساطی امکان‌پذیر است؟</h4>
                    <p className="text-slate-600">
                      بله، در نمایندگی گلزار ۳۰۹۶۲ امکان صدور اقساطی بیمه شخص ثالث و بدنه با پیش‌پرداخت توافقی و بدون نیاز به ضامن فراهم می‌باشد.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">پیگیری وضعیت درخواست چگونه انجام می‌شود؟</h4>
                    <p className="text-slate-600">
                      پس از ثبت استعلام، یک کد پیگیری به همراه پیامک برای شما ارسال می‌گردد. با وارد کردن کد در بخش «پیگیری وضعیت» می‌توانید تمام مراحل کارشناسی و صادر شدن بیمه‌نامه را آنلاین مشاهده نمایید.
                    </p>
                  </div>

                </div>
              </div>
            </section>

          </div>
        )}

        {/* Track Inquiry Tab View */}
        {activeTab === 'track' && (
          <InquiryTracker 
            initialQuery={searchTrackingQuery}
            onBackToHome={() => setActiveTab('home')}
          />
        )}

        {/* Admin Panel Tab View */}
        {activeTab === 'admin' && (
          <AdminPanel 
            onOpenNewInquiry={() => handleOpenForm('third_party')}
          />
        )}

        {/* User Dashboard Tab View */}
        {activeTab === 'user_dashboard' && currentUser && (
          <UserDashboard 
            user={currentUser}
            onLogout={handleLogout}
            onOpenNewInquiry={() => handleOpenForm('third_party')}
          />
        )}

        {/* Supabase SQL Instructions Modal/View */}
        {activeTab === 'supabase' && (
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="bg-white p-6 rounded-3xl border shadow-xl">
              <button
                onClick={() => setIsSupabaseModalOpen(true)}
                className="w-full py-4 bg-emerald-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg hover:bg-emerald-800"
              >
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>باز کردن کامل پنجره راهنما و دستورات SQL دیتابیس Supabase</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Interactive Form Modal */}
      <InsuranceFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialType={selectedInsuranceType}
        onSuccessSubmit={handleSuccessSubmitted}
        initialPremiumOverride={initialPremiumOverride}
        prefilledFields={prefilledFields}
      />

      {/* Supabase Setup Modal */}
      <SupabaseGuideModal
        isOpen={isSupabaseModalOpen || activeTab === 'supabase'}
        onClose={() => {
          setIsSupabaseModalOpen(false);
          if (activeTab === 'supabase') setActiveTab('home');
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authModalMode}
      />

      {/* Floating AI Consultant Button */}
      {!isConsultantOpen && (
        <button
          onClick={() => setIsConsultantOpen(true)}
          className="fixed bottom-5 right-5 z-40 group relative bg-gradient-to-r from-emerald-800 to-slate-900 hover:from-emerald-700 hover:to-slate-800 text-white p-3.5 rounded-2xl shadow-2xl border-2 border-amber-400 flex items-center gap-2.5 transition-all duration-300 hover:scale-105"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow animate-pulse">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-amber-300">مشاور هوشمند بیمه</p>
            <p className="text-[10px] text-emerald-200">پاسخ آنلاین به سوالات بیمه</p>
          </div>
        </button>
      )}

      {/* AI Consultant Drawer */}
      <AiConsultantDrawer
        isOpen={isConsultantOpen}
        onClose={() => setIsConsultantOpen(false)}
        onConfirmAndIssue={handleConfirmAndIssue}
      />

      {/* Footer */}
      <Footer 
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

    </div>
  );
}
