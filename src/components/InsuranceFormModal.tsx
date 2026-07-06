import React, { useState, useEffect } from 'react';
import { 
  X, 
  Car, 
  ShieldCheck, 
  Home, 
  HeartPulse, 
  Briefcase, 
  Plane, 
  Upload, 
  Check, 
  AlertCircle, 
  Calculator, 
  Send, 
  FileText, 
  FileCheck2, 
  Trash2, 
  Sparkles, 
  Phone, 
  User, 
  MapPin, 
  Copy, 
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { InsuranceType, UploadedDocument, IRAN_BIMEH_AGENCY } from '../types';
import { 
  calculateThirdPartyPremium, 
  calculateBodyPremium, 
  calculateFirePremium, 
  calculateHealthPremium 
} from '../utils/calculator';

interface InsuranceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: InsuranceType;
  onSuccessSubmit: (trackingCode: string) => void;
}

export const InsuranceFormModal: React.FC<InsuranceFormModalProps> = ({
  isOpen,
  onClose,
  initialType = 'third_party',
  onSuccessSubmit
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [insuranceType, setInsuranceType] = useState<InsuranceType>(initialType);

  useEffect(() => {
    setInsuranceType(initialType);
    setStep(1);
  }, [initialType, isOpen]);

  // Form Field States
  // 1. Third Party
  const [tpVehicleType, setTpVehicleType] = useState('passenger_4cyl');
  const [tpModelYear, setTpModelYear] = useState(1401);
  const [tpNoClaimYears, setTpNoClaimYears] = useState(3);
  const [tpFinancialLimit, setTpFinancialLimit] = useState(100000000);
  const [tpPreviousCompany, setTpPreviousCompany] = useState('بیمه ایران');

  // 2. Body
  const [bodyVehicleValue, setBodyVehicleValue] = useState(850000000); // 850M Tomans
  const [bodyNoClaimYears, setBodyNoClaimYears] = useState(2);
  const [bodyCoverGlass, setBodyCoverGlass] = useState(true);
  const [bodyCoverDisasters, setBodyCoverDisasters] = useState(true);
  const [bodyCoverFluctuation, setBodyCoverFluctuation] = useState(true);

  // 3. Fire
  const [firePropertyType, setFirePropertyType] = useState<'residential' | 'commercial' | 'industrial'>('residential');
  const [fireBuildingValue, setFireBuildingValue] = useState(2000000000);
  const [fireAppliancesValue, setFireAppliancesValue] = useState(500000000);
  const [fireEarthquake, setFireEarthquake] = useState(true);
  const [firePipeBurst, setFirePipeBurst] = useState(true);

  // 4. Health
  const [healthPlan, setHealthPlan] = useState<'basic' | 'standard' | 'golden'>('standard');
  const [healthAge, setHealthAge] = useState<'under_40' | '40_to_60' | 'over_60'>('under_40');
  const [healthPersonCount, setHealthPersonCount] = useState(2);
  const [healthDental, setHealthDental] = useState(true);

  // Customer Contact Info
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [mobile, setMobile] = useState('');
  const [province, setProvince] = useState('تهران');
  const [city, setCity] = useState('تهران');
  const [address, setAddress] = useState('');

  // Documents
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  // Real-time Estimated Calculation
  const getCalculatedQuote = () => {
    switch (insuranceType) {
      case 'third_party':
        return calculateThirdPartyPremium({
          vehicleType: tpVehicleType,
          modelYear: tpModelYear,
          noClaimDiscountYears: tpNoClaimYears,
          driverDiscountYears: tpNoClaimYears,
          financialLimit: tpFinancialLimit,
          previousCompany: tpPreviousCompany,
          hasDamageHistory: false
        });
      case 'body':
        return calculateBodyPremium({
          vehicleType: tpVehicleType,
          vehicleValueTomans: bodyVehicleValue,
          modelYear: tpModelYear,
          noClaimYears: bodyNoClaimYears,
          coverGlass: bodyCoverGlass,
          coverNaturalDisasters: bodyCoverDisasters,
          coverChemicals: false,
          coverPriceFluctuation: bodyCoverFluctuation
        });
      case 'fire':
        return calculateFirePremium({
          propertyType: firePropertyType,
          buildingValueTomans: fireBuildingValue,
          appliancesValueTomans: fireAppliancesValue,
          areaSizeSqm: 100,
          coverEarthquake: fireEarthquake,
          coverPipeBurst: firePipeBurst,
          coverFlood: true
        });
      case 'health':
        return calculateHealthPremium({
          planType: healthPlan,
          ageCategory: healthAge,
          personCount: healthPersonCount,
          hasDental: healthDental
        });
      default:
        return { finalPremiumTomans: 3500000 };
    }
  };

  const currentQuote = getCalculatedQuote();

  // File Upload Simulator
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: UploadedDocument['type'], label: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const file = files[0];

    // Create object URL for preview
    const reader = new FileReader();
    reader.onload = () => {
      const newDoc: UploadedDocument = {
        id: `doc-${Date.now()}`,
        type: docType,
        label,
        fileName: file.name,
        fileUrl: reader.result as string,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        uploadedAt: 'هم‌اکنون'
      };
      setDocuments(prev => [...prev.filter(d => d.type !== docType), newDoc]);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Submit Handler
  const handleSubmitInquiry = async () => {
    setErrorMsg('');
    if (!fullName.trim() || !mobile.trim() || !nationalId.trim()) {
      setErrorMsg('لطفاً نام و نام خانوادگی، کدملی و شماره موبایل را وارد نمایید.');
      return;
    }

    if (mobile.length < 10) {
      setErrorMsg('شماره موبایل معتبر نیست (مثال: 09121112233).');
      return;
    }

    setIsSubmitting(true);

    const formDataDetails = {
      insuranceType,
      estimatedPriceTomans: currentQuote.finalPremiumTomans,
      details: insuranceType === 'third_party' ? {
        vehicleType: tpVehicleType === 'passenger_4cyl' ? 'سواری ۴ سیلندر' : 'سواری ۶ سیلندر',
        modelYear: tpModelYear,
        noClaimDiscount: `${tpNoClaimYears * 5}% (${tpNoClaimYears} سال تخفیف)`,
        financialLimit: `${(tpFinancialLimit / 1000000).toLocaleString('fa-IR')} میلیون تومان`,
        previousCompany: tpPreviousCompany
      } : insuranceType === 'body' ? {
        vehicleValue: `${(bodyVehicleValue / 1000000).toLocaleString('fa-IR')} میلیون تومان`,
        noClaimDiscount: `${bodyNoClaimYears * 10}% (${bodyNoClaimYears} سال تخفیف)`,
        coverGlass: bodyCoverGlass ? 'دارد' : 'ندارد',
        coverDisasters: bodyCoverDisasters ? 'دارد' : 'ندارد'
      } : insuranceType === 'fire' ? {
        propertyType: firePropertyType === 'residential' ? 'مسکونی' : firePropertyType === 'commercial' ? 'تجاری' : 'صنعتی',
        buildingValue: `${(fireBuildingValue / 1000000).toLocaleString('fa-IR')} میلیون تومان`,
        appliancesValue: `${(fireAppliancesValue / 1000000).toLocaleString('fa-IR')} میلیون تومان`
      } : {
        plan: healthPlan,
        personCount: healthPersonCount
      }
    };

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insuranceType,
          fullName,
          nationalId,
          mobile,
          province,
          city,
          address,
          formData: formDataDetails,
          documents
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success && data.inquiry) {
        setSubmittedCode(data.inquiry.trackingCode);
        setStep(4);
        onSuccessSubmit(data.inquiry.trackingCode);
      } else {
        setErrorMsg(data.error || 'خطا در ثبت استعلام. مجددا تلاش کنید.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی نمایید.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow">
              ایران
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">فرم استعلام و صدور آنلاین بیمه ایران</h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded">
                  نمایندگی گلزار کد ۳۰۹۶۲
                </span>
              </div>
              <p className="text-xs text-emerald-200">محاسبه تقریبی قیمت، بارگذاری آنلاین مدارک و ارسال سریع</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        {step < 4 && (
          <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
              <span className={step >= 1 ? 'text-emerald-700' : ''}>۱. مشخصات و قیمت‌دهی</span>
              <span className={step >= 2 ? 'text-emerald-700' : ''}>۲. ارسال مدارک</span>
              <span className={step >= 3 ? 'text-emerald-700' : ''}>۳. اطلاعات تماس و ثبت</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-600 to-amber-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Modal Body Scrollable */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6">

          {/* STEP 1: Insurance Type Selection & Dynamic Price Calculation */}
          {step === 1 && (
            <div className="space-y-6">
              
              {/* Type Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">انتخاب نوع بیمه‌نامه:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { type: 'third_party', name: 'شخص ثالث', icon: Car },
                    { type: 'body', name: 'بیمه بدنه', icon: ShieldCheck },
                    { type: 'fire', name: 'آتش‌سوزی', icon: Home },
                    { type: 'health', name: 'درمان تکمیلی', icon: HeartPulse }
                  ].map((item) => {
                    const IconComp = item.icon;
                    const active = insuranceType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setInsuranceType(item.type as InsuranceType)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                          active 
                            ? 'bg-emerald-800 text-white border-emerald-800 shadow-md scale-[1.02]' 
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <IconComp className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-500'}`} />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Form Fields per Type */}
              {insuranceType === 'third_party' && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center justify-between">
                    <span>مشخصات خودرو جهت استعلام ثالث</span>
                    <span className="text-xs text-emerald-700 font-normal">تعرفه رسمی مصوب مرکزی</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">نوع و کاربری خودرو:</label>
                      <select 
                        value={tpVehicleType}
                        onChange={(e) => setTpVehicleType(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium"
                      >
                        <option value="passenger_4cyl">سواری ۴ سیلندر (پژو، پراید، دنا، ساندرو و ...)</option>
                        <option value="passenger_6cyl">سواری ۶ سیلندر و بالاتر (تویوتا، بنز، هیوندای و ...)</option>
                        <option value="pickup">وانت و نیسان بار</option>
                        <option value="motorcycle">موتورسیکلت</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">سال ساخت (شمسی):</label>
                      <input 
                        type="number"
                        min={1380}
                        max={1403}
                        value={tpModelYear}
                        onChange={(e) => setTpModelYear(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        تخفیف عدم خسارت ثالث (سابقه قبلی):
                      </label>
                      <select 
                        value={tpNoClaimYears}
                        onChange={(e) => setTpNoClaimYears(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium"
                      >
                        <option value={0}>بدون تخفیف (سال اول)</option>
                        <option value={1}>۵٪ تخفیف (۱ سال)</option>
                        <option value={2}>۱۰٪ تخفیف (۲ سال)</option>
                        <option value={3}>۱۵٪ تخفیف (۳ سال)</option>
                        <option value={4}>۲۰٪ تخفیف (۴ سال)</option>
                        <option value={5}>۲۵٪ تخفیف (۵ سال)</option>
                        <option value={7}>۳۵٪ تخفیف (۷ سال)</option>
                        <option value={10}>۵۰٪ تخفیف (۱۰ سال)</option>
                        <option value={14}>۷۰٪ تخفیف (حداکثر - ۱۴ سال)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">تعهد مالی درخواستی:</label>
                      <select 
                        value={tpFinancialLimit}
                        onChange={(e) => setTpFinancialLimit(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium"
                      >
                        <option value={100000000}>۱۰۰ میلیون تومان (پایه اجباری)</option>
                        <option value={200000000}>۲۰۰ میلیون تومان (پیشنهادی)</option>
                        <option value={300000000}>۳۰۰ میلیون تومان</option>
                        <option value={500000000}>۵۰۰ میلیون تومان (پوشش کامل)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {insuranceType === 'body' && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
                    مشخصات خودرو جهت استعلام بیمه بدنه
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-medium text-slate-700 mb-1">
                        ارزش تقریبی روز خودرو (تومان):
                      </label>
                      <input 
                        type="number"
                        step={50000000}
                        value={bodyVehicleValue}
                        onChange={(e) => setBodyVehicleValue(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-emerald-800"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        مبلغ به حروف: <strong>{(bodyVehicleValue / 1000000).toLocaleString('fa-IR')} میلیون تومان</strong>
                      </p>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">سابقه تخفیف بدنه:</label>
                      <select 
                        value={bodyNoClaimYears}
                        onChange={(e) => setBodyNoClaimYears(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium"
                      >
                        <option value={0}>بدون تخفیف</option>
                        <option value={1}>۲۵٪ تخفیف (۱ سال)</option>
                        <option value={2}>۳۵٪ تخفیف (۲ سال)</option>
                        <option value={3}>۴۵٪ تخفیف (۳ سال)</option>
                        <option value={4}>۶۰٪ تخفیف (حداکثر)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-medium text-slate-700">پوشش‌های اضافی انتخابی:</label>
                      <div className="flex flex-wrap gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={bodyCoverGlass}
                            onChange={(e) => setBodyCoverGlass(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500" 
                          />
                          <span>شکست شیشه</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={bodyCoverDisasters}
                            onChange={(e) => setBodyCoverDisasters(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500" 
                          />
                          <span>بلایای طبیعی (سیل/زلزله)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={bodyCoverFluctuation}
                            onChange={(e) => setBodyCoverFluctuation(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500" 
                          />
                          <span>نوسان قیمت خودرو</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {insuranceType === 'fire' && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
                    مشخصات ملک جهت استعلام آتش‌سوزی و زلزله
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">نوع کاربری ملک:</label>
                      <select 
                        value={firePropertyType}
                        onChange={(e) => setFirePropertyType(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium"
                      >
                        <option value="residential">مسکونی (آپارتمان / ویلا)</option>
                        <option value="commercial">تجاری و مغازه</option>
                        <option value="industrial">صنعتی و کارگاه</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">ارزش ساخت و اعیان (تومان):</label>
                      <input 
                        type="number"
                        step={100000000}
                        value={fireBuildingValue}
                        onChange={(e) => setFireBuildingValue(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">ارزش لوازم و اثاثیه (تومان):</label>
                      <input 
                        type="number"
                        step={50000000}
                        value={fireAppliancesValue}
                        onChange={(e) => setFireAppliancesValue(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800"
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={fireEarthquake}
                          onChange={(e) => setFireEarthquake(e.target.checked)}
                          className="rounded text-emerald-600" 
                        />
                        <span>پوشش زلزله</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={firePipeBurst}
                          onChange={(e) => setFirePipeBurst(e.target.checked)}
                          className="rounded text-emerald-600" 
                        />
                        <span>ترکیدگی لوله آب</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {insuranceType === 'health' && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
                    مشخصات بیمه درمان تکمیلی انفرادی/خانواده
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">طرح پوشش انتخابی:</label>
                      <select 
                        value={healthPlan}
                        onChange={(e) => setHealthPlan(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium"
                      >
                        <option value="basic">طرح پایه (سقف بستری ۵۰ میلیون تومان)</option>
                        <option value="standard">طرح استاندارد (سقف بستری ۱۰۰ میلیون تومان)</option>
                        <option value="golden">طرح طلایی (سقف بستری ۲۰۰ میلیون تومان + پاراکلینیکی)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">رده سنی سرپرست:</label>
                      <select 
                        value={healthAge}
                        onChange={(e) => setHealthAge(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium"
                      >
                        <option value="under_40">زیر ۴۰ سال</option>
                        <option value="40_to_60">۴۰ الی ۶۰ سال</option>
                        <option value="over_60">بالای ۶۰ سال</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">تعداد افراد تحت پوشش:</label>
                      <input 
                        type="number"
                        min={1}
                        max={10}
                        value={healthPersonCount}
                        onChange={(e) => setHealthPersonCount(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-bold"
                      />
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-800">
                        <input 
                          type="checkbox" 
                          checked={healthDental}
                          onChange={(e) => setHealthDental(e.target.checked)}
                          className="rounded text-emerald-600 w-4 h-4" 
                        />
                        <span>شامل پوشش دندانپزشکی (۱۰ میلیون تومان)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Price Display Box */}
              <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white p-5 rounded-2xl shadow-xl border border-emerald-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-amber-400/30">
                    <Calculator className="w-3.5 h-3.5" />
                    قیمت‌دهی تقریبی و آنلاین (بیمه ایران)
                  </span>
                  <p className="text-xs text-emerald-200">
                    تخفیف‌های قانونی اعمال گردید. قیمت نهایی پس از رویت مدارک تأیید خواهد شد.
                  </p>
                </div>

                <div className="text-center sm:text-left shrink-0 bg-white/10 backdrop-blur px-5 py-3 rounded-xl border border-white/20">
                  <span className="text-xs text-emerald-300 block">حق‌بیمه برآوردی سالیانه:</span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                    {currentQuote.finalPremiumTomans.toLocaleString('fa-IR')} <span className="text-xs font-normal text-white">تومان</span>
                  </div>
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">مرحله ۱ از ۳</span>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-900/20"
                >
                  <span>مرحله بعدی: بارگذاری مدارک</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: Online Document Upload */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-1">ارسال تصویر مدارک جهت صدور دقیق و سریع:</p>
                  <p className="text-amber-800 leading-relaxed">
                    لطفا تصویر واضح از روی کارت خودرو، بیمه‌نامه سال قبل یا کارت ملی را انتخاب کنید. این کار سرعت صدور بیمه‌نامه شما در نمایندگی گلزار ۳۰۹۶۲ را تا ۳ برابر افزایش می‌دهد.
                  </p>
                </div>
              </div>

              {/* Document Input Slots */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Slot 1: Car Card Front / Property Doc */}
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-emerald-500 bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 mb-1">
                    {insuranceType === 'fire' ? 'سند / سند مالکیت ملک' : 'تصویر روی کارت خودرو'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-3">فرمت JPG یا PNG (حداکثر ۱۰ مگابایت)</p>

                  <label className="cursor-pointer inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow">
                    <Upload className="w-3.5 h-3.5" />
                    <span>انتخاب تصویر</span>
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'car_card_front', 'روی کارت خودرو')}
                    />
                  </label>
                </div>

                {/* Slot 2: Previous Policy */}
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-emerald-500 bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 mb-1">تصویر بیمه‌نامه سال قبل</h4>
                  <p className="text-[11px] text-slate-500 mb-3">جهت بررسی و اعمال سوابق تخفیف</p>

                  <label className="cursor-pointer inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow">
                    <Upload className="w-3.5 h-3.5" />
                    <span>انتخاب تصویر</span>
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'prev_policy', 'بیمه‌نامه سال قبل')}
                    />
                  </label>
                </div>

              </div>

              {/* Uploaded Files List */}
              {documents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700">مدارک انتخاب شده ({documents.length}):</h4>
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs">
                        <div className="flex items-center gap-3">
                          <img src={doc.fileUrl} alt={doc.label} className="w-10 h-10 object-cover rounded-lg border border-emerald-300" />
                          <div>
                            <p className="font-bold text-emerald-950">{doc.label}</p>
                            <p className="text-[11px] text-emerald-700">{doc.fileName} ({doc.fileSize})</p>
                          </div>
                        </div>

                        <button 
                          onClick={() => removeDoc(doc.id)}
                          className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-100"
                          title="حذف مدرک"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>بازگشت به قیمت‌دهی</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md"
                >
                  <span>مرحله بعدی: اطلاعات تماس</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: Customer Details & Final Submit */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                لطفاً اطلاعات دقیق خود را جهت تماس کارشناسان صدور بیمه ایران نمایندگی گلزار وارد نمایید.
              </div>

              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    نام و نام خانوادگی <span className="text-rose-500">*</span>:
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="مثال: علی رضایی"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    شماره همراه (دریافت کد پیگیری) <span className="text-rose-500">*</span>:
                  </label>
                  <input 
                    type="tel"
                    required
                    placeholder="مثال: 09121112233"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium text-left dir-ltr"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    کد ملی بیمه‌گذار <span className="text-rose-500">*</span>:
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="کد ۱۰ رقمی بدون خط تیره"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium text-left dir-ltr"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">استان و شهر:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg p-2.5 font-medium"
                    />
                    <input 
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg p-2.5 font-medium"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">نشانی دقیق جهت تحویل فیزیکی بیمه‌نامه:</label>
                  <textarea 
                    rows={2}
                    placeholder="آدرس، خیابان، پلاک، واحد..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-medium"
                  />
                </div>
              </div>

              {/* Order Summary Summary Box */}
              <div className="bg-emerald-950 text-white p-4 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-emerald-800 pb-2">
                  <span className="font-bold text-amber-300">خلاصه درخواست:</span>
                  <span>بیمه ایران - نمایندگی گلزار ۳۰۹۶۲</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>نوع بیمه‌نامه:</span>
                  <span className="font-bold text-emerald-200">
                    {insuranceType === 'third_party' ? 'شخص ثالث خودرو' : insuranceType === 'body' ? 'بیمه بدنه' : insuranceType === 'fire' ? 'آتش‌سوزی' : 'درمان تکمیلی'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>مبلغ برآوردی:</span>
                  <span className="font-extrabold text-amber-300 text-sm">
                    {currentQuote.finalPremiumTomans.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>تعداد مدارک پیوست:</span>
                  <span>{documents.length} فایل</span>
                </div>
              </div>

              {/* Step 3 Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>بازگشت به مدارک</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitInquiry}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>در حال ارسال اطلاعات...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-amber-300" />
                      <span>ثبت نهایی درخواست و دریافت کد پیگیری</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* STEP 4: Success & SMS Code Result */}
          {step === 4 && submittedCode && (
            <div className="text-center py-6 space-y-6 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">درخواست شما با موفقیت ثبت گردید!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  پیامک تأیید حاوی کد پیگیری به شماره <strong className="text-slate-900">{mobile}</strong> ارسال گردید. کارشناسان نمایندگی گلزار کد ۳۰۹۶۲ به زودی جهت هماهنگی با شما تماس خواهند گرفت.
                </p>
              </div>

              {/* Tracking Code Display Box */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl max-w-md mx-auto space-y-3 shadow-xl">
                <span className="text-xs text-slate-400 block font-semibold">کد پیگیری اختصاصی شما:</span>
                
                <div className="flex items-center justify-center gap-3 bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <span className="text-2xl font-black text-amber-400 font-mono tracking-wider">
                    {submittedCode}
                  </span>
                  <button 
                    onClick={() => copyToClipboard(submittedCode)}
                    className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-amber-300 transition-colors"
                    title="کپی کد"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                {copiedCode && (
                  <span className="text-[11px] text-emerald-400 block animate-pulse">کد پیگیری کپی شد!</span>
                )}
              </div>

              {/* Phone details */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-900 max-w-md mx-auto flex items-center justify-between">
                <div>
                  <p className="font-bold">تلفن پیگیری فوری دفتر نمایندگی:</p>
                  <p className="text-slate-600">{IRAN_BIMEH_AGENCY.workingHours.split('|')[0]}</p>
                </div>
                <a 
                  href={`tel:${IRAN_BIMEH_AGENCY.phone1.replace(/-/g, '')}`} 
                  className="bg-emerald-700 text-white font-bold px-3 py-2 rounded-lg"
                >
                  {IRAN_BIMEH_AGENCY.phone1}
                </a>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors"
                >
                  بستن پنجره
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
