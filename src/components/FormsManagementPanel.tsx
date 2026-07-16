import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings2, 
  Eye, 
  FileText, 
  FileCheck, 
  Info, 
  Check, 
  CheckSquare, 
  Square, 
  HelpCircle,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { InsuranceType } from '../types';

interface CustomField {
  id: string;
  insuranceType: string;
  label: string;
  type: 'file_image_or_pdf' | 'file_image' | 'file_pdf' | 'text' | 'number' | 'select';
  required: boolean;
  digitCount?: number;
  placeholder?: string;
  options?: string[];
  createdAt: string;
}

export const FormsManagementPanel: React.FC = () => {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<InsuranceType>('third_party');

  // New Field Form State
  const [label, setLabel] = useState('');
  const [fieldType, setFieldType] = useState<'file_image_or_pdf' | 'file_image' | 'file_pdf' | 'text' | 'number' | 'select'>('file_image_or_pdf');
  const [required, setRequired] = useState(true);
  const [digitCount, setDigitCount] = useState<number | ''>('');
  const [placeholder, setPlaceholder] = useState('');
  const [optionsStr, setOptionsStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchFields = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/custom-fields');
      if (res.ok) {
        const data = await res.json();
        setFields(data);
      }
    } catch (err) {
      console.error('Error fetching custom fields:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!label.trim()) {
      setErrorMsg('عنوان فیلد الزامی است.');
      return;
    }

    setIsSubmitting(true);

    const options = fieldType === 'select' 
      ? optionsStr.split(',').map(s => s.trim()).filter(Boolean) 
      : undefined;

    try {
      const res = await fetch('/api/custom-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insuranceType: selectedType,
          label: label.trim(),
          type: fieldType,
          required,
          digitCount: digitCount || undefined,
          placeholder: placeholder.trim(),
          options
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`فیلد "${label}" با موفقیت ایجاد شد.`);
        // Reset form
        setLabel('');
        setRequired(true);
        setDigitCount('');
        setPlaceholder('');
        setOptionsStr('');
        fetchFields();
      } else {
        setErrorMsg(data.error || 'خطا در ثبت فیلد جدید.');
      }
    } catch (err) {
      setErrorMsg('خطا در ارتباط با سرور.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteField = async (id: string, name: string) => {
    if (!window.confirm(`آیا از حذف فیلد "${name}" اطمینان دارید؟`)) {
      return;
    }

    try {
      const res = await fetch(`/api/custom-fields/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('فیلد با موفقیت حذف شد.');
        fetchFields();
      } else {
        alert(data.error || 'خطا در حذف فیلد.');
      }
    } catch (err) {
      alert('خطا در ارتباط با سرور.');
    }
  };

  // Filter fields for selected insurance type
  const activeFields = fields.filter(f => f.insuranceType === selectedType);

  const getInsuranceTypeName = (type: InsuranceType) => {
    switch (type) {
      case 'third_party': return 'بیمه شخص ثالث خودرو';
      case 'body': return 'بیمه بدنه خودرو';
      case 'fire': return 'بیمه آتش‌سوزی و زلزله';
      case 'health': return 'بیمه درمان تکمیلی';
      case 'life': return 'بیمه عمر و سرمایه‌گذاری';
      case 'liability': return 'بیمه مسئولیت مدنی';
      case 'travel': return 'بیمه مسافرتی';
      default: return type;
    }
  };

  const getFieldTypeBadge = (type: CustomField['type']) => {
    switch (type) {
      case 'file_image_or_pdf': return { label: 'فایل (تصویر یا PDF)', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'file_image': return { label: 'فایل (فقط عکس)', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'file_pdf': return { label: 'فایل (فقط PDF)', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'text': return { label: 'متن متنی (کارتیمی)', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'number': return { label: 'عددی', color: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'select': return { label: 'لیست چند گزینه‌ای', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default: return { label: type, color: 'bg-slate-50 text-slate-700' };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-right dir-rtl font-sans">
      
      {/* Selector Side - Insurance Line Category selection */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 mb-4 tracking-wider uppercase">رشته‌های بیمه‌ای</h3>
          <div className="space-y-1.5">
            {([
              'third_party',
              'body',
              'fire',
              'health',
              'life',
              'liability',
              'travel'
            ] as InsuranceType[]).map((type) => {
              const isActive = selectedType === type;
              const count = fields.filter(f => f.insuranceType === type).length;
              return (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-emerald-900 text-white shadow-md' 
                      : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <span>{getInsuranceTypeName(type)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {count} فیلد
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-150 p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-950">
            <Info className="w-5 h-5 text-amber-600 shrink-0" />
            <h4 className="text-xs font-bold">راهنمای فیلدهای اختصاصی</h4>
          </div>
          <p className="text-[11px] text-amber-900 leading-relaxed">
            فیلدهایی که در این بخش تعریف می‌کنید، به‌صورت خودکار در فرم تکمیل پرونده مشتری نمایان خواهند شد. 
            فیلدهای فایل در بخش بارگذاری مدارک (مرحله ۲) و فیلدهای متنی/عددی در بخش اطلاعات تکمیلی (مرحله ۱ یا ۳) گنجانده می‌شوند.
          </p>
        </div>
      </div>

      {/* Center Side - Configured fields list & Add new field form */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Dynamic Fields List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-800">
                فیلدهای اختصاصی {getInsuranceTypeName(selectedType)}
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              تعداد: {activeFields.length} ردیف
            </span>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500">در حال بارگذاری فیلدها...</div>
            ) : activeFields.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <p>هیچ فیلد اختصاصی برای این رشته بیمه تعریف نشده است.</p>
                <p className="text-[10px]">شما می‌توانید از فرم زیر برای افزودن ردیف‌های مدارک یا فیلدهای مورد نیاز مشتری استفاده کنید.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeFields.map((field) => {
                  const badge = getFieldTypeBadge(field.type);
                  return (
                    <div key={field.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900">{field.label}</span>
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${badge.color}`}>
                            {badge.label}
                          </span>
                          {field.required && (
                            <span className="bg-rose-50 text-rose-700 border border-rose-100 px-1.5 py-0.5 rounded text-[9px] font-bold">
                              ضروری
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{field.placeholder || 'بدون راهنما'}</p>
                        {field.digitCount && (
                          <p className="text-[10px] text-slate-600 font-bold">
                            ⚠️ محدودیت تعداد ارقام: {field.digitCount} رقم
                          </p>
                        )}
                        {field.options && field.options.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-1">
                            <span className="text-[10px] text-slate-500">گزینه‌ها:</span>
                            {field.options.map((opt, i) => (
                              <span key={i} className="bg-slate-150 px-1.5 py-0.5 rounded text-[9px] text-slate-700">
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteField(field.id, field.label)}
                        className="text-rose-600 hover:text-rose-800 p-2 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                        title="حذف فیلد"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Add New Field Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Plus className="w-5 h-5 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">افزودن فیلد یا ردیف مدارک جدید</h3>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAddField} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">عنوان فیلد / ردیف مدرک *:</label>
                <input 
                  type="text"
                  required
                  placeholder="مثال: تصویر سند مالکیت، کدملی همسر"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">نوع فیلد ورودی *:</label>
                <select
                  value={fieldType}
                  onChange={(e) => {
                    setFieldType(e.target.value as any);
                    setDigitCount('');
                    setOptionsStr('');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-emerald-700 focus:bg-white font-bold"
                >
                  <option value="file_image_or_pdf">فایل آپلود (عکس یا PDF)</option>
                  <option value="file_image">فایل آپلود (فقط عکس JPG/PNG)</option>
                  <option value="file_pdf">فایل آپلود (فقط PDF)</option>
                  <option value="text">کادر متنی (حروف یا اعداد)</option>
                  <option value="number">عدد (کد ملی، کد پستی، موبایل)</option>
                  <option value="select">لیست چند گزینه‌ای (کشویی)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1.5">راهنمای تکمیل فیلد (Placeholder):</label>
                <input 
                  type="text"
                  placeholder="مثال: تصویر خوانا بدون حاشیه سیاه یا برش خورده"
                  value={placeholder}
                  onChange={(e) => setPlaceholder(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-emerald-700 focus:bg-white"
                />
              </div>

              {/* Conditional options for Dropdown */}
              {fieldType === 'select' && (
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1.5">گزینه‌های لیست (با کاما انگلیسی جدا کنید):</label>
                  <input 
                    type="text"
                    placeholder="مثال: گزینه‌ ۱, گزینه ۲, گزینه ۳"
                    value={optionsStr}
                    onChange={(e) => setOptionsStr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-emerald-700 focus:bg-white font-medium"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">تک تک گزینه‌ها را با علامت ',' از هم جدا کنید.</p>
                </div>
              )}

              {/* Conditional fields based on type */}
              {(fieldType === 'number' || fieldType === 'text') && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">تعداد دقیق ارقام ورودی (اختیاری):</label>
                  <input 
                    type="number"
                    min={1}
                    max={20}
                    placeholder="مثال: 10 برای کدملی"
                    value={digitCount}
                    onChange={(e) => setDigitCount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-emerald-700 focus:bg-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">برای اعتبارسنجی طول وارد شده استفاده می‌شود.</p>
                </div>
              )}

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input 
                    type="checkbox"
                    checked={required}
                    onChange={(e) => setRequired(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                  />
                  <span>تکمیل این فیلد برای مشتری اجباری باشد</span>
                </label>
              </div>

            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 text-white font-bold p-3 rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'در حال ثبت فیلد...' : 'افزودن و پیوند به فرم مشتری'}</span>
            </button>
          </form>
        </div>

      </div>

      {/* Right Side - Live Form Simulator */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-lg space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-amber-400 text-slate-950 px-3 py-1 rounded-br-2xl text-[9px] font-black tracking-widest uppercase">
            شبیه‌ساز زنده
          </div>
          
          <div className="border-b border-slate-800 pb-3 pt-2">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-400" />
              نمای زنده فرم مشتری
            </h4>
            <p className="text-[10px] text-slate-500 mt-1">فرم نهایی در رشته {getInsuranceTypeName(selectedType)}</p>
          </div>

          <div className="space-y-4 text-[11px] font-medium">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-500 block">مشخصات اصلی بیمه ایران</span>
              <p className="text-white text-xs font-bold">بیمه‌نامه {getInsuranceTypeName(selectedType)}</p>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-2/3"></div>
              </div>
            </div>

            {/* Simulated Input Fields */}
            {activeFields.filter(f => f.type === 'text' || f.type === 'number' || f.type === 'select').length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] text-amber-400 font-bold block border-b border-slate-800 pb-1">اطلاعات تکمیلی الزامی:</span>
                {activeFields.filter(f => f.type === 'text' || f.type === 'number' || f.type === 'select').map((f) => (
                  <div key={f.id} className="space-y-1">
                    <label className="block text-slate-300">
                      {f.label} {f.required && <span className="text-rose-500">*</span>}
                    </label>
                    {f.type === 'select' ? (
                      <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-300">
                        {f.options && f.options.map((opt, i) => (
                          <option key={i}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        type={f.type === 'number' ? 'number' : 'text'}
                        disabled
                        placeholder={f.placeholder || `محل درج ${f.label}`}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-400 placeholder:text-slate-600 outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Simulated File Uploads */}
            {activeFields.filter(f => f.type.startsWith('file')).length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[10px] text-amber-400 font-bold block border-b border-slate-800 pb-1">مدارک و ضمائم اختصاصی:</span>
                {activeFields.filter(f => f.type.startsWith('file')).map((f) => (
                  <div key={f.id} className="border border-dashed border-slate-800 rounded-xl p-3 text-center bg-slate-950/40">
                    <p className="text-xs text-slate-300 font-bold mb-1">{f.label} {f.required && <span className="text-rose-500">*</span>}</p>
                    <p className="text-[9px] text-slate-600 mb-2">{f.placeholder || 'بارگذاری فایل عکس یا PDF'}</p>
                    <div className="inline-block bg-slate-800 text-[10px] text-slate-300 font-bold px-3 py-1 rounded border border-slate-700">
                      انتخاب فایل
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeFields.length === 0 && (
              <div className="text-center py-8 text-slate-600 text-xs">
                فیلد اختصاصی اضافه کنید تا پیش‌نمایش آن در اینجا ظاهر شود.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
