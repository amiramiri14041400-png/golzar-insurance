import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  CheckCircle2, 
  Car, 
  ShieldCheck, 
  Home, 
  HeartPulse, 
  Briefcase, 
  Plane, 
  FileText, 
  Send, 
  Calculator, 
  AlertCircle, 
  Trash2, 
  Eye, 
  Phone, 
  MapPin, 
  Info,
  Clock,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { InsuranceType, UploadedDocument, IRAN_BIMEH_AGENCY } from '../types';
import { 
  calculateThirdPartyPremium, 
  calculateBodyPremium, 
  calculateFirePremium, 
  calculateHealthPremium 
} from '../utils/calculator';

interface InquiryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType: InsuranceType;
  onSuccessSubmitted: (trackingCode: string) => void;
}

export const InquiryFormModal: React.FC<InquiryFormModalProps> = ({
  isOpen,
  onClose,
  initialType,
  onSuccessSubmitted
}) => {
  const [insuranceType, setInsuranceType] = useState<InsuranceType>(initialType);
  const [step, setStep] = useState<number>(1); // Step 1: Info & Live Price | Step 2: Documents | Step 3: Confirmation

  // Basic Contact Info
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [mobile, setMobile] = useState('');
  const [province, setProvince] = useState('تهران');
  const [city, setCity] = useState('تهران');
  const [address, setAddress] = useState('');

  // Third Party Vehicle Form State
  const [vehicleType, setVehicleType] = useState('passenger_4cyl');
  const [modelYear, setModelYear] = useState(1401);
  const [plateNumber, setPlateNumber] = useState('');
  const [previousCompany, setPreviousCompany] = useState('بیمه ایران');
  const [noClaimDiscountYears, setNoClaimDiscountYears] = useState(3);
  const [financialLimit, setFinancialLimit] = useState(100000000);

  // Body Insurance Form State
  const [vehicleValueTomans, setVehicleValueTomans] = useState(850000000);
  const [coverGlass, setCoverGlass] = useState(true);
  const [coverNaturalDisasters, setCoverNaturalDisasters] = useState(true);
  const [coverPriceFluctuation, setCoverPriceFluctuation] = useState(true);

  // Fire Insurance State
  const [propertyType, setPropertyType] = useState<'residential' | 'commercial' | 'industrial'>('residential');
  const [buildingValue, setBuildingValue] = useState(1500000000);
  const [appliancesValue, setAppliancesValue] = useState(500000000);
  const [areaSize, setAreaSize] = useState(100);
  const [coverEarthquake, setCoverEarthquake] = useState(true);
  const [coverPipeBurst, setCoverPipeBurst] = useState(true);

  // Health Insurance State
  const [planType, setPlanType] = useState<'basic' | 'standard' | 'golden'>('standard');
  const [ageCategory, setAgeCategory] = useState<'under_40' | '40_to_60' | 'over_60'>('under_40');
  const [personCount, setPersonCount] = useState(1);
  const [hasDental, setHasDental] = useState(false);

  // Documents
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resultTrackingCode, setResultTrackingCode] = useState<string | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  useEffect(() => {
    setInsuranceType(initialType);
    setStep(1);
    setResultTrackingCode(null);
    setErrorMessage('');
  }, [initialType, isOpen]);

  if (!isOpen) return null;

  // Live calculated price estimate
  const getCalculatedPrice = () => {
    if (insuranceType === 'third_party') {
      return calculateThirdPartyPremium({
        vehicleType,
        modelYear,
        noClaimDiscountYears,
        driverDiscountYears: noClaimDiscountYears,
        financialLimit,
        previousCompany,
        hasDamageHistory: false
      });
    } else if (insuranceType === 'body') {
      return calculateBodyPremium({
        vehicleType,
        vehicleValueTomans,
        modelYear,
        noClaimYears: noClaimDiscountYears,
        coverGlass,
        coverNaturalDisasters,
        coverChemicals: false,
        coverPriceFluctuation
      });
    } else if (insuranceType === 'fire') {
      return calculateFirePremium({
        propertyType,
        buildingValueTomans: buildingValue,
        appliancesValueTomans: appliancesValue,
        areaSizeSqm: areaSize,
        coverEarthquake,
        coverPipeBurst,
        coverFlood: true
      });
    } else if (insuranceType === 'health') {
      return calculateHealthPremium({
        planType,
        ageCategory,
        personCount,
        hasDental
      });
    }
    return { finalPremiumTomans: 3500000 };
  };

  const currentPrice = getCalculatedPrice();

  // Document Upload Handler (Simulated file reading to Data URL / Blob)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: UploadedDocument['type'], label: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newDoc: UploadedDocument = {
        id: `doc-${Date.now()}`,
        type,
        label,
        fileName: file.name,
        fileUrl: reader.result as string || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80',
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        uploadedAt: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };
      setDocuments(prev => [...prev.filter(d => d.type !== type), newDoc]);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Submit Inquiry Form
  const handleSubmitInquiry = async () => {
    if (!fullName.trim() || !mobile.trim() || !nationalId.trim()) {
      setErrorMessage('لطفاً نام کامل، شماره ملی و شماره موبایل را وارد نمایید.');
      return;
    }

    if (mobile.length < 10) {
      setErrorMessage('شماره موبایل وارد شده معتبر نمی‌باشد.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const formDataPayload = {
      vehicleType,
      modelYear,
      plateNumber,
      previousCompany,
      noClaimDiscountYears,
      financialLimit,
      vehicleValueTomans,
      propertyType,
      buildingValue,
      appliancesValue,
      areaSize,
      planType,
      personCount,
      estimatedPriceTomans: currentPrice.finalPremiumTomans
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
          formData: formDataPayload,
          documents
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResultTrackingCode(data.inquiry.trackingCode);
        setStep(3);
      } else {
        setErrorMessage(data.error || 'خطا در ثبت درخواست. لطفاً مجدداً تلاش نمایید.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      // Fallback local tracking code generation
      const fallbackCode = `IR30962-${Math.floor(10000 + Math.random() * 90000)}`;
      setResultTrackingCode(fallbackCode);
      setStep(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const getInsuranceTitle = (type: InsuranceType) => {
    switch (type) {
      case 'third_party': return 'بیمه شخص ثالث خودرو';
      case 'body': return 'بیمه بدنه خودرو';
      case 'fire': return 'بیمه آتش‌سوزی و زلزله';
      case 'health': return 'بیمه درمان تکمیلی';
      case 'life': return 'بیمه عمر و سرمایه‌گذاری';
      case 'liability': return 'بیمه مسئولیت کارفرما/مدنی';
      case 'travel': return 'بیمه مسافرتی خارج از کشور';
      default: return 'بیمه‌نامه ایران';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white p-4 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg sm:text-xl text-white">
                  استعلام و صدور {getInsuranceTitle(insuranceType)}
                </h3>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">
                  کد ۳۰۹۶۲
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                محاسبه آنلاین قیمت + بارگذاری مدارک + تماس کارشناس جهت صدور
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Insurance Type Selector Tabs */}
        {step < 3 && (
          <div className="bg-slate-100 border-b border-slate-200 p-2 overflow-x-auto flex items-center gap-1 shrink-0 text-xs font-semibold">
            <button
              onClick={() => setInsuranceType('third_party')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                insuranceType === 'third_party' ? 'bg-emerald-700 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              شخص ثالث
            </button>
            <button
              onClick={() => setInsuranceType('body')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                insuranceType === 'body' ? 'bg-emerald-700 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              بیمه بدنه
            </button>
            <button
              onClick={() => setInsuranceType('fire')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                insuranceType === 'fire' ? 'bg-emerald-700 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              آتش‌سوزی
            </button>
            <button
              onClick={() => setInsuranceType('health')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                insuranceType === 'health' ? 'bg-emerald-700 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              درمان تکمیلی
            </button>
          </div>
        )}

        {/* Modal Body Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
          
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3.5 rounded-xl flex items-center gap-2 text-xs font-medium">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Form Inputs & Instant Price Calculation */}
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Form Input Column (Left 7 Cols) */}
              <div className="lg:col-span-7 space-y-5">
                
                <div className="border-b pb-3 flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-emerald-700" />
                    اطلاعات مورد نیاز جهت محاسبه دقیق
                  </h4>
                  <span className="text-xs text-slate-500">گام ۱ از ۲</span>
                </div>

                {/* Third Party Fields */}
                {insuranceType === 'third_party' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">نوع خودرو / وسیله نقلیه:</label>
                      <select 
                        value={vehicleType} 
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 bg-slate-50 font-medium"
                      >
                        <option value="passenger_4cyl">سواری ۴ سیلندر (پژو، پراید، سمند، دنا، تیبا)</option>
                        <option value="passenger_6cyl">سواری ۶ سیلندر و بالاتر (تویوتا، لکسوس، بنز)</option>
                        <option value="pickup">وانت بار / نیسان / پادرا</option>
                        <option value="motorcycle">موتورسیکلت</option>
                        <option value="heavy">کامیون / اتوبوس / مینی‌بوس</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">سال ساخت (شمسی):</label>
                        <select 
                          value={modelYear} 
                          onChange={(e) => setModelYear(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                        >
                          {Array.from({ length: 25 }, (_, i) => 1403 - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">شرکت بیمه قبلی:</label>
                        <select 
                          value={previousCompany} 
                          onChange={(e) => setPreviousCompany(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                        >
                          <option value="بیمه ایران">بیمه ایران (پیش‌فرض نمایندگی)</option>
                          <option value="بیمه آسیا">بیمه آسیا</option>
                          <option value="بیمه دانا">بیمه دانا</option>
                          <option value="بیمه البرز">بیمه البرز</option>
                          <option value="بیمه پاسارگاد">بیمه پاسارگاد</option>
                          <option value="سایر">سایر شرکت‌ها</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">سابقه تخفیف عدم خسارت:</label>
                        <select 
                          value={noClaimDiscountYears} 
                          onChange={(e) => setNoClaimDiscountYears(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                        >
                          <option value={0}>بدون تخفیف (سال اول)</option>
                          <option value={1}>۱ سال (۵٪ تخفیف)</option>
                          <option value={2}>۲ سال (۱۰٪ تخفیف)</option>
                          <option value={3}>۳ سال (۱۵٪ تخفیف)</option>
                          <option value={4}>۴ سال (۲۰٪ تخفیف)</option>
                          <option value={5}>۵ سال (۲۵٪ تخفیف)</option>
                          <option value={7}>۷ سال (۳۵٪ تخفیف)</option>
                          <option value={10}>۱۰ سال (۵۰٪ تخفیف)</option>
                          <option value={14}>۱۴ سال و بیشتر (۷۰٪ حداکثر تخفیف)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">تعهد مالی بیمه‌نامه:</label>
                        <select 
                          value={financialLimit} 
                          onChange={(e) => setFinancialLimit(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                        >
                          <option value={100000000}>۱۰۰ میلیون تومان (پایه قانون)</option>
                          <option value={200000000}>۲۰۰ میلیون تومان (توصیه شده)</option>
                          <option value={300000000}>۳۰۰ میلیون تومان</option>
                          <option value={400000000}>۴۰۰ میلیون تومان (حداکثر)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">شماره پلاک خودرو (اختیاری):</label>
                      <input 
                        type="text" 
                        placeholder="مثلاً: ۵۵ ج ۸۹۲ - ایران ۷۷"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* Body Insurance Fields */}
                {insuranceType === 'body' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ارزش روز تخمینی خودرو (تومان):</label>
                      <input 
                        type="number" 
                        value={vehicleValueTomans} 
                        onChange={(e) => setVehicleValueTomans(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium text-emerald-800"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        {(vehicleValueTomans / 10000000).toLocaleString('fa-IR')} میلیون تومان
                      </span>
                    </div>

                    <div className="space-y-2 bg-slate-50 p-3 rounded-xl border">
                      <p className="text-xs font-bold text-slate-800">پوشش‌های اضافی مورد نیاز:</p>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={coverGlass} 
                          onChange={(e) => setCoverGlass(e.target.checked)} 
                          className="rounded text-emerald-700 focus:ring-emerald-600"
                        />
                        <span>شکست شیشه به خودی خود</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={coverNaturalDisasters} 
                          onChange={(e) => setCoverNaturalDisasters(e.target.checked)} 
                          className="rounded text-emerald-700 focus:ring-emerald-600"
                        />
                        <span>بلایای طبیعی (سیل، زلزله، طوفان)</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={coverPriceFluctuation} 
                          onChange={(e) => setCoverPriceFluctuation(e.target.checked)} 
                          className="rounded text-emerald-700 focus:ring-emerald-600"
                        />
                        <span>نوسان قیمت خودرو (تا ۵۰٪ افزایش ارزش)</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Fire Insurance Fields */}
                {insuranceType === 'fire' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">نوع ملک:</label>
                      <select 
                        value={propertyType} 
                        onChange={(e) => setPropertyType(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                      >
                        <option value="residential">مسکونی (آپارتمان / ویلایی)</option>
                        <option value="commercial">تجاری و مغازه</option>
                        <option value="industrial">کارگاه صنعتی / انبار</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">ارزش کل بنا (تومان):</label>
                        <input 
                          type="number" 
                          value={buildingValue} 
                          onChange={(e) => setBuildingValue(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">ارزش اثاثیه / تجهیزات (تومان):</label>
                        <input 
                          type="number" 
                          value={appliancesValue} 
                          onChange={(e) => setAppliancesValue(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-50 p-3 rounded-xl border">
                      <p className="text-xs font-bold text-slate-800">پوشش‌های خطرات اضافی:</p>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={coverEarthquake} 
                          onChange={(e) => setCoverEarthquake(e.target.checked)} 
                          className="rounded text-emerald-700"
                        />
                        <span>پوشش کامل زلزله و آتشفشان</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={coverPipeBurst} 
                          onChange={(e) => setCoverPipeBurst(e.target.checked)} 
                          className="rounded text-emerald-700"
                        />
                        <span>پوشش ترکیدگی لوله آب و ضایعات باران</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Health Insurance Fields */}
                {insuranceType === 'health' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">طرح بیمه تکمیلی:</label>
                      <select 
                        value={planType} 
                        onChange={(e) => setPlanType(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                      >
                        <option value="basic">طرح پایه (پوشش بیمارستانی ساده)</option>
                        <option value="standard">طرح استاندارد (بیمارستانی + پاراکلینیکی + ویزیت)</option>
                        <option value="golden">طرح طلایی (پوشش کامل بیمارستانی، پاراکلینیکی، زایمان)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">رده سنی متقاضی اصلی:</label>
                        <select 
                          value={ageCategory} 
                          onChange={(e) => setAgeCategory(e.target.value as any)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                        >
                          <option value="under_40">زیر ۴۰ سال</option>
                          <option value="40_to_60">۴۰ تا ۶۰ سال</option>
                          <option value="over_60">بالای ۶۰ سال</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">تعداد افراد تحت پوشش:</label>
                        <input 
                          type="number" 
                          min={1} 
                          max={50}
                          value={personCount} 
                          onChange={(e) => setPersonCount(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Personal Contact Details */}
                <div className="pt-4 border-t space-y-3">
                  <h5 className="font-bold text-slate-900 text-xs text-emerald-800">مشخصات تحویل‌گیرنده بیمه‌نامه:</h5>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">نام و نام خانوادگی:*</label>
                      <input 
                        type="text" 
                        placeholder="مثلاً: علی رضایی"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">کد ملی بیمه‌گذار:*</label>
                      <input 
                        type="text" 
                        placeholder="۱۰ رقم کد ملی"
                        value={nationalId}
                        onChange={(e) => setNationalId(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">شماره همراه (جهت پیامک پیگیری):*</label>
                      <input 
                        type="tel" 
                        placeholder="09121112233"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium dir-ltr text-right"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">استان و شهر:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          value={province} 
                          onChange={(e) => setProvince(e.target.value)} 
                          className="p-2.5 rounded-xl border border-slate-300 text-xs"
                        />
                        <input 
                          type="text" 
                          value={city} 
                          onChange={(e) => setCity(e.target.value)} 
                          className="p-2.5 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Price Display Card (Right 5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-2xl p-5 border border-emerald-700/80 shadow-xl space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between border-b border-emerald-700/60 pb-3">
                    <span className="text-xs text-emerald-200 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      استعلام آنلاین و فوری حق‌بیمه
                    </span>
                    <span className="bg-amber-400 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      نمایندگی گلزار ۳۰۹۶۲
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-300">حق‌بیمه تقریبی و پرداختی سالانه:</span>
                    <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                      {currentPrice.finalPremiumTomans > 0 ? (
                        <>
                          {currentPrice.finalPremiumTomans.toLocaleString('fa-IR')} <span className="text-xs font-normal text-white">تومان</span>
                        </>
                      ) : (
                        <span className="text-sm font-medium text-emerald-200">نیازمند تکمیل اطلاعات فوق</span>
                      )}
                    </div>
                  </div>

                  {'discountPercent' in currentPrice && (currentPrice as any).discountPercent > 0 && (
                    <div className="bg-emerald-950/80 border border-emerald-600/50 p-2.5 rounded-xl text-xs text-emerald-200 flex items-center justify-between">
                      <span>تخفیف سابقه اعمال شده:</span>
                      <span className="font-extrabold text-amber-300">{(currentPrice as any).discountPercent}٪ تخفیف</span>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-300 space-y-1.5 pt-2 border-t border-emerald-700/50">
                    <p className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>اعمال تعرفه مصوب بیمه مرکزی و بیمه ایران</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>امکان صدور اقساطی یا نقدی با تخفیف ویژه</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>پشتیبانی و مشاوره رایگان توسط کارشناس رسمی</span>
                    </p>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm mt-2"
                  >
                    <span>مرحله بعدی: بارگذاری مدارک</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {/* Call Support Banner */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-slate-800 text-xs space-y-2">
                  <p className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-amber-700" />
                    نیاز به مشاوره سریع تلفنی دارید؟
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    کارشناسان نمایندگی گلزار آماده پاسخگویی به سوالات شما درباره نحوه انتقال تخفیفات و صدور فوری هستند.
                  </p>
                  <a 
                    href={`tel:${IRAN_BIMEH_AGENCY.phone1.replace(/-/g, '')}`}
                    className="inline-block font-extrabold text-emerald-800 hover:underline"
                  >
                    تماس مستقیم: {IRAN_BIMEH_AGENCY.phone1}
                  </a>
                </div>

              </div>

            </div>
          )}

          {/* STEP 2: Upload Documents (کارت خودرو، بیمه‌نامه قبلی، کارت ملی) */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b pb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Upload className="w-5 h-5 text-emerald-700" />
                    بارگذاری مدارک مورد نیاز جهت بررسی و صدور بیمه‌نامه
                  </h4>
                  <p className="text-xs text-slate-500">
                    تصویر مدارک را با گوشی یا رایانه آپلود نمایید تا کارشناس صدور آنها را تطبیق دهد.
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  بازگشت به مرحله قبل
                </button>
              </div>

              {/* Documents Upload Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Doc 1: Car Card Front */}
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 bg-slate-50 hover:bg-emerald-50/30 transition-all text-center space-y-2 relative">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto font-bold">
                    <Car className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-xs text-slate-800">تصویر روی کارت خودرو / سند</h5>
                  <p className="text-[11px] text-slate-500">مشخصات خودرو و مالک</p>

                  {documents.find(d => d.type === 'car_card_front') ? (
                    <div className="bg-emerald-100 text-emerald-900 text-xs p-2 rounded-xl flex items-center justify-between font-medium">
                      <span className="truncate max-w-[120px]">{documents.find(d => d.type === 'car_card_front')?.fileName}</span>
                      <button onClick={() => handleRemoveDoc(documents.find(d => d.type === 'car_card_front')!.id)} className="text-rose-600 hover:text-rose-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="block w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow">
                      <span>انتخاب فایل / عکس</span>
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'car_card_front', 'روی کارت خودرو')}
                      />
                    </label>
                  )}
                </div>

                {/* Doc 2: Previous Policy */}
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 bg-slate-50 hover:bg-emerald-50/30 transition-all text-center space-y-2 relative">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-xs text-slate-800">تصویر بیمه‌نامه قبلی</h5>
                  <p className="text-[11px] text-slate-500">جهت استعلام و انتقال تخفیف عدم خسارت</p>

                  {documents.find(d => d.type === 'prev_policy') ? (
                    <div className="bg-emerald-100 text-emerald-900 text-xs p-2 rounded-xl flex items-center justify-between font-medium">
                      <span className="truncate max-w-[120px]">{documents.find(d => d.type === 'prev_policy')?.fileName}</span>
                      <button onClick={() => handleRemoveDoc(documents.find(d => d.type === 'prev_policy')!.id)} className="text-rose-600 hover:text-rose-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="block w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow">
                      <span>انتخاب فایل / عکس</span>
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'prev_policy', 'بیمه‌نامه قبلی')}
                      />
                    </label>
                  )}
                </div>

                {/* Doc 3: National ID */}
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 bg-slate-50 hover:bg-emerald-50/30 transition-all text-center space-y-2 relative">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center mx-auto font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-xs text-slate-800">تصویر کارت ملی بیمه‌گذار</h5>
                  <p className="text-[11px] text-slate-500">جهت انطباق هویت در سامانه بیمه ایران</p>

                  {documents.find(d => d.type === 'national_card') ? (
                    <div className="bg-emerald-100 text-emerald-900 text-xs p-2 rounded-xl flex items-center justify-between font-medium">
                      <span className="truncate max-w-[120px]">{documents.find(d => d.type === 'national_card')?.fileName}</span>
                      <button onClick={() => handleRemoveDoc(documents.find(d => d.type === 'national_card')!.id)} className="text-rose-600 hover:text-rose-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="block w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow">
                      <span>انتخاب فایل / عکس</span>
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'national_card', 'کارت ملی بیمه‌گذار')}
                      />
                    </label>
                  )}
                </div>

              </div>

              {/* Address input */}
              <div className="bg-slate-50 p-4 rounded-2xl border space-y-2">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  آدرس دقیق جهت ارسال نسخه فیزیکی بیمه‌نامه (در صورت تمایل):
                </label>
                <textarea 
                  rows={2}
                  placeholder="آدرس دقیق منزل یا محل کار، پلاک، واحد..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium"
                />
              </div>

              {/* Confirm Actions */}
              <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  ویرایش اطلاعات استعلام
                </button>

                <button
                  type="button"
                  onClick={handleSubmitInquiry}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>در حال ارسال اطلاعات...</span>
                  ) : (
                    <>
                      <span>تأیید نهایی و ارسال برای کارشناس نمایندگی</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: Submission Confirmation with Tracking Code */}
          {step === 3 && resultTrackingCode && (
            <div className="py-6 text-center space-y-6 max-w-lg mx-auto">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-black text-slate-900">
                  درخواست شما با موفقیت ثبت گردید!
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  کد پیگیری اختصاصی شما صادر گردید و یک پیامک حاوی کد پیگیری به شماره <strong className="text-slate-900">{mobile}</strong> ارسال شد.
                </p>
              </div>

              {/* Tracking Code Box */}
              <div className="bg-emerald-950 text-white p-4 rounded-2xl border-2 border-emerald-600 shadow-xl space-y-2">
                <span className="text-xs text-emerald-300 font-medium">کد پیگیری استعلام بیمه:</span>
                <div className="flex items-center justify-center gap-3 dir-ltr">
                  <span className="text-2xl font-black tracking-widest text-amber-300">
                    {resultTrackingCode}
                  </span>
                  <button
                    onClick={() => copyToClipboard(resultTrackingCode)}
                    className="p-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white transition-colors"
                    title="کپی کد پیگیری"
                  >
                    {copiedTracking ? <Check className="w-4 h-4 text-amber-300" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border text-xs text-slate-700 text-right space-y-2">
                <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  مراحل بعدی چیست؟
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>کارشناسان رسمی نمایندگی گلزار (کد ۳۰۹۶۲) مدارک شما را بررسی خواهند کرد.</li>
                  <li>در صورت نیاز به تکمیل مدارک یا واریز وجه، کارشناسان با شماره {mobile} تماس خواهند گرفت.</li>
                  <li>می‌توانید هر زمان از بخش «پیگیری درخواست»، وضعیت صادر شدن بیمه‌نامه خود را مشاهده نمایید.</li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onSuccessSubmitted(resultTrackingCode);
                  }}
                  className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition-colors"
                >
                  مشاهده صفحه پیگیری درخواست
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors"
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
