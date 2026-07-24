import React, { useState } from 'react';
import { 
  Users, ShieldCheck, FileText, CheckCircle2, Clock, XCircle, 
  Search, Filter, LogOut, Settings, Phone, Mail, User, Eye, 
  TrendingUp, DollarSign, Calendar, ChevronLeft
} from 'lucide-react';
import { toPersianDigits } from '../data/insuranceRates';

export interface LeadItem {
  id: string;
  fullName: string;
  nationalCode: string;
  phone: string;
  insuranceType: string;
  insuranceTypeFa: string;
  estimatedPriceRials: number;
  status: 'pending' | 'contacted' | 'issued' | 'cancelled';
  createdAt: string;
  details: string;
  notes?: string;
}

const INITIAL_LEADS: LeadItem[] = [
  {
    id: 'G4456-101',
    fullName: 'رضا کریمی',
    nationalCode: '۰۰۱۲۳۴۵۶۷۸',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    insuranceType: 'third_party',
    insuranceTypeFa: 'بیمه شخص ثالث (سواری)',
    estimatedPriceRials: 142000000,
    status: 'pending',
    createdAt: '۱۴۰۵/۰۵/۰۲ - ۱۰:۳۰',
    details: 'پوشش مالی ۵۰۰ میلیون تومان - ۱۰ سال تخفیف عدم خسارت - پژو پارس ۱۴۰۰',
    notes: 'مشتری درخواست تماس عصر بین ساعت ۱۶ الی ۱۸ دارد.'
  },
  {
    id: 'G4456-102',
    fullName: 'سارا احمدی',
    nationalCode: '۰۰۹۸۷۶۵۴۳۲',
    phone: '۰۹۱۸۸۸۸۷۷۶۶',
    insuranceType: 'hull',
    insuranceTypeFa: 'بیمه بدنه خودرو',
    estimatedPriceRials: 265000000,
    status: 'contacted',
    createdAt: '۱۴۰۵/۰۵/۰۱ - ۱۶:۴۵',
    details: 'ارزش خودرو ۱.۸ میلیارد تومان - پوشش نوسان قیمت ۵۰٪ + سرقت درجا - ۳ سال تخفیف',
    notes: 'پیش‌فاکتور صدور ارسال شد، منتظر بازدید کارشناس.'
  },
  {
    id: 'G4456-103',
    fullName: 'امیرحسین رضایی',
    nationalCode: '۰۴۵۱۱۲۲۳۳۴',
    phone: '۰۹۳۵۱۱۱۲۲۳۳',
    insuranceType: 'fire',
    insuranceTypeFa: 'بیمه آتش‌سوزی و ززلزله',
    estimatedPriceRials: 34000000,
    status: 'issued',
    createdAt: '۱۴۰۵/۰۴/۳۰ - ۰۹:۱۵',
    details: 'متراژ ۱۲۰ متر - ارزش سازه ۴ میلیارد - ارزش اثاثیه ۱ میلیارد - پوشش ترکیبی زلزله و سرقت با شکست حرز',
    notes: 'بیمه‌نامه صادر و با پیک تحویل داده شد.'
  },
  {
    id: 'G4456-104',
    fullName: 'مریم حسینی',
    nationalCode: '۰۰۷۶۵۴۳۲۱۰',
    phone: '۰۹۳۶۹۹۹۸۸۷۷',
    insuranceType: 'life',
    insuranceTypeFa: 'بیمه عمر و پس‌انداز مان',
    estimatedPriceRials: 50000000,
    status: 'pending',
    createdAt: '۱۴۰۵/۰۵/۰۲ - ۱۱:۱۰',
    details: 'حق بیمه ماهانه ۵,۰۰۰,۰۰۰ تومان - افزایش سالانه ۱۵٪ - پوشش معافیت از پرداخت و امراض خاص',
    notes: 'علاقه‌مند به جدول ۵ ساله پس‌انداز.'
  }
];

interface AdminDashboardProps {
  onClose: () => void;
  onLogout: () => void;
}

export default function AdminDashboard({ onClose, onLogout }: AdminDashboardProps) {
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_LEADS);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [agentNoteInput, setAgentNoteInput] = useState('');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.fullName.includes(searchTerm) || 
                          lead.phone.includes(searchTerm) || 
                          lead.id.includes(searchTerm) ||
                          lead.nationalCode.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesType = typeFilter === 'all' || lead.insuranceType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRevenueRials = leads
    .filter(l => l.status === 'issued')
    .reduce((acc, curr) => acc + curr.estimatedPriceRials, 0);

  const pendingCount = leads.filter(l => l.status === 'pending').length;
  const contactedCount = leads.filter(l => l.status === 'contacted').length;
  const issuedCount = leads.filter(l => l.status === 'issued').length;

  const handleUpdateStatus = (id: string, newStatus: LeadItem['status']) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleAddNote = (id: string) => {
    if (!agentNoteInput.trim()) return;
    setLeads(prev => prev.map(l => l.id === id ? { ...l, notes: agentNoteInput } : l));
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead(prev => prev ? { ...prev, notes: agentNoteInput } : null);
    }
    setAgentNoteInput('');
  };

  const getStatusBadge = (status: LeadItem['status']) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold"><Clock size={12}/> در انتظار بررسی</span>;
      case 'contacted':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold"><Phone size={12}/> تماس گرفته شد</span>;
      case 'issued':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold"><CheckCircle2 size={12}/> بیمه‌نامه صادر شد</span>;
      case 'cancelled':
        return <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold"><XCircle size={12}/> انصراف / بایگانی</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col overflow-hidden text-slate-100 font-sans" dir="rtl">
      {/* Admin Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-amber-500 to-amber-300 p-2 rounded-xl text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <ShieldCheck size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white">داشبورد مدیریت ارشد نمایندگی گلزار</h2>
              <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/30">کد ۴۴۵۶ - بیمه ایران</span>
            </div>
            <p className="text-xs text-slate-400 font-light">مدیریت لیدهای دریافتی، صدور استعلام و نظارت بر پرونده‌های مشتریان</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLogout}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut size={14} />
            <span>خروج از حساب مدیر</span>
          </button>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            بستن داشبورد
          </button>
        </div>
      </header>

      {/* Main Admin Content Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-blue-500/10 text-blue-400 p-3 rounded-xl border border-blue-500/20">
              <FileText size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs block font-medium">کل درخواست‌های استعلام</span>
              <span className="text-xl font-black text-white">{toPersianDigits(leads.length)} فقره</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-amber-500/10 text-amber-400 p-3 rounded-xl border border-amber-500/20">
              <Clock size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs block font-medium">در انتظار بررسی کارشناس</span>
              <span className="text-xl font-black text-amber-400">{toPersianDigits(pendingCount)} فقره</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs block font-medium">بیمه‌نامه‌های صادر شده</span>
              <span className="text-xl font-black text-emerald-400">{toPersianDigits(issuedCount)} فقره</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-xl border border-indigo-500/20">
              <TrendingUp size={22} />
            </div>
            <div>
              <span className="text-slate-400 text-xs block font-medium">ارزش پرتفوی صادر شده</span>
              <span className="text-base font-black text-indigo-300">
                {toPersianDigits(Math.round(totalRevenueRials / 10).toLocaleString('fa-IR'))} تومان
              </span>
            </div>
          </div>
        </div>

        {/* Filters and Controls Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute right-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="جستجو با نام، کد ملی، شماره تلفن..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pr-10 pl-4 py-2.5 focus:outline-none focus:border-amber-400/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter size={14} className="text-amber-400" />
              <span>وضعیت:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="pending">در انتظار بررسی</option>
              <option value="contacted">تماس گرفته شد</option>
              <option value="issued">بیمه‌نامه صادر شد</option>
              <option value="cancelled">انصراف / بایگانی</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
            >
              <option value="all">همه رشته‌های بیمه‌ای</option>
              <option value="third_party">شخص ثالث</option>
              <option value="hull">بیمه بدنه</option>
              <option value="fire">آتش‌سوزی و زلزله</option>
              <option value="life">عمر و پس‌انداز مان</option>
              <option value="travel">مسافرتی</option>
            </select>
          </div>
        </div>

        {/* Lead Table / List View */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Users size={18} className="text-amber-400" />
              لیست استعلام‌ها و درخواست‌های ثبت شده مشتریان
            </h3>
            <span className="text-xs text-slate-400 font-light">
              نمایش {toPersianDigits(filteredLeads.length)} از {toPersianDigits(leads.length)} مورد
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">کد پیگیری</th>
                  <th className="px-4 py-3">نام بیمه‌گذار</th>
                  <th className="px-4 py-3">شماره تماس / کد ملی</th>
                  <th className="px-4 py-3">رشته بیمه</th>
                  <th className="px-4 py-3">حق بیمه تخمینی</th>
                  <th className="px-4 py-3">تاریخ درخواست</th>
                  <th className="px-4 py-3">وضعیت پرونده</th>
                  <th className="px-4 py-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/30 transition duration-150">
                    <td className="px-4 py-3.5 font-mono text-amber-300 font-bold">{lead.id}</td>
                    <td className="px-4 py-3.5 font-bold text-white">{lead.fullName}</td>
                    <td className="px-4 py-3.5 space-y-0.5">
                      <div className="font-sans text-slate-200">{lead.phone}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{lead.nationalCode}</div>
                    </td>
                    <td className="px-4 py-3.5 font-medium">{lead.insuranceTypeFa}</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-400">
                      {toPersianDigits(Math.round(lead.estimatedPriceRials / 10).toLocaleString('fa-IR'))} تومان
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-[11px] font-sans">{lead.createdAt}</td>
                    <td className="px-4 py-3.5">{getStatusBadge(lead.status)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 mx-auto transition cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>بررسی و جزئیات</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-500">
                      هیچ درخواستی با مشخصات جستجو شده یافت نشد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Details View for Selected Lead */}
      {selectedLead && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg text-xs"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="bg-amber-400 text-slate-950 p-2 rounded-xl font-bold">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">جزئیات کامل درخواست {selectedLead.fullName}</h3>
                <span className="text-xs text-amber-400 font-mono">کد پیگیری: {selectedLead.id}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-slate-500 block">نام و نام خانوادگی:</span>
                <span className="font-bold text-slate-100 text-sm">{selectedLead.fullName}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-slate-500 block">کد ملی:</span>
                <span className="font-mono text-slate-200">{selectedLead.nationalCode}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-slate-500 block">شماره همراه مشتری:</span>
                <a href={`tel:${selectedLead.phone}`} className="font-mono text-blue-400 font-bold block hover:underline">
                  {selectedLead.phone}
                </a>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-slate-500 block">نوع بیمه‌نامه:</span>
                <span className="font-bold text-amber-300">{selectedLead.insuranceTypeFa}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <span className="text-slate-400 font-bold block">شرح پوشش‌ها و محاسبات سیستمی:</span>
              <p className="text-slate-300 leading-relaxed font-light">{selectedLead.details}</p>
              <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center text-xs">
                <span className="text-slate-400">حق بیمه برآورد شده:</span>
                <span className="text-emerald-400 font-black text-sm">
                  {toPersianDigits(Math.round(selectedLead.estimatedPriceRials / 10).toLocaleString('fa-IR'))} تومان
                </span>
              </div>
            </div>

            {/* Note Section */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">یادداشت کارشناس فروش / نمایندگی:</label>
              {selectedLead.notes && (
                <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-500/20 text-amber-200 text-xs font-light">
                  {selectedLead.notes}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="افزودن یادداشت جدید..."
                  value={agentNoteInput}
                  onChange={(e) => setAgentNoteInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => handleAddNote(selectedLead.id)}
                  className="bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-amber-300 transition"
                >
                  ثبت یادداشت
                </button>
              </div>
            </div>

            {/* Change Status Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-400 block">تغییر وضعیت پرونده:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  onClick={() => handleUpdateStatus(selectedLead.id, 'pending')}
                  className={`p-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                    selectedLead.status === 'pending'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  در انتظار بررسی
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedLead.id, 'contacted')}
                  className={`p-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                    selectedLead.status === 'contacted'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  تماس گرفته شد
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedLead.id, 'issued')}
                  className={`p-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                    selectedLead.status === 'issued'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  بیمه‌نامه صادر شد
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedLead.id, 'cancelled')}
                  className={`p-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                    selectedLead.status === 'cancelled'
                      ? 'bg-red-500/20 border-red-500 text-red-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  انصراف / بایگانی
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
