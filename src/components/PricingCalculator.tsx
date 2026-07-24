/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Car, Home, TrendingUp, Plane, CheckCircle2, 
  HelpCircle, ChevronLeft, ArrowRight, Sparkles, AlertCircle, FileText, Share2 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar 
} from 'recharts';
import { 
  calculateThirdParty, calculateHull, calculateFire, calculateLife, calculateTravel,
  formatToman, formatRial, toPersianDigits, THIRD_PARTY_FINANCIAL_OPTIONS 
} from '../data/insuranceRates';
import { ThirdPartyInput, HullInput, FireInput, LifeInput, TravelInput, InsuranceType } from '../types';

interface PricingCalculatorProps {
  onPreferencesChange: (preferences: any) => void;
  onSelectQuote: (insuranceType: string, calculatedData: any, inputs: any) => void;
}

export default function PricingCalculator({ onPreferencesChange, onSelectQuote }: PricingCalculatorProps) {
  const [activeTab, setActiveTab] = useState<InsuranceType>('third_party');

  // -----------------------------------------
  // THIRD PARTY STATE
  // -----------------------------------------
  const [thirdPartyInput, setThirdPartyInput] = useState<ThirdPartyInput>({
    vehicleType: 'sedan',
    cylinders: '4cyl_under_1500',
    manufactureYear: 1400,
    noClaimYears: 5,
    previousAccidents: 'none',
    financialCoverage: 1000000000,
  });
  const [thirdPartyOutput, setThirdPartyOutput] = useState<any>(null);

  // -----------------------------------------
  // HULL STATE
  // -----------------------------------------
  const [hullInput, setHullInput] = useState<HullInput>({
    vehicleValue: 1200000000, // 1.2 Billion Rials (120 Million Tomans)
    vehicleType: 'sedan',
    manufactureYear: 1400,
    noClaimYears: 3,
    selectedAddons: ['theft_parts', 'glass_breakage'],
  });
  const [hullOutput, setHullOutput] = useState<any>(null);

  // -----------------------------------------
  // FIRE STATE
  // -----------------------------------------
  const [fireInput, setFireInput] = useState<FireInput>({
    propertyType: 'apartment',
    constructionType: 'concrete_steel',
    areaSqm: 85,
    costPerSqm: 180000000, // 18 Million Tomans per Sqm
    contentsValue: 1500000000, // 150 Million Tomans contents
    selectedAddons: ['earthquake', 'pipe_burst', 'neighbor_liability'],
  });
  const [fireOutput, setFireOutput] = useState<any>(null);

  // -----------------------------------------
  // LIFE STATE
  // -----------------------------------------
  const [lifeInput, setLifeInput] = useState<LifeInput>({
    age: 30,
    monthlyPremium: 5000000, // 500k Tomans (5 million Rials)
    paymentPeriodYears: 20,
    annualPremiumIncrease: 15,
    inflationTarget: 25,
  });
  const [lifeOutput, setLifeOutput] = useState<any>(null);

  // -----------------------------------------
  // TRAVEL STATE
  // -----------------------------------------
  const [travelInput, setTravelInput] = useState<TravelInput>({
    age: 28,
    durationDays: 15,
    destinationZone: 'zone1',
    coverageLimit: 30000,
  });
  const [travelOutput, setTravelOutput] = useState<any>(null);

  // -----------------------------------------
  // EFFECTS TO UPDATE OUTPUT AND TRIGGER PROP CHANGES
  // -----------------------------------------
  useEffect(() => {
    const output = calculateThirdParty(thirdPartyInput);
    setThirdPartyOutput(output);
    if (activeTab === 'third_party') {
      onPreferencesChange({ type: 'third_party', ...thirdPartyInput, calculatedPremium: output.finalPremium });
    }
  }, [thirdPartyInput, activeTab]);

  useEffect(() => {
    const output = calculateHull(hullInput);
    setHullOutput(output);
    if (activeTab === 'hull') {
      onPreferencesChange({ type: 'hull', ...hullInput, calculatedPremium: output.finalPremium });
    }
  }, [hullInput, activeTab]);

  useEffect(() => {
    const output = calculateFire(fireInput);
    setFireOutput(output);
    if (activeTab === 'fire') {
      onPreferencesChange({ type: 'fire', ...fireInput, calculatedPremium: output.finalPremium });
    }
  }, [fireInput, activeTab]);

  useEffect(() => {
    const output = calculateLife(lifeInput);
    setLifeOutput(output);
    if (activeTab === 'life') {
      onPreferencesChange({ type: 'life', ...lifeInput, calculatedPremium: output.accumulatedCapital });
    }
  }, [lifeInput, activeTab]);

  useEffect(() => {
    const output = calculateTravel(travelInput);
    setTravelOutput(output);
    if (activeTab === 'travel') {
      onPreferencesChange({ type: 'travel', ...travelInput, calculatedPremium: output.finalPremium });
    }
  }, [travelInput, activeTab]);

  // Handle lead select
  const handleSelectQuote = () => {
    if (activeTab === 'third_party') onSelectQuote('third_party', thirdPartyOutput, thirdPartyInput);
    else if (activeTab === 'hull') onSelectQuote('hull', hullOutput, hullInput);
    else if (activeTab === 'fire') onSelectQuote('fire', fireOutput, fireInput);
    else if (activeTab === 'life') onSelectQuote('life', lifeOutput, lifeInput);
    else if (activeTab === 'travel') onSelectQuote('travel', travelOutput, travelInput);
  };

  // Helper arrays for year dropdowns
  const hijriYears = Array.from({ length: 25 }, (_, i) => 1405 - i);

  return (
    <div id="calculator-section" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Category Tabs */}
      <div className="flex overflow-x-auto bg-slate-950 border-b border-slate-800 custom-scrollbar whitespace-nowrap p-1">
        <button
          onClick={() => setActiveTab('third_party')}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-4 text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'third_party' 
              ? 'bg-gradient-to-t from-blue-900/40 to-slate-900 text-blue-400 border-b-2 border-blue-500' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert size={18} />
          <span>شخص ثالث خودرو</span>
        </button>

        <button
          onClick={() => setActiveTab('hull')}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-4 text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'hull' 
              ? 'bg-gradient-to-t from-blue-900/40 to-slate-900 text-blue-400 border-b-2 border-blue-500' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Car size={18} />
          <span>بیمه بدنه خودرو</span>
        </button>

        <button
          onClick={() => setActiveTab('fire')}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-4 text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'fire' 
              ? 'bg-gradient-to-t from-blue-900/40 to-slate-900 text-blue-400 border-b-2 border-blue-500' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home size={18} />
          <span>آتش‌سوزی و زلزله</span>
        </button>

        <button
          onClick={() => setActiveTab('life')}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-4 text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'life' 
              ? 'bg-gradient-to-t from-blue-900/40 to-slate-900 text-blue-400 border-b-2 border-blue-500' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp size={18} />
          <span>سرمایه‌گذاری و عمر مان</span>
        </button>

        <button
          onClick={() => setActiveTab('travel')}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-4 text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'travel' 
              ? 'bg-gradient-to-t from-blue-900/40 to-slate-900 text-blue-400 border-b-2 border-blue-500' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Plane size={18} />
          <span>مسافرتی خارج از کشور</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        {/* Left Side: Inputs Panel */}
        <div className="lg:col-span-7 space-y-6">
          {/* Third Party Tab */}
          {activeTab === 'third_party' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <ShieldAlert size={18} />
                <h4 className="font-bold text-base">ورودی اطلاعات بیمه شخص ثالث</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">نوع وسیله نقلیه</label>
                  <select
                    value={thirdPartyInput.vehicleType}
                    onChange={(e) => setThirdPartyInput(prev => ({ ...prev, vehicleType: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                  >
                    <option value="sedan">سواری (سمند، پژو، پراید، سراتو و ...)</option>
                    <option value="suv">شاسی بلند و کراس‌اوور</option>
                    <option value="motorcycle">موتورسیکلت</option>
                    <option value="heavy">باری و کامیون/اتوبوس</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">سال ساخت خودرو</label>
                  <select
                    value={thirdPartyInput.manufactureYear}
                    onChange={(e) => setThirdPartyInput(prev => ({ ...prev, manufactureYear: parseInt(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                  >
                    {hijriYears.map(yr => (
                      <option key={yr} value={yr}>{toPersianDigits(yr)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">سابقه تخفیف عدم خسارت (سال)</label>
                  <select
                    value={thirdPartyInput.noClaimYears}
                    onChange={(e) => setThirdPartyInput(prev => ({ ...prev, noClaimYears: parseInt(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                  >
                    {Array.from({ length: 15 }, (_, i) => (
                      <option key={i} value={i}>
                        {i === 0 ? 'بدون تخفیف' : `${toPersianDigits(i)} سال (${toPersianDigits(i * 5)}٪ تخفیف)`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">تعداد حوادث دارای خسارت قبلی</label>
                  <select
                    value={thirdPartyInput.previousAccidents}
                    onChange={(e) => setThirdPartyInput(prev => ({ ...prev, previousAccidents: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                  >
                    <option value="none">بدون حادثه</option>
                    <option value="one_financial">یک حادثه مالی (۲۰٪ جریمه)</option>
                    <option value="one_bodily">یک حادثه جانی (۳۰٪ جریمه)</option>
                    <option value="multiple">چندین حادثه همزمان (۷۰٪ جریمه)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">سقف پوشش مالی مورد درخواست</label>
                <div className="grid grid-cols-1 gap-2">
                  {THIRD_PARTY_FINANCIAL_OPTIONS.map((opt) => (
                    <label 
                      key={opt.value}
                      className={`flex items-center justify-between border rounded-xl p-3 cursor-pointer text-xs transition-all ${
                        thirdPartyInput.financialCoverage === opt.value
                          ? 'bg-blue-900/20 border-blue-500 text-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="financialCoverage"
                          checked={thirdPartyInput.financialCoverage === opt.value}
                          onChange={() => setThirdPartyInput(prev => ({ ...prev, financialCoverage: opt.value }))}
                          className="accent-blue-500"
                        />
                        <span className="font-medium">{opt.label}</span>
                      </div>
                      {opt.extraRate > 0 && (
                        <span className="text-[10px] bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/20">
                          +{toPersianDigits(Math.round(opt.extraRate * 100))}% surcharge
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Hull Tab */}
          {activeTab === 'hull' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Car size={18} />
                <h4 className="font-bold text-base">ورودی اطلاعات بیمه بدنه خودرو</h4>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <label className="font-medium">ارزش تقریبی خودرو (تومان)</label>
                  <span className="text-blue-300 font-bold text-sm">
                    {formatToman(hullInput.vehicleValue)}
                  </span>
                </div>
                <input
                  type="range"
                  min={100000000} // 10 Million Tomans in Rials
                  max={10000000000} // 1 Billion Tomans in Rials
                  step={50000000}
                  value={hullInput.vehicleValue}
                  onChange={(e) => setHullInput(prev => ({ ...prev, vehicleValue: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>۱۰ میلیون تومان</span>
                  <span>۱ میلیارد تومان</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">سال ساخت</label>
                  <select
                    value={hullInput.manufactureYear}
                    onChange={(e) => setHullInput(prev => ({ ...prev, manufactureYear: parseInt(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                  >
                    {hijriYears.map(yr => (
                      <option key={yr} value={yr}>{toPersianDigits(yr)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">تخفیف عدم خسارت بیمه بدنه</label>
                  <select
                    value={hullInput.noClaimYears}
                    onChange={(e) => setHullInput(prev => ({ ...prev, noClaimYears: parseInt(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                  >
                    <option value={0}>بدون سابقه تخفیف</option>
                    <option value={1}>۱ سال (۲۵٪ تخفیف)</option>
                    <option value={2}>۲ سال (۳۵٪ تخفیف)</option>
                    <option value={3}>۳ سال (۴۵٪ تخفیف)</option>
                    <option value={4}>۴ سال به بالا (۶۰٪ تخفیف)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">پوشش‌های اضافی انتخابی (فرانشیز اضافه)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { id: 'theft_parts', label: 'سرقت درجا قطعات (رینگ، صوتی، باتری)', rate: '+۱۵٪' },
                    { id: 'glass_breakage', label: 'شکست شیشه به تنهایی', rate: '+۵٪' },
                    { id: 'acid', label: 'پاشش مواد شیمیایی و اسید', rate: '+۵٪' },
                    { id: 'natural_disasters', label: 'زلزله، سیل و طوفان', rate: '+۱۰٪' },
                    { id: 'price_fluctuation', label: 'نوسانات قیمت بازار (تا سقف ۵۰٪ ارزش خودرو)', rate: '+۱۲٪' },
                  ].map((addon) => {
                    const isSelected = hullInput.selectedAddons.includes(addon.id);
                    return (
                      <label 
                        key={addon.id}
                        className={`flex items-center justify-between border rounded-xl p-3 cursor-pointer text-xs transition-all ${
                          isSelected
                            ? 'bg-blue-900/20 border-blue-500 text-blue-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setHullInput(prev => {
                                const exists = prev.selectedAddons.includes(addon.id);
                                return {
                                  ...prev,
                                  selectedAddons: exists
                                    ? prev.selectedAddons.filter(a => a !== addon.id)
                                    : [...prev.selectedAddons, addon.id]
                                };
                              });
                            }}
                            className="accent-blue-500 rounded"
                          />
                          <span>{addon.label}</span>
                        </div>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{addon.rate}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Fire Tab */}
          {activeTab === 'fire' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Home size={18} />
                <h4 className="font-bold text-base">ورودی اطلاعات بیمه آتش‌سوزی و زلزله ساختمان</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">نوع ملک</label>
                  <select
                    value={fireInput.propertyType}
                    onChange={(e) => setFireInput(prev => ({ ...prev, propertyType: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                  >
                    <option value="apartment">آپارتمان مسکونی</option>
                    <option value="house">خانه ویلایی یک طبقه</option>
                    <option value="villa">ویلای لوکس چند طبقه</option>
                    <option value="commercial">دفتر اداری یا تجاری خدماتی</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">نوع سازه و ساختار بنا</label>
                  <select
                    value={fireInput.constructionType}
                    onChange={(e) => setFireInput(prev => ({ ...prev, constructionType: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                  >
                    <option value="concrete_steel">بتنی و اسکلت فلزی (ایمن‌ترین)</option>
                    <option value="brick">آجر و آهن (نیمه سنتی)</option>
                    <option value="adobe_wood">سازه‌های قدیمی گلی یا تمام چوبی</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">متراژ بنا (مترمربع)</label>
                  <input
                    type="number"
                    value={fireInput.areaSqm}
                    onChange={(e) => setFireInput(prev => ({ ...prev, areaSqm: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">ارزش تقریبی ساخت هر مترمربع (تومان)</label>
                  <select
                    value={fireInput.costPerSqm}
                    onChange={(e) => setFireInput(prev => ({ ...prev, costPerSqm: parseInt(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                  >
                    <option value={100000000}>۱۰ میلیون تومان (اقتصادی)</option>
                    <option value={180000000}>۱۸ میلیون تومان (متوسط بنا)</option>
                    <option value={250000000}>۲۵ میلیون تومان (لوکس و مدرن)</option>
                    <option value={350000000}>۳۵ میلیون تومان (فوق لوکس)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <label className="font-medium">ارزش لوازم و اثاثیه کل منزل (تومان)</label>
                  <span className="text-blue-300 font-bold text-sm">
                    {formatToman(fireInput.contentsValue)}
                  </span>
                </div>
                <input
                  type="range"
                  min={100000000} // 10 million Tomans
                  max={3000000000} // 300 million Tomans
                  step={50000000}
                  value={fireInput.contentsValue}
                  onChange={(e) => setFireInput(prev => ({ ...prev, contentsValue: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>۱۰ میلیون تومان</span>
                  <span>۳۰۰ میلیون تومان</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2 font-medium">پوشش بلایای جانبی (پیشنهادی بیمه ایران)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { id: 'earthquake', label: 'خسارت زمین‌لرزه و زلزله ساختمان', rate: '+۱۶۰٪ پایه' },
                    { id: 'flood', label: 'سیل و طغیان رودخانه‌ها', rate: '+۴۰٪ پایه' },
                    { id: 'pipe_burst', label: 'ترکیدگی لوله‌های آب و فاضلاب داخلی', rate: '+۳۰٪ پایه' },
                    { id: 'theft', label: 'سرقت اثاثیه منزل با شکست حرز', rate: '+۵۰٪ پایه' },
                    { id: 'neighbor_liability', label: 'مسئولیت مدنی آتش‌سوزی در قبال همسایگان', rate: '+۲۵٪ پایه' },
                  ].map((addon) => {
                    const isSelected = fireInput.selectedAddons.includes(addon.id);
                    return (
                      <label 
                        key={addon.id}
                        className={`flex items-center justify-between border rounded-xl p-3 cursor-pointer text-xs transition-all ${
                          isSelected
                            ? 'bg-blue-900/20 border-blue-500 text-blue-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setFireInput(prev => {
                                const exists = prev.selectedAddons.includes(addon.id);
                                return {
                                  ...prev,
                                  selectedAddons: exists
                                    ? prev.selectedAddons.filter(a => a !== addon.id)
                                    : [...prev.selectedAddons, addon.id]
                                };
                              });
                            }}
                            className="accent-blue-500 rounded"
                          />
                          <span>{addon.label}</span>
                        </div>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{addon.rate}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Life Tab */}
          {activeTab === 'life' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <TrendingUp size={18} />
                <h4 className="font-bold text-base">ورودی بیمه عمر و پس‌انداز هوشمند "مان"</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">سن بیمه‌گذار (سال)</label>
                  <input
                    type="number"
                    min={1}
                    max={65}
                    value={lifeInput.age}
                    onChange={(e) => setLifeInput(prev => ({ ...prev, age: parseInt(e.target.value) || 30 }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">مدت زمان قرارداد پس‌انداز</label>
                  <select
                    value={lifeInput.paymentPeriodYears}
                    onChange={(e) => setLifeInput(prev => ({ ...prev, paymentPeriodYears: parseInt(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                  >
                    <option value={5}>۵ سال (پس‌انداز کوتاه‌مدت)</option>
                    <option value={10}>۱۰ سال</option>
                    <option value={15}>۱۵ سال</option>
                    <option value={20}>۲۰ سال (پیشنهاد استاندارد)</option>
                    <option value={25}>۲۵ سال</option>
                    <option value={30}>۳۰ سال (حداکثر سقف انباشت سرمایه)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <label className="font-medium">حق بیمه پس‌انداز ماهانه (تومان)</label>
                  <span className="text-blue-300 font-bold text-sm">
                    {formatToman(lifeInput.monthlyPremium)}
                  </span>
                </div>
                <input
                  type="range"
                  min={500000} // 50,000 Tomans
                  max={20000000} // 2,000,000 Tomans
                  step={500000}
                  value={lifeInput.monthlyPremium}
                  onChange={(e) => setLifeInput(prev => ({ ...prev, monthlyPremium: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>۵۰ هزار تومان</span>
                  <span>۲ میلیون تومان</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">نرخ افزایش سالانه حق بیمه جهت خنثی‌سازی تورم</label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 10, 15, 20].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setLifeInput(prev => ({ ...prev, annualPremiumIncrease: rate }))}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        lifeInput.annualPremiumIncrease === rate
                          ? 'bg-blue-900/20 border-blue-500 text-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {rate === 0 ? 'بدون افزایش' : `${toPersianDigits(rate)}٪ سالانه`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Travel Tab */}
          {activeTab === 'travel' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Plane size={18} />
                <h4 className="font-bold text-base">ورودی اطلاعات بیمه مسافرتی خارج از کشور</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">سن مسافر (سال)</label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={travelInput.age}
                    onChange={(e) => setTravelInput(prev => ({ ...prev, age: parseInt(e.target.value) || 28 }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">مدت سفر مورد نظر</label>
                  <select
                    value={travelInput.durationDays}
                    onChange={(e) => setTravelInput(prev => ({ ...prev, durationDays: parseInt(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                  >
                    <option value={7}>۱ تا ۷ روزه</option>
                    <option value={15}>۸ تا ۱۵ روزه</option>
                    <option value={23}>۱۶ تا ۲۳ روزه</option>
                    <option value={31}>۲۴ تا ۳۱ روزه</option>
                    <option value={45}>۳۲ تا ۴۵ روزه</option>
                    <option value={62}>۴۶ تا ۶۲ روزه</option>
                    <option value={92}>۶۳ تا ۹۲ روزه</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">منطقه و کشورهای مقصد سفر</label>
                  <select
                    value={travelInput.destinationZone}
                    onChange={(e) => setTravelInput(prev => ({ ...prev, destinationZone: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                  >
                    <option value="zone1">منطقه شنگن و اتحادیه اروپا (استاندارد)</option>
                    <option value="zone2">کشورهای همسایه و خاورمیانه (ترکیه، امارات، عراق)</option>
                    <option value="worldwide">سراسر جهان (شامل آمریکا، کانادا و ژاپن)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">حداکثر تعهد درمانی مورد نظر (یورو)</label>
                  <select
                    value={travelInput.coverageLimit}
                    onChange={(e) => setTravelInput(prev => ({ ...prev, coverageLimit: parseInt(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
                  >
                    <option value={10000}>۱۰,۰۰۰ یورو تعهد درمانی</option>
                    <option value={30000}>۳۰,۰۰۰ یورو تعهد درمانی (پیشنهاد ویزای شنگن)</option>
                    <option value={50000}>۵۰,۰۰۰ یورو تعهد درمانی (حداکثر امنیت)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Dynamic Outputs & Visualization */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs text-slate-400 font-semibold">استعلام قیمت و محاسبات نهایی</span>
              <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/20">
                نرخ مصوب مرکزی بیمه ایران
              </span>
            </div>

            {/* Price Output display */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center space-y-1 shadow-inner">
              <span className="text-xs text-slate-400 font-medium">حق بیمه کل قابل پرداخت</span>
              <div className="text-2xl font-black text-amber-400">
                {activeTab === 'third_party' && thirdPartyOutput && formatToman(thirdPartyOutput.finalPremium)}
                {activeTab === 'hull' && hullOutput && formatToman(hullOutput.finalPremium)}
                {activeTab === 'fire' && fireOutput && formatToman(fireOutput.finalPremium)}
                {activeTab === 'life' && lifeOutput && formatToman(lifeOutput.accumulatedCapital)}
                {activeTab === 'travel' && travelOutput && formatToman(travelOutput.finalPremium)}
              </div>
              <span className="text-[10px] text-slate-500 block">
                {activeTab === 'life' ? 'پس‌انداز و سرمایه پیش‌بینی شده در پایان قرارداد' : 'شامل ۹٪ عوارض شهرداری و مالیات بر ارزش افزوده'}
              </span>
            </div>

            {/* Calculations Breakdown */}
            <div className="mt-4 space-y-2 text-xs">
              <span className="text-slate-400 font-bold block mb-1">ریز محاسبات حق بیمه</span>
              
              {activeTab === 'third_party' && thirdPartyOutput && (
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between font-medium text-slate-400">
                    <span>نرخ پایه بدون تخفیف:</span>
                    <span>{formatToman(thirdPartyOutput.grossBaseNoDiscountRials)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>حق بیمه پایه دیه:</span>
                    <span>{formatToman(thirdPartyOutput.baseRate)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>تخفیف عدم خسارت ({toPersianDigits(Math.round(thirdPartyOutput.discountRate * 100))}٪):</span>
                    <span>-{formatToman(thirdPartyOutput.discountAmount)}</span>
                  </div>
                  {thirdPartyOutput.coverageSurcharge > 0 && (
                    <div className="flex justify-between text-amber-300">
                      <span>افزایش سقف پوشش مالی (۱۴۰۵):</span>
                      <span>+{formatToman(thirdPartyOutput.coverageSurcharge)}</span>
                    </div>
                  )}
                  {thirdPartyOutput.penaltySurcharge > 0 && (
                    <div className="flex justify-between text-red-400">
                      <span>جرایم حوادث و تصادفات:</span>
                      <span>+{formatToman(thirdPartyOutput.penaltySurcharge)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500 border-t border-slate-800/60 pt-1.5">
                    <span>مالیات بر ارزش افزوده و عوارض (۱۰٪):</span>
                    <span>+{formatToman(thirdPartyOutput.vat)}</span>
                  </div>
                </div>
              )}

              {activeTab === 'hull' && hullOutput && (
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between font-medium text-slate-400">
                    <span>نرخ پایه بدون تخفیف:</span>
                    <span>{formatToman(hullOutput.grossBaseNoDiscountRials)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>حق بیمه خالص بدنه:</span>
                    <span>{formatToman(hullOutput.baseRate)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>تخفیف نقدی و عدم خسارت ({toPersianDigits(Math.round((hullOutput.noClaimRate + 0.10) * 100))}٪):</span>
                    <span>-{formatToman(hullOutput.discountAmount)}</span>
                  </div>
                  {hullOutput.addonCost > 0 && (
                    <div className="flex justify-between text-amber-300">
                      <span>مجموع هزینه‌های پوشش اضافی:</span>
                      <span>+{formatToman(hullOutput.addonCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500 border-t border-slate-800/60 pt-1.5">
                    <span>عوارض و مالیات ارزش افزوده:</span>
                    <span>+{formatToman(hullOutput.vat)}</span>
                  </div>
                </div>
              )}

              {activeTab === 'fire' && fireOutput && (
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>ارزش کل ملک و اثاثیه تحت پوشش:</span>
                    <span>{formatToman(fireOutput.totalInsuredValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>حق بیمه پایه حریق:</span>
                    <span>{formatToman(fireOutput.baseRate)}</span>
                  </div>
                  {fireOutput.addonCost > 0 && (
                    <div className="flex justify-between text-amber-300">
                      <span>پوشش‌های انتخابی (زلزله، سرقت و ...):</span>
                      <span>+{formatToman(fireOutput.addonCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500 border-t border-slate-800/60 pt-1.5">
                    <span>مالیات و عوارض قانونی (۱۰٪):</span>
                    <span>+{formatToman(fireOutput.vat)}</span>
                  </div>
                </div>
              )}

              {activeTab === 'life' && lifeOutput && (
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>مجموع اقساط پرداختی شما در کل دوره:</span>
                    <span>{formatToman(lifeOutput.totalPremiumPaid)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>کل سود مشارکت و اندوخته پیش‌بینی شده:</span>
                    <span>{formatToman(lifeOutput.accumulatedCapital - lifeOutput.totalPremiumPaid)}</span>
                  </div>
                  <div className="flex justify-between text-blue-300 border-t border-slate-800/60 pt-1.5">
                    <span>سرمایه فوت عادی تحت پوشش:</span>
                    <span>{formatToman(lifeOutput.deathBenefit)}</span>
                  </div>
                </div>
              )}

              {activeTab === 'travel' && travelOutput && (
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>حق بیمه پایه مسافرتی:</span>
                    <span>{formatToman(travelOutput.basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-amber-300">
                    <span>ضریب ریسک و پوشش‌های درمانی:</span>
                    <span>{toPersianDigits(travelOutput.multiplier.toFixed(2))} برابر</span>
                  </div>
                  <div className="flex justify-between text-slate-500 border-t border-slate-800/60 pt-1.5">
                    <span>عوارض و مالیات ارزش افزوده (۱۰٪):</span>
                    <span>+{formatToman(travelOutput.vat)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Recharts Chart Area */}
          <div className="h-44 w-full bg-slate-900 border border-slate-800 rounded-xl p-2 relative shadow-inner">
            <span className="text-[10px] text-slate-500 font-bold block mb-1 text-right">تحلیل و شبیه‌سازی آماری</span>
            
            {activeTab === 'life' && lifeOutput && (
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={lifeOutput.chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" stroke="#475569" fontSize={8} />
                  <YAxis stroke="#475569" fontSize={8} unit="M" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: 10 }} />
                  <Area type="monotone" name="سرمایه انباشته" dataKey="capital" stroke="#10b981" fillOpacity={1} fill="url(#colorCapital)" />
                  <Area type="monotone" name="مجموع پرداختی" dataKey="premiumPaid" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPremium)" />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {activeTab === 'third_party' && (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart 
                  data={Array.from({ length: 15 }, (_, i) => ({
                    year: `سال ${i}`,
                    discount: i * 5,
                  }))} 
                  margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" stroke="#475569" fontSize={8} />
                  <YAxis stroke="#475569" fontSize={8} unit="٪" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: 10 }} />
                  <Bar name="درصد تخفیف عدم خسارت ثالث" dataKey="discount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeTab === 'hull' && (
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart 
                  data={[
                    { year: 'بدون تخفیف', discount: 0 },
                    { year: 'سال ۱', discount: 25 },
                    { year: 'سال ۲', discount: 35 },
                    { year: 'سال ۳', discount: 45 },
                    { year: 'سال ۴ به بالا', discount: 60 },
                  ]} 
                  margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" stroke="#475569" fontSize={8} />
                  <YAxis stroke="#475569" fontSize={8} unit="٪" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: 10 }} />
                  <Area type="monotone" name="تخفیف عدم خسارت بدنه" dataKey="discount" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {activeTab === 'fire' && (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart 
                  data={[
                    { name: 'آپارتمان بتنی', premium: 120 },
                    { name: 'آجر آهن', premium: 180 },
                    { name: 'سازه‌گلی سنتی', premium: 350 },
                  ]} 
                  margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#475569" fontSize={8} />
                  <YAxis stroke="#475569" fontSize={8} unit="k" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: 10 }} />
                  <Bar name="ضریب خطرپذیری پایه (تومان)" dataKey="premium" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeTab === 'travel' && (
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart 
                  data={[
                    { age: 'زیر ۱۲ سال', limit: 800000 },
                    { age: '۱۳ تا ۶۵', limit: 1200000 },
                    { age: '۶۶ تا ۷۰', limit: 2400000 },
                    { age: '۷۱ تا ۷۵', limit: 3600000 },
                    { age: '۷۶ به بالا', limit: 5400000 },
                  ]} 
                  margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="age" stroke="#475569" fontSize={8} />
                  <YAxis stroke="#475569" fontSize={8} unit="T" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: 10 }} />
                  <Area type="monotone" name="پایه نرخ مسافرتی شنگن (تومان)" dataKey="limit" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <button
            onClick={handleSelectQuote}
            className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-amber-400/10 text-sm cursor-pointer mt-2"
          >
            <CheckCircle2 size={18} />
            <span>ثبت نهایی و دریافت پیش‌نویس استعلام</span>
          </button>
        </div>
      </div>
    </div>
  );
}
