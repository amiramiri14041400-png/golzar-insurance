import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  X, 
  PhoneCall, 
  ShieldCheck, 
  RefreshCw,
  Upload,
  Trash2,
  FileText,
  Check,
  AlertCircle,
  Copy
} from 'lucide-react';
import { IRAN_BIMEH_AGENCY, UploadedDocument, InsuranceType } from '../types';
import { 
  calculateThirdPartyPremium, 
  calculateBodyPremium, 
  calculateFirePremium, 
  calculateHealthPremium,
  calculateLiabilityPremium 
} from '../utils/calculator';

interface AiConsultantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAndIssue?: (type: InsuranceType, premium: number, args?: any) => void;
}

export const AiConsultantDrawer: React.FC<AiConsultantDrawerProps> = ({ isOpen, onClose, onConfirmAndIssue }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ 
    sender: 'user' | 'ai'; 
    text: string; 
    calculation?: {
      type: InsuranceType;
      basePremium: number;
      discountAmount: number;
      finalPremium: number;
      args: any;
    };
  }>>([
    {
      sender: 'ai',
      text: 'سلام! من مشاور هوشمند بیمه ایران (نمایندگی گلزار کد ۳۰۹۶۲) هستم. هر سوالی در مورد نرخ تخفیف‌ها، پوشش مالی شخص ثالث، شرایط بیمه بدنه یا مراحل دریافت خسارت دارید بپرسید تا راهنماییتون کنم. همچنین برای صدور سریع می‌توانید عکس مدارک خودرو یا بیمه‌نامه قبلی خود را همینجا بارگذاری نمایید.'
    }
  ]);
  const [loading, setLoading] = useState(false);

  // Document Upload States
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [activeCalculation, setActiveCalculation] = useState<{
    type: InsuranceType;
    basePremium: number;
    discountAmount: number;
    finalPremium: number;
    args: any;
  } | null>(null);

  // Inquiry Submission Form States
  const [formFullName, setFormFullName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formNationalId, setFormNationalId] = useState('');
  const [formInsuranceType, setFormInsuranceType] = useState<InsuranceType>('third_party');
  const [formError, setFormError] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [successTrackingCode, setSuccessTrackingCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // New detailed parameters for 1405 Bimeh Iran laws
  const [vehicleNoClaimThirdParty, setVehicleNoClaimThirdParty] = useState<number>(0);
  const [vehicleNoClaimBody, setVehicleNoClaimBody] = useState<number>(0);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [jobRiskGroup, setJobRiskGroup] = useState<number>(1);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'installments'>('cash');
  const [installmentCount, setInstallmentCount] = useState<number>(4);
  const [isJaamZarrin, setIsJaamZarrin] = useState<boolean>(false);
  const [goldValue, setGoldValue] = useState<number>(0);
  const [isSamaZarrin, setIsSamaZarrin] = useState<boolean>(false);
  const [liabilityType, setLiabilityType] = useState<'employer' | 'civil' | 'professional'>('civil');
  const [liabilityStaffCount, setLiabilityStaffCount] = useState<number>(1);
  const [liabilityCoverageLimit, setLiabilityCoverageLimit] = useState<number>(1200000000);

  // Dynamic on-the-fly calculation for ultra-responsive feedback
  const liveCalculationResult = React.useMemo(() => {
    try {
      if (formInsuranceType === 'third_party') {
        return calculateThirdPartyPremium({
          vehicleType: 'passenger_4cyl',
          modelYear: 1405,
          noClaimDiscountYears: vehicleNoClaimThirdParty,
          driverDiscountYears: 0,
          financialLimit: 100000000,
          previousCompany: 'بیمه ایران',
          hasDamageHistory: false,
          paymentMode,
          installmentCount
        });
      } else if (formInsuranceType === 'body') {
        return calculateBodyPremium({
          vehicleType: 'passenger_4cyl',
          vehicleValueTomans: 500000000,
          modelYear: 1405,
          noClaimYears: vehicleNoClaimBody,
          coverGlass: true,
          coverNaturalDisasters: true,
          coverChemicals: false,
          coverPriceFluctuation: false,
          paymentMode,
          installmentCount
        });
      } else if (formInsuranceType === 'fire') {
        return calculateFirePremium({
          propertyType: 'residential',
          buildingValueTomans: 1000000000,
          appliancesValueTomans: 250000000,
          areaSizeSqm: 100,
          coverEarthquake: true,
          coverPipeBurst: true,
          coverFlood: false,
          isJaamZarrin,
          goldAssetValueTomans: goldValue,
          paymentMode,
          installmentCount
        });
      } else if (formInsuranceType === 'health') {
        return calculateHealthPremium({
          planType: 'standard',
          ageCategory: '40_to_60',
          personCount: 1,
          hasDental: true,
          isSamaZarrin,
          occupation: jobTitle || 'آزاد',
          jobRiskCategory: jobRiskGroup,
          paymentMode,
          installmentCount
        });
      } else if (formInsuranceType === 'liability') {
        return calculateLiabilityPremium({
          liabilityType,
          staffCount: liabilityStaffCount,
          occupation: jobTitle || 'آزاد',
          jobRiskCategory: jobRiskGroup,
          coverageLimitTomans: liabilityCoverageLimit,
          paymentMode,
          installmentCount
        });
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }, [
    formInsuranceType, 
    vehicleNoClaimThirdParty, 
    vehicleNoClaimBody, 
    jobTitle, 
    jobRiskGroup, 
    paymentMode, 
    installmentCount, 
    isJaamZarrin, 
    goldValue, 
    isSamaZarrin, 
    liabilityType, 
    liabilityStaffCount, 
    liabilityCoverageLimit
  ]);

  // Auto pre-populate user details from local storage on mount/open
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('golzar_user');
        if (saved) {
          const user = JSON.parse(saved);
          setFormFullName(user.fullName || '');
          setFormMobile(user.mobile || '');
          setFormNationalId(user.nationalId || '');
        }
      } catch (e) {
        // Ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmAndIssue = (calc: any) => {
    if (onConfirmAndIssue) {
      onConfirmAndIssue(calc.type, calc.finalPremium, calc.args);
      return;
    }

    setActiveCalculation(calc);
    setFormInsuranceType(calc.type);
    setSuccessTrackingCode(null);
    setShowInquiryForm(true);

    // Set matching sub-parameters from active calculation
    if (calc && calc.args) {
      const args = calc.args;
      if (calc.type === 'third_party') {
        if (args.noClaimDiscountYears !== undefined) setVehicleNoClaimThirdParty(Number(args.noClaimDiscountYears));
        if (args.paymentMode) setPaymentMode(args.paymentMode);
        if (args.installmentCount) setInstallmentCount(Number(args.installmentCount));
      } else if (calc.type === 'body') {
        if (args.noClaimYears !== undefined) setVehicleNoClaimBody(Number(args.noClaimYears));
        if (args.paymentMode) setPaymentMode(args.paymentMode);
        if (args.installmentCount) setInstallmentCount(Number(args.installmentCount));
      } else if (calc.type === 'fire') {
        if (args.isJaamZarrin !== undefined) setIsJaamZarrin(!!args.isJaamZarrin);
        if (args.goldAssetValueTomans !== undefined) setGoldValue(Number(args.goldAssetValueTomans));
        if (args.paymentMode) setPaymentMode(args.paymentMode);
        if (args.installmentCount) setInstallmentCount(Number(args.installmentCount));
      } else if (calc.type === 'health') {
        if (args.isSamaZarrin !== undefined) setIsSamaZarrin(!!args.isSamaZarrin);
        if (args.occupation) setJobTitle(args.occupation);
        if (args.jobRiskCategory !== undefined) setJobRiskGroup(Number(args.jobRiskCategory));
        if (args.paymentMode) setPaymentMode(args.paymentMode);
        if (args.installmentCount) setInstallmentCount(Number(args.installmentCount));
      } else if (calc.type === 'liability') {
        if (args.liabilityType) setLiabilityType(args.liabilityType);
        if (args.staffCount !== undefined) setLiabilityStaffCount(Number(args.staffCount));
        if (args.occupation) setJobTitle(args.occupation);
        if (args.jobRiskCategory !== undefined) setJobRiskGroup(Number(args.jobRiskCategory));
        if (args.paymentMode) setPaymentMode(args.paymentMode);
        if (args.installmentCount) setInstallmentCount(Number(args.installmentCount));
      }
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() && documents.length === 0 || loading) return;

    let userText = prompt.trim();
    const uploadedDocsCopy = [...documents];

    // If user sent a document but wrote no message
    if (!userText && uploadedDocsCopy.length > 0) {
      userText = `بارگذاری مدارک: ${uploadedDocsCopy.map(d => d.label).join('، ')}`;
    }

    setPrompt('');
    setMessages(prev => [...prev, { 
      sender: 'user', 
      text: userText + (uploadedDocsCopy.length > 0 ? ` [ضمیمه: ${uploadedDocsCopy.length} مدرک]` : '') 
    }]);
    setLoading(true);

    try {
      // Append details of uploaded files to prompt so Gemini is fully aware
      let fullPrompt = userText;
      if (uploadedDocsCopy.length > 0) {
        fullPrompt += `\n\n[کاربر مدارک زیر را در چت پیوست کرده است:\n${uploadedDocsCopy.map((d, i) => `${i + 1}. نام فایل: ${d.fileName} - نوع مدرک: ${d.label}`).join('\n')}\nلطفاً تایید کن مدارکشون رو گرفتی و بهشون حدود قیمت رو با خوشرویی بگو. همچنین بهشون بگو می‌تونن روی دکمه «ثبت رسمی درخواست و صدور» کلیک کنند تا بلافاصله بیمه‌نامه توسط ما پیگیری و صادر بشه.]`;
      }

      const res = await fetch('/api/ai-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt })
      });

      const data = await res.json();
      setLoading(false);
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: data.response || 'پاسخی دریافت نشد.',
        calculation: data.calculation || undefined
      }]);
    } catch (err) {
      setLoading(false);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: 'در حال حاضر ارتباط با دستیار هوشمند قطع است. لطفاً مستقیماً با کارشناسان نمایندگی گلزار تماس بگیرید: ۰۲۱-۸۸۹۹۰۰۱۱'
      }]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const file = files[0];

    const reader = new FileReader();
    reader.onload = () => {
      let label = 'مدرک ارسالی';
      let docType: UploadedDocument['type'] = 'other';

      const fileNameLower = file.name.toLowerCase();
      if (fileNameLower.includes('kart') || fileNameLower.includes('کارت') || fileNameLower.includes('car')) {
        label = 'تصویر کارت خودرو';
        docType = 'car_card_front';
      } else if (fileNameLower.includes('bimeh') || fileNameLower.includes('بیمه') || fileNameLower.includes('policy')) {
        label = 'بیمه‌نامه سال قبل';
        docType = 'prev_policy';
      } else if (fileNameLower.includes('melli') || fileNameLower.includes('ملی') || fileNameLower.includes('national') || fileNameLower.includes('id')) {
        label = 'کارت ملی بیمه‌گذار';
        docType = 'national_card';
      }

      const newDoc: UploadedDocument = {
        id: `doc-${Date.now()}`,
        type: docType,
        label,
        fileName: file.name,
        fileUrl: reader.result as string,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        uploadedAt: 'هم‌اکنون'
      };

      setDocuments(prev => [...prev, newDoc]);
      setUploading(false);

      // Add assistant message to guide the user
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: `📎 مدرک «${label}» با موفقیت به گفتگو پیوست شد. لطفاً سوال خود را بنویسید و دکمه ارسال را بزنید تا قیمت تقریبی را محاسبه کنم، یا برای ثبت رسمی و دریافت کدرهگیری صدور، از دکمه «ثبت رسمی درخواست و صدور» استفاده کنید.`
      }]);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formFullName.trim() || !formMobile.trim() || !formNationalId.trim()) {
      setFormError('وارد کردن نام، کدملی و شماره همراه الزامی است.');
      return;
    }

    if (formMobile.length < 10) {
      setFormError('شماره همراه وارد شده صحیح نیست.');
      return;
    }

    setSubmittingInquiry(true);

    const calculationDetails = liveCalculationResult ? {
      type: formInsuranceType,
      basePremium: (liveCalculationResult as any).baseTariff || (liveCalculationResult as any).basePremium || (liveCalculationResult as any).yearlyTotalBeforeTax || 0,
      discountAmount: (liveCalculationResult as any).discountAmount || (liveCalculationResult as any).zarrinTheftFee || 0,
      finalPremium: (liveCalculationResult as any).finalPremium || 0,
      args: {
        paymentMode,
        installmentCount,
        vehicleNoClaimThirdParty,
        vehicleNoClaimBody,
        jobTitle,
        jobRiskGroup,
        isJaamZarrin,
        goldValue,
        isSamaZarrin,
        liabilityType,
        liabilityStaffCount,
        liabilityCoverageLimit
      }
    } : null;

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insuranceType: formInsuranceType,
          fullName: formFullName,
          nationalId: formNationalId,
          mobile: formMobile,
          province: 'تهران',
          city: 'تهران',
          address: 'ثبت شده از طریق مشاور هوشمند آنلاین (قوانین ۱۴۰۵)',
          formData: {
            source: 'مشاور هوشمند بیمه ایران',
            description: calculationDetails 
              ? `حق بیمه نهایی محاسبه شده (۱۴۰۵): ${calculationDetails.finalPremium.toLocaleString('fa-IR')} تومان [روش پرداخت: ${paymentMode === 'cash' ? 'نقدی با تخفیف ویژه' : `اقساطی با تعداد ${installmentCount} قسط`}]\nجزئیات پارامترها: ${JSON.stringify(calculationDetails.args, null, 2)}`
              : 'درخواست ثبت شده از طریق چت دستیار هوشمند به همراه مدارک ارسالی.',
            calculation: calculationDetails,
            additionalParams: {
              paymentMode,
              installmentCount,
              vehicleNoClaimThirdParty,
              vehicleNoClaimBody,
              jobTitle,
              jobRiskGroup,
              isJaamZarrin,
              goldValue,
              isSamaZarrin,
              liabilityType,
              liabilityStaffCount,
              liabilityCoverageLimit
            }
          },
          documents
        })
      });

      const data = await res.json();
      setSubmittingInquiry(false);

      if (data.success && data.inquiry) {
        const code = data.inquiry.trackingCode;
        setSuccessTrackingCode(code);

        const typeLabels: Record<string, string> = {
          third_party: 'شخص ثالث خودرو',
          body: 'بیمه بدنه خودرو',
          fire: 'آتش‌سوزی و زلزله (طرح جام زرین)',
          health: 'درمان تکمیلی (طرح سما زرین)',
          liability: 'بیمه مسئولیت مدنی / کارفرما'
        };

        // Add a message into the main chat detailing the success
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: `🎉 درخواست صدور شما با موفقیت ثبت نهایی شد!\nنوع بیمه‌نامه: ${typeLabels[formInsuranceType] || formInsuranceType}\nکد رهگیری معتبر: ${code}\nکارشناسان صدور نمایندگی گلزار (کد ۳۰۹۶۲) هم‌اکنون مدارک شما را بررسی و جهت تایید نهایی قیمت با شماره ${formMobile} تماس خواهند گرفت. از اعتماد شما متشکریم.`
        }]);

        // Clear docs and close form view
        setDocuments([]);
        setShowInquiryForm(false);
      } else {
        setFormError(data.error || 'خطایی در ثبت رسمی رخ داد. لطفاً مجددا تلاش فرمایید.');
      }
    } catch (err) {
      setSubmittingInquiry(false);
      setFormError('خطا در اتصال به سرور. لطفاً ارتباط خود را بررسی فرمایید.');
    }
  };

  const copyTrackingCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-slideLeft">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white p-4 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">مشاور هوشمند بیمه ایران</h3>
              <p className="text-[11px] text-emerald-200">نمایندگی گلزار (کد ۳۰۹۶۲)</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-emerald-800 text-emerald-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic content: Chat Messages OR Inquiry form */}
        {!showInquiryForm ? (
          <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
            
            {/* Quick Action Banner */}
            <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border border-emerald-100 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-bold text-slate-800 text-[11px]">قصد صدور فوری یا استعلام رسمی دارید؟</span>
              </div>
              <button 
                onClick={() => {
                  setSuccessTrackingCode(null);
                  setShowInquiryForm(true);
                }}
                className="bg-emerald-800 hover:bg-emerald-950 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-all shadow"
              >
                ثبت رسمی و صدور آنلاین
              </button>
            </div>

            {/* Tracking Success Alert if recently submitted */}
            {successTrackingCode && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2 text-slate-800 relative animate-fadeIn">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                  <Check className="w-4 h-4 bg-emerald-700 text-white rounded-full p-0.5" />
                  <span>درخواست شما ثبت شد!</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  کد رهگیری معتبر صادر گردید. شما می‌توانید وضعیت این بیمه‌نامه را از بخش «پیگیری استعلام» یا پنل کاربری رهگیری کنید.
                </p>
                <div className="bg-white border border-emerald-100 p-2 rounded-xl flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-950 text-xs">{successTrackingCode}</span>
                  <button 
                    onClick={() => copyTrackingCode(successTrackingCode)}
                    className="text-emerald-700 hover:text-emerald-950 flex items-center gap-1 text-[10px] font-bold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode ? 'کپی شد' : 'کپی کد'}</span>
                  </button>
                </div>
              </div>
            )}

            {messages.map((m, idx) => (
              <div 
                key={idx}
                className={`flex flex-col gap-1.5 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex gap-2 w-full ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-emerald-800 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-none font-medium'
                  }`}>
                    {m.text}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Confirm and Issue button if calculation is present */}
                {m.sender === 'ai' && m.calculation && (
                  <div className="mr-9 mt-1 mb-2 animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => handleConfirmAndIssue(m.calculation)}
                      className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-[11px] px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all active:scale-95"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-800" />
                      <span>تأیید و صدور فوری ({m.calculation.finalPremium.toLocaleString('fa-IR')} تومان)</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-slate-500 text-xs italic">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
                <span>مشاور در حال پاسخگویی...</span>
              </div>
            )}
          </div>
        ) : (
          /* Inquiry Form View */
          <div className="p-4 overflow-y-auto flex-1 bg-slate-50 text-xs space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>صدور و استعلام سریع نمایندگی ۳۰۹۶۲ (سال ۱۴۰۵)</span>
                </h4>
                <button 
                  onClick={() => setShowInquiryForm(false)}
                  className="text-rose-600 hover:text-rose-800 font-bold"
                >
                  انصراف
                </button>
              </div>

              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitInquiry} className="space-y-3.5">
                {/* Insurance Type */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">نوع بیمه‌نامه درخواستی:</label>
                  <select 
                    value={formInsuranceType}
                    onChange={(e) => setFormInsuranceType(e.target.value as InsuranceType)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="third_party">بیمه شخص ثالث خودرو</option>
                    <option value="body">بیمه بدنه خودرو</option>
                    <option value="fire">بیمه آتش‌سوزی و زلزله (طرح جام زرین)</option>
                    <option value="health">بیمه درمان تکمیلی (طرح سما زرین)</option>
                    <option value="liability">بیمه مسئولیت کارفرما / مدنی / پزشکان</option>
                  </select>
                </div>

                {/* --- Conditional Form Sub-Fields based on Bimeh Iran 1405 Rules --- */}
                {formInsuranceType === 'third_party' && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 space-y-2 animate-fadeIn">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">تعداد سال تخفیف عدم خسارت ثالث (0 الی 14 سال):</label>
                      <select
                        value={vehicleNoClaimThirdParty}
                        onChange={(e) => setVehicleNoClaimThirdParty(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold text-slate-800"
                      >
                        {[...Array(15)].map((_, i) => (
                          <option key={i} value={i}>{i} سال ({i * 5}% تخفیف عدم خسارت)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {formInsuranceType === 'body' && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 space-y-2 animate-fadeIn">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">تعداد سال تخفیف عدم خسارت بدنه (0 الی 10 سال):</label>
                      <select
                        value={vehicleNoClaimBody}
                        onChange={(e) => setVehicleNoClaimBody(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold text-slate-800"
                      >
                        {[...Array(11)].map((_, i) => (
                          <option key={i} value={i}>{i} سال ({i === 0 ? 0 : i === 1 ? 20 : i === 2 ? 30 : i === 3 ? 40 : 45 + (i - 3) * 5}% تخفیف بدنه)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {formInsuranceType === 'fire' && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 space-y-2 animate-fadeIn">
                    <label className="flex items-center gap-2 cursor-pointer py-1">
                      <input 
                        type="checkbox"
                        checked={isJaamZarrin}
                        onChange={(e) => setIsJaamZarrin(e.target.checked)}
                        className="accent-emerald-700 w-4 h-4 rounded"
                      />
                      <span className="text-slate-800 font-bold text-[11px]">طرح نوین لوکس جام زرین (پوشش ویژه سرقت گاوصندوق)</span>
                    </label>

                    {isJaamZarrin && (
                      <div className="space-y-1 animate-fadeIn">
                        <label className="block text-slate-600 font-semibold">ارزش تقریبی طلا، مسکوکات و ارز داخل منزل (تومان):</label>
                        <select
                          value={goldValue}
                          onChange={(e) => setGoldValue(Number(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-medium"
                        >
                          <option value={0}>انتخاب ارزش ریالی...</option>
                          <option value={50000000}>تا ۵۰ میلیون تومان</option>
                          <option value={100000000}>تا ۱۰۰ میلیون تومان</option>
                          <option value={200000000}>تا ۲۰۰ میلیون تومان</option>
                          <option value={500000000}>تا ۵۰۰ میلیون تومان</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {formInsuranceType === 'health' && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 space-y-2 animate-fadeIn">
                    <label className="flex items-center gap-2 cursor-pointer py-1">
                      <input 
                        type="checkbox"
                        checked={isSamaZarrin}
                        onChange={(e) => setIsSamaZarrin(e.target.checked)}
                        className="accent-emerald-700 w-4 h-4 rounded"
                      />
                      <span className="text-slate-800 font-bold text-[11px]">طرح نوین سما زرین (درمان تکمیلی جامع + عمر و حوادث لوکس)</span>
                    </label>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">شغل دقیق بیمه‌گذار (جهت محاسبه ریسک حوادث انفرادی):</label>
                      <input 
                        type="text"
                        placeholder="مثال: کارمند اداری، راننده تاکسی، مهندس ناظر"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">گروه ریسک شغلی (۱ الی ۵):</label>
                      <select
                        value={jobRiskGroup}
                        onChange={(e) => setJobRiskGroup(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-medium text-slate-800"
                      >
                        <option value={1}>گروه ۱ (مشاغل کم ریسک دفتری و اداری)</option>
                        <option value={2}>گروه ۲ (فروشندگان، پزشکان و کارهای سبک خدماتی)</option>
                        <option value={3}>گروe ۳ (کارگران فنی، رانندگان سواری و ترانزیت)</option>
                        <option value={4}>گروه ۴ (مهندسین ساختمان، کارگران کارخانه‌ها و ارتفاع)</option>
                        <option value={5}>گروه ۵ (معدنچیان، خلبانان و کارهای فوق پرخطر)</option>
                      </select>
                    </div>
                  </div>
                )}

                {formInsuranceType === 'liability' && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 space-y-2 animate-fadeIn">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">نوع بیمه مسئولیت:</label>
                      <select
                        value={liabilityType}
                        onChange={(e) => setLiabilityType(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-medium text-slate-800"
                      >
                        <option value="civil">مسئولیت مدنی عمومی در قبال اشخاص ثالث</option>
                        <option value="employer">مسئولیت کارفرما در قبال کارکنان (ساختمانی/صنعتی)</option>
                        <option value="professional">مسئولیت حرفه‌ای پزشکان، دندانپزشکان و پیراپزشکان</option>
                      </select>
                    </div>

                    {liabilityType === 'employer' && (
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">تعداد کارکنان تحت پوشش:</label>
                        <input 
                          type="number"
                          min={1}
                          value={liabilityStaffCount}
                          onChange={(e) => setLiabilityStaffCount(Number(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-medium text-slate-800"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">شغل یا حوزه دقیق فعالیت:</label>
                      <input 
                        type="text"
                        placeholder="مثال: دندانپزشک، کارگاه نجاری، کارفرمای پروژه‌ی ساختمانی"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">گروه ریسک شغلی (۱ الی ۵):</label>
                      <select
                        value={jobRiskGroup}
                        onChange={(e) => setJobRiskGroup(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-medium text-slate-800"
                      >
                        <option value={1}>گروه ۱ (کم‌ریسک اداری / پزشکان درمانگاه)</option>
                        <option value={2}>گروه ۲ (کارگاه‌های سبک / پزشک جراح)</option>
                        <option value={3}>گروه ۳ (صنایع متوسط / کارهای کارگاهی سنگین)</option>
                        <option value={4}>گروه ۴ (ساختمان‌سازی / ابنیه نیمه‌کاره)</option>
                        <option value={5}>گروه ۵ (معدن، راه‌سازی و صنایع پرخطر)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">تعهد دیه درخواستی سال ۱۴۰۵:</label>
                      <select
                        value={liabilityCoverageLimit}
                        onChange={(e) => setLiabilityCoverageLimit(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold text-slate-800"
                      >
                        <option value={1200000000}>۱ میلیارد و ۲۰۰ میلیون تومان (دیه پایه مصوب ۱۴۰۵)</option>
                        <option value={2000000000}>۲ میلیارد تومان (تعهد ویژه پزشکان)</option>
                        <option value={3000000000}>۳ میلیارد تومان (تعهد کامل کارفرما با تعدد دیه)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* --- Payment Terms Choose (Cash vs Installments) --- */}
                <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 space-y-2.5">
                  <span className="block text-slate-800 font-black mb-1">نحوه پرداخت حق بیمه (طبق بخشنامه جدید ۱۴۰۵):</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMode('cash')}
                      className={`p-2 rounded-xl border text-center transition-all font-bold flex flex-col items-center justify-center gap-0.5 ${
                        paymentMode === 'cash' 
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm' 
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-xs">پرداخت نقدی</span>
                      <span className="text-[9px] opacity-90">شامل ۱۰٪ تخفیف ویژه</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPaymentMode('installments')}
                      className={`p-2 rounded-xl border text-center transition-all font-bold flex flex-col items-center justify-center gap-0.5 ${
                        paymentMode === 'installments' 
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm' 
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-xs">اقساطی جدید</span>
                      <span className="text-[9px] opacity-90">۳۰٪ پیش‌پرداخت، مابقی اقساط</span>
                    </button>
                  </div>

                  {paymentMode === 'installments' && (
                    <div className="space-y-1.5 animate-fadeIn pt-1 border-t border-slate-200/50">
                      <label className="block text-slate-700 font-semibold text-[10px]">تعداد اقساط ماهیانه:</label>
                      <select
                        value={installmentCount}
                        onChange={(e) => setInstallmentCount(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold text-slate-800"
                      >
                        <option value={4}>۴ ماهه (طی ۴ قسط مساوی بدون کارمزد)</option>
                        <option value={6}>۶ ماهه (طی ۶ قسط مساوی)</option>
                        <option value={8}>۸ ماهه (طی ۸ قسط مساوی ویژه ثالث و بدنه)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* --- Live Calculation Display Card --- */}
                {liveCalculationResult && (
                  <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white p-3.5 rounded-2xl space-y-2 shadow-md animate-scaleIn">
                    <div className="flex items-center justify-between border-b border-emerald-800/60 pb-1.5">
                      <span className="font-extrabold text-[11px] text-emerald-300">حق بیمه نهایی سال ۱۴۰۵ (تومان)</span>
                      <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-[6px] text-[8px] font-black">صدور آنلاین فوری</span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-300">
                        <span>تعرفه پایه بیمه ایران:</span>
                        <span className="font-bold">
                          {(liveCalculationResult.baseTariff || liveCalculationResult.basePremium || liveCalculationResult.yearlyTotalBeforeTax || 0).toLocaleString('fa-IR')} تومان
                        </span>
                      </div>

                      {liveCalculationResult.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-400 font-bold">
                          <span>تخفیف عدم خسارت / نقدی:</span>
                          <span>
                            {(liveCalculationResult.discountAmount).toLocaleString('fa-IR')} - تومان
                          </span>
                        </div>
                      )}

                      {isJaamZarrin && liveCalculationResult.zarrinTheftFee !== undefined && (
                        <div className="flex justify-between text-amber-300">
                          <span>حق بیمه سرقت طلا گاوصندوق (جام زرین):</span>
                          <span>
                            {liveCalculationResult.zarrinTheftFee.toLocaleString('fa-IR')} + تومان
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-white font-black border-t border-emerald-800/60 pt-1.5 text-xs">
                        <span>حق بیمه کل با عوارض و مالیات:</span>
                        <span className="text-amber-400 text-sm">
                          {liveCalculationResult.finalPremium.toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                    </div>

                    {/* Installments Schedule display inside calculation card */}
                    {paymentMode === 'installments' && liveCalculationResult.paymentSchedule && (
                      <div className="bg-emerald-900/40 p-2 rounded-xl border border-emerald-800/40 text-[10px] space-y-1 mt-2">
                        <div className="flex justify-between font-bold text-amber-300 border-b border-emerald-800/30 pb-1">
                          <span>پیش‌پرداخت اولیه (۳۰٪):</span>
                          <span>{liveCalculationResult.paymentSchedule.downPayment.toLocaleString('fa-IR')} تومان</span>
                        </div>
                        <div className="flex justify-between font-semibold text-slate-200">
                          <span>مبلغ هر قسط ماهیانه:</span>
                          <span>{liveCalculationResult.paymentSchedule.monthlyPayment.toLocaleString('fa-IR')} تومان</span>
                        </div>
                        <div className="flex justify-between text-slate-300 text-[9px]">
                          <span>سررسید اقساط:</span>
                          <span>{liveCalculationResult.paymentSchedule.installmentCount} قسط ماهیانه پیاپی</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">نام و نام خانوادگی بیمه‌گذار:</label>
                  <input 
                    type="text"
                    required
                    placeholder="مثال: علی رضایی"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">شماره همراه تماس:</label>
                  <input 
                    type="tel"
                    required
                    placeholder="مثال: 09121112233"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-left dir-ltr"
                  />
                </div>

                {/* National ID */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">کد ملی بیمه‌گذار:</label>
                  <input 
                    type="text"
                    required
                    placeholder="کد ملی ۱۰ رقمی"
                    value={formNationalId}
                    onChange={(e) => setFormNationalId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-left dir-ltr"
                  />
                </div>

                {/* Attached Documents */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 font-bold">مدارک ضمیمه شده ({documents.length}):</label>
                    <label className="text-[10px] text-emerald-800 font-bold cursor-pointer hover:underline flex items-center gap-0.5">
                      <Upload className="w-3 h-3" />
                      <span>افزودن مدرک جدید</span>
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden" 
                        onChange={(e) => {
                          const files = e.target.files;
                          if (!files || files.length === 0) return;
                          setUploading(true);
                          const file = files[0];
                          const reader = new FileReader();
                          reader.onload = () => {
                            const newDoc: UploadedDocument = {
                              id: `doc-${Date.now()}`,
                              type: 'other',
                              label: 'مدرک ضمیمه',
                              fileName: file.name,
                              fileUrl: reader.result as string,
                              fileSize: `${(file.size / 1024).toFixed(0)} KB`,
                              uploadedAt: 'هم‌اکنون'
                            };
                            setDocuments(prev => [...prev, newDoc]);
                            setUploading(false);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                  
                  {documents.length > 0 ? (
                    <div className="space-y-1 max-h-24 overflow-y-auto border border-slate-100 rounded-lg p-1">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between bg-emerald-50/70 border border-emerald-100 p-1.5 rounded-lg">
                          <span className="font-bold text-emerald-950 truncate max-w-[200px]">{doc.label} ({doc.fileName})</span>
                          <button 
                            type="button"
                            onClick={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))}
                            className="text-rose-600 hover:text-rose-800 font-bold text-[10px] px-1.5 py-0.5 hover:bg-rose-50 rounded"
                          >
                            حذف
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">مدرکی ضمیمه نشده است. جهت تسریع صدور می‌توانید مدارک خود را پیوست نمایید.</p>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold p-2.5 rounded-xl shadow transition-all disabled:opacity-50 text-xs"
                  >
                    {submittingInquiry ? 'در حال ثبت درخواست...' : 'تایید نهایی و دریافت کد رهگیری'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInquiryForm(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold p-2.5 rounded-xl transition-all"
                  >
                    بازگشت به چت
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Input Footer */}
        <div className="bg-slate-50 border-t border-slate-200 space-y-1.5">
          
          {/* Document Attachment Tray (Above send bar) */}
          {!showInquiryForm && (
            <div className="px-3 pt-2 pb-1 border-b border-slate-150 flex flex-col gap-1 bg-slate-100/50">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-bold cursor-pointer hover:text-emerald-950">
                  <Upload className="w-3.5 h-3.5" />
                  <span>بارگذاری کارت خودرو / بیمه‌نامه قبلی / کارت ملی</span>
                  <input 
                    type="file" 
                    accept="image/*,.pdf" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />
                </label>
                
                {uploading && (
                  <span className="text-[10px] italic text-slate-500 animate-pulse">در حال پیوست فایل...</span>
                )}
              </div>

              {/* Uploaded files row */}
              {documents.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-1.5 bg-white border border-emerald-200 text-emerald-950 px-2 py-0.5 rounded-md text-[10px] font-bold">
                      <FileText className="w-3 h-3 text-emerald-700" />
                      <span className="truncate max-w-[100px]">{doc.label}</span>
                      <button 
                        type="button"
                        onClick={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!showInquiryForm && (
            <div className="p-3 space-y-2">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input 
                  type="text"
                  placeholder={documents.length > 0 ? "توضیحی درباره مدارک بنویسید یا دکمه ارسال را بزنید..." : "سوال خود را درباره شرایط بیمه بپرسید..."}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-600 font-medium"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white p-2.5 rounded-xl shrink-0 transition-colors shadow"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>تماس با تلفن دفتر:</span>
                <a href={`tel:${IRAN_BIMEH_AGENCY.phone1.replace(/-/g, '')}`} className="font-bold text-emerald-800">
                  {IRAN_BIMEH_AGENCY.phone1}
                </a>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
