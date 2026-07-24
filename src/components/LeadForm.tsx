/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Phone, User, CreditCard, Send, CheckCircle, ArrowRight, 
  Download, ExternalLink, Calendar, ShieldCheck 
} from 'lucide-react';
import { formatToman, toPersianDigits } from '../data/insuranceRates';

interface LeadFormProps {
  selectedInsuranceType: string;
  calculatedData: any;
  inputs: any;
  onClose: () => void;
}

export default function LeadForm({ selectedInsuranceType, calculatedData, inputs, onClose }: LeadFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    nationalCode: '',
    agreedToTerms: true,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map insurance key to Farsi label
  const getFarsiTypeLabel = (type: string) => {
    switch (type) {
      case 'third_party': return 'بیمه شخص ثالث خودرو';
      case 'hull': return 'بیمه بدنه خودرو';
      case 'fire': return 'بیمه آتش‌سوزی و زلزله ساختمان';
      case 'life': return 'بیمه پس‌انداز و سرمایه‌گذاری مان';
      case 'travel': return 'بیمه مسافرتی خارج از کشور';
      default: return 'بیمه‌نامه عمومی';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API registration of lead
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  // Build a beautiful WhatsApp text link summarizing the quote
  const getWhatsAppMessageLink = () => {
    const agencyNumber = "989123456789"; // Golzar Agency Support WhatsApp
    const typeLabel = getFarsiTypeLabel(selectedInsuranceType);
    const premiumFormatted = selectedInsuranceType === 'life' 
      ? formatToman(calculatedData.accumulatedCapital)
      : formatToman(calculatedData.finalPremium);
    
    let detailsStr = '';
    if (selectedInsuranceType === 'third_party') {
      detailsStr = `نوع وسیله: ${inputs.vehicleType === 'sedan' ? 'سواری' : 'کامیون/سایر'}\nسال ساخت: ${inputs.manufactureYear}\nسابقه تخفیف: ${inputs.noClaimYears} سال`;
    } else if (selectedInsuranceType === 'hull') {
      detailsStr = `ارزش خودرو: ${formatToman(inputs.vehicleValue)}\nسابقه تخفیف: ${inputs.noClaimYears} سال`;
    } else if (selectedInsuranceType === 'fire') {
      detailsStr = `متراژ: ${inputs.areaSqm} مترمربع\nارزش اثاثیه: ${formatToman(inputs.contentsValue)}`;
    } else if (selectedInsuranceType === 'life') {
      detailsStr = `سن بیمه‌گذار: ${inputs.age} سال\nپس‌انداز ماهانه: ${formatToman(inputs.monthlyPremium)}\nمدت: ${inputs.paymentPeriodYears} سال`;
    } else if (selectedInsuranceType === 'travel') {
      detailsStr = `سن مسافر: ${inputs.age} سال\nمدت سفر: ${inputs.durationDays} روز\nتعهد درمانی: ${inputs.coverageLimit} یورو`;
    }

    const text = `سلام و احترام نمایندگی بیمه ایران (کد ۴۴۵۶ - گلزار).\nاینجانب ${formData.fullName || 'مشتری'} مایل به استعلام و صدور نهایی بیمه‌نامه با مشخصات زیر هستم:\n\n📋 نوع بیمه: ${typeLabel}\n${detailsStr}\n\n💰 قیمت محاسبه شده در سامانه: ${premiumFormatted}\n📞 تلفن تماس من: ${formData.phoneNumber}\n\nخواهشمندم جهت تکمیل صدور با من تماس بگیرید.`;
    return `https://wa.me/${agencyNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div id="lead-submission-modal" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl max-w-xl mx-auto">
      {/* Modal Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-amber-400" size={20} />
          <h3 className="font-bold text-white text-base">پیش‌نویس صدور بیمه ایران</h3>
        </div>
        <button 
          onClick={onClose}
          className="text-xs text-blue-100 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg border border-white/10 transition cursor-pointer"
        >
          بازگشت به محاسبگر
        </button>
      </div>

      <div className="p-6 space-y-6">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Quote Draft Overview */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-[10px] text-slate-500 font-bold block">مشخصات پیش‌نویس استعلام</span>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300 font-semibold">{getFarsiTypeLabel(selectedInsuranceType)}</span>
                <span className="text-amber-400 font-black">
                  {selectedInsuranceType === 'life' 
                    ? formatToman(calculatedData.accumulatedCapital)
                    : formatToman(calculatedData.finalPremium)}
                </span>
              </div>
              <div className="text-[10px] text-slate-400/80 border-t border-slate-800/60 pt-2 flex items-center justify-between">
                <span>نمایندگی گلزار بیمه ایران - کد ۴۴۵۶</span>
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  امروز {toPersianDigits(new Date().toLocaleDateString('fa-IR'))}
                </span>
              </div>
            </div>

            {/* Input fields */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium flex items-center gap-1">
                  <User size={13} className="text-blue-400" />
                  نام و نام خانوادگی بیمه‌گذار
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="مثال: علیرضا حسینی"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium flex items-center gap-1">
                  <Phone size={13} className="text-blue-400" />
                  شماره تلفن همراه (جهت هماهنگی و ارسال SMS صدور)
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  pattern="09[0-9]{9}"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-sans text-right"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium flex items-center gap-1">
                  <CreditCard size={13} className="text-blue-400" />
                  کد ملی بیمه‌گذار (جهت استعلام سوابق و صدور در بیمه ایران)
                </label>
                <input
                  type="text"
                  name="nationalCode"
                  required
                  pattern="[0-9]{10}"
                  value={formData.nationalCode}
                  onChange={handleInputChange}
                  placeholder="کد ۱۰ رقمی بدون خط تیره"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-sans text-right"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-slate-400 select-none cursor-pointer">
              <input
                type="checkbox"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, agreedToTerms: e.target.checked }))}
                className="accent-blue-500 mt-0.5 rounded"
              />
              <span>صحت اطلاعات فوق را تایید می‌نمایم و مایل به ارسال اطلاعات به نمایندگی گلزار بیمه ایران (کد ۴۴۵۶) جهت مشاوره و صدور نهایی می‌باشم.</span>
            </label>

            {/* Submission triggers */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-800/60">
              <button
                type="submit"
                disabled={isSubmitting || !formData.agreedToTerms}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-sm"
              >
                {isSubmitting ? 'در حال ثبت پیش‌نویس...' : 'ثبت آنلاین در کارتابل گلزار'}
                <Send size={15} />
              </button>
              
              <a
                href={getWhatsAppMessageLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] text-sm text-center border border-emerald-500/20 shadow-lg shadow-emerald-600/10"
              >
                <span>ارسال مستقیم به WhatsApp</span>
                <ExternalLink size={15} />
              </a>
            </div>
          </form>
        ) : (
          /* Submission Success View */
          <div className="text-center py-6 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 mb-2">
              <CheckCircle size={36} className="animate-bounce" />
            </div>
            
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-100 text-lg">پیش‌نویس با موفقیت به ثبت رسید!</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                اطلاعات استعلام شما برای کارشناسان نمایندگی گلزار بیمه ایران (کد ۴۴۵۶) ارسال شد. همکاران ما به زودی جهت هماهنگی، تایید نهایی سوابق و صدور بیمه‌نامه با شماره همراه شما تماس خواهند گرفت.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-right max-w-sm mx-auto space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>کد رهگیری پیش‌نویس:</span>
                <span className="font-bold text-amber-400">{toPersianDigits(Math.floor(100000 + Math.random() * 900000))}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>نام بیمه‌گذار:</span>
                <span className="text-slate-200">{formData.fullName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>بیمه‌نامه مورد نظر:</span>
                <span className="text-slate-200">{getFarsiTypeLabel(selectedInsuranceType)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>مبلغ نهایی تقریبی:</span>
                <span className="text-slate-200 font-bold">
                  {selectedInsuranceType === 'life' 
                    ? formatToman(calculatedData.accumulatedCapital)
                    : formatToman(calculatedData.finalPremium)}
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
              <button
                onClick={onClose}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                بازگشت به سامانه
              </button>
              
              <button
                onClick={() => window.print()}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download size={14} />
                <span>دریافت نسخه چاپی PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
