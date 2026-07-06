import React, { useState, useEffect } from 'react';
import { 
  UserCog, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  PhoneCall, 
  Send, 
  Download, 
  Upload, 
  MessageSquare, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw,
  X,
  Plus
} from 'lucide-react';
import { Inquiry, InquiryStatus, SmsLog, IRAN_BIMEH_AGENCY } from '../types';

interface AdminPanelProps {
  onOpenNewInquiry: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onOpenNewInquiry }) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Status Change State inside Modal
  const [newStatus, setNewStatus] = useState<InquiryStatus>('pending');
  const [expertNotes, setExpertNotes] = useState('');
  const [issuedPolicyUrl, setIssuedPolicyUrl] = useState('');
  const [sendSmsNotification, setSendSmsNotification] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState('');

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inquiries');
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
      const smsRes = await fetch('/api/sms-logs');
      if (smsRes.ok) {
        const smsData = await smsRes.json();
        setSmsLogs(smsData);
      }
    } catch (err) {
      console.error('Fetch inquiries error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const openInquiryModal = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setNewStatus(inq.status);
    setExpertNotes(inq.expertNotes || '');
    setIssuedPolicyUrl(inq.issuedPolicyUrl || '');
    setUpdateSuccessMsg('');
  };

  const handleUpdateInquiry = async () => {
    if (!selectedInquiry) return;
    setIsUpdating(true);
    setUpdateSuccessMsg('');

    try {
      const res = await fetch(`/api/inquiries/${selectedInquiry.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          expertNotes,
          issuedPolicyUrl,
          sendSms: sendSmsNotification
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUpdateSuccessMsg('تغییرات با موفقیت ثبت شد و پیامک به مشتری ارسال گردید.');
        fetchInquiries();
        setTimeout(() => {
          setSelectedInquiry(null);
        }, 1500);
      }
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredInquiries = inquiries.filter(item => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch = 
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mobile.includes(searchTerm) ||
      item.nationalId.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case 'pending': return { label: 'در انتظار بررسی', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'in_progress': return { label: 'در حال کارشناسی', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'ready_for_issuance': return { label: 'آماده صدور', bg: 'bg-teal-100 text-teal-900 border-teal-300' };
      case 'issued': return { label: 'صادر شده', bg: 'bg-emerald-700 text-white border-emerald-800' };
      case 'rejected': return { label: 'لغو / رد شده', bg: 'bg-rose-100 text-rose-900 border-rose-300' };
      default: return { label: status, bg: 'bg-slate-100 text-slate-800' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UserCog className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">
              پنل مدیریت و کارشناسی - بیمه ایران نمایندگی گلزار ۳۰۹۶۲
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            بررسی آنلاین استعلام‌ها، مشاهده تصاویر مدارک آپلودشده، تغییر وضعیت و ارسال پیامک خودکار به مشتریان
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchInquiries}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            بروزرسانی لیست
          </button>

          <button
            onClick={onOpenNewInquiry}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            ثبت استعلام جدید
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input 
            type="text"
            placeholder="جستجو با کد پیگیری، نام، موبایل یا کد ملی..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50 focus:border-emerald-600 focus:bg-white"
          />
        </div>

        {/* Status Tabs Filter */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto text-xs font-bold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            همه ({inquiries.length})
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            در انتظار ({inquiries.filter(i => i.status === 'pending').length})
          </button>

          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
            }`}
          >
            در حال کارشناسی ({inquiries.filter(i => i.status === 'in_progress').length})
          </button>

          <button
            onClick={() => setStatusFilter('issued')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'issued' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
            }`}
          >
            صادر شده ({inquiries.filter(i => i.status === 'issued').length})
          </button>
        </div>

      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">در حال دریافت اطلاعات...</div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">هیچ درخواستی با این مشخصات یافت نشد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b">
                <tr>
                  <th className="p-3.5">کد پیگیری</th>
                  <th className="p-3.5">نام متقاضی</th>
                  <th className="p-3.5">نوع بیمه‌نامه</th>
                  <th className="p-3.5">تلفن همراه</th>
                  <th className="p-3.5">مدارک</th>
                  <th className="p-3.5">وضعیت</th>
                  <th className="p-3.5">تاریخ ثبت</th>
                  <th className="p-3.5 text-center">عملیات کارشناس</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInquiries.map((inq) => {
                  const badge = getStatusBadge(inq.status);
                  return (
                    <tr key={inq.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900 dir-ltr text-right">
                        {inq.trackingCode}
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">
                        {inq.fullName}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {inq.insuranceType === 'third_party' ? 'شخص ثالث' :
                         inq.insuranceType === 'body' ? 'بیمه بدنه' :
                         inq.insuranceType === 'fire' ? 'آتش‌سوزی' :
                         inq.insuranceType === 'health' ? 'درمان تکمیلی' : inq.insuranceType}
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">
                        {inq.mobile}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          <FileText className="w-3 h-3 text-emerald-700" />
                          {inq.documents.length} مدرک
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 text-[11px]">
                        {inq.createdAt}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => openInquiryModal(inq)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>بررسی و صدور</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL & ACTION MODAL */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Top Bar */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">
                  بررسی درخواست {selectedInquiry.fullName} ({selectedInquiry.trackingCode})
                </h3>
              </div>

              <button 
                onClick={() => setSelectedInquiry(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs">
              
              {updateSuccessMsg && (
                <div className="bg-emerald-100 border border-emerald-400 text-emerald-900 p-3 rounded-xl flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>{updateSuccessMsg}</span>
                </div>
              )}

              {/* Grid Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border">
                <div>
                  <p><strong className="text-slate-600">نام کامل:</strong> {selectedInquiry.fullName}</p>
                  <p><strong className="text-slate-600">کد ملی:</strong> {selectedInquiry.nationalId}</p>
                  <p><strong className="text-slate-600">شماره همراه:</strong> {selectedInquiry.mobile}</p>
                </div>
                <div>
                  <p><strong className="text-slate-600">استان / شهر:</strong> {selectedInquiry.province} - {selectedInquiry.city}</p>
                  <p><strong className="text-slate-600">آدرس:</strong> {selectedInquiry.address || 'ثبت نشده'}</p>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  تصاویر مدارک بارگذاری شده توسط مشتری:
                </h4>

                {selectedInquiry.documents.length === 0 ? (
                  <p className="text-slate-500 italic">هیچ مدرکی آپلود نشده است.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedInquiry.documents.map((doc) => (
                      <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800">{doc.label}</p>
                          <p className="text-[11px] text-slate-500">{doc.fileName} ({doc.fileSize})</p>
                        </div>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-emerald-700 text-white font-bold text-[11px] rounded hover:bg-emerald-800 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          مشاهده
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expert Action Section */}
              <div className="pt-4 border-t space-y-4">
                <h4 className="font-bold text-slate-900 text-xs text-emerald-800">اعمال تغییر وضعیت و صدور بیمه‌نامه:</h4>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تغییر وضعیت درخواست:</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as InquiryStatus)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-xs"
                  >
                    <option value="pending">در انتظار بررسی</option>
                    <option value="in_progress">در حال کارشناسی و استعلام</option>
                    <option value="ready_for_issuance">آماده صدور (واریز وجه)</option>
                    <option value="issued">صادر شده (ارسال فایل نهایی)</option>
                    <option value="rejected">لغو / رد درخواست</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">یادداشت کارشناس جهت اطلاع مشتری:</label>
                  <textarea
                    rows={2}
                    value={expertNotes}
                    onChange={(e) => setExpertNotes(e.target.value)}
                    placeholder="مثلاً: بیمه‌نامه صادر شد و لینک دانلود پیوست گردید..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>

                {newStatus === 'issued' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">لینک مستقیم فایل الکترونیکی بیمه‌نامه (PDF):</label>
                    <input
                      type="text"
                      value={issuedPolicyUrl}
                      onChange={(e) => setIssuedPolicyUrl(e.target.value)}
                      placeholder="https://bimeh-iran30962.ir/docs/policy-62915.pdf"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendSmsNotification}
                    onChange={(e) => setSendSmsNotification(e.target.checked)}
                    className="rounded text-emerald-700"
                  />
                  <span>ارسال پیامک اطلاع‌رسانی خودکار به شماره {selectedInquiry.mobile}</span>
                </label>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className="px-5 py-2.5 rounded-xl border text-slate-700 font-bold"
                  >
                    انصراف
                  </button>

                  <button
                    onClick={handleUpdateInquiry}
                    disabled={isUpdating}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow"
                  >
                    {isUpdating ? 'در حال ثبت...' : 'ثبت تغییرات و ارسال پیامک'}
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
