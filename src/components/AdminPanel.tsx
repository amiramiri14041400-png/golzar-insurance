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
  Plus,
  Users,
  BarChart3,
  Trash2,
  UserPlus,
  Key,
  Mail,
  ChevronLeft,
  Briefcase,
  Layers,
  LineChart,
  Percent,
  Check,
  Settings2
} from 'lucide-react';
import { Inquiry, InquiryStatus, SmsLog, IRAN_BIMEH_AGENCY, User } from '../types';
import { FormsManagementPanel } from './FormsManagementPanel';

interface AdminPanelProps {
  onOpenNewInquiry: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onOpenNewInquiry }) => {
  const [activeSubTab, setActiveSubTab] = useState<'inquiries' | 'users' | 'dashboard' | 'forms'>('inquiries');
  
  // Inquiries State
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

  // Users Management State
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  
  // New User Form State
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newNationalId, setNewNationalId] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

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

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
    fetchUsers();
  }, []);

  const handleRefreshAll = () => {
    fetchInquiries();
    fetchUsers();
  };

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

  const handleCreateUserManually = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');

    if (!newEmail || !newPassword || !newFullName || !newMobile) {
      setUserError('لطفاً فیلدهای ستاره‌دار را تکمیل کنید.');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          username: newUsername || newEmail,
          password: newPassword,
          fullName: newFullName,
          mobile: newMobile,
          nationalId: newNationalId,
          role: newRole
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطایی در ثبت کاربر رخ داد.');
      }

      setUserSuccess('کاربر جدید با موفقیت ایجاد شد.');
      fetchUsers();
      setTimeout(() => {
        setShowAddUserModal(false);
        // Clear state
        setNewEmail('');
        setNewUsername('');
        setNewPassword('');
        setNewFullName('');
        setNewMobile('');
        setNewNationalId('');
        setNewRole('user');
        setUserSuccess('');
      }, 1500);
    } catch (err: any) {
      setUserError(err.message || 'خطا در افزودن کاربر جدید.');
    }
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (username === 'sadegh') {
      alert('کاربر صادق به عنوان مدیر ارشد سیستم قابل حذف نیست.');
      return;
    }

    if (!window.confirm(`آیا از حذف کاربر "${username}" اطمینان دارید؟`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطایی رخ داد.');
      }

      alert('کاربر با موفقیت حذف گردید.');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredInquiries = inquiries.filter(item => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch = 
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mobile.includes(searchTerm) ||
      (item.nationalId && item.nationalId.includes(searchTerm));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case 'pending': return { label: 'در انتظار بررسی', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'in_progress': return { label: 'در حال کارشناسی', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'ready_for_issuance': return { label: 'آماده صدور (واریز وجه)', bg: 'bg-teal-100 text-teal-900 border-teal-300' };
      case 'issued': return { label: 'صادر شده', bg: 'bg-emerald-700 text-white border-emerald-800' };
      case 'rejected': return { label: 'لغو / رد شده', bg: 'bg-rose-100 text-rose-900 border-rose-300' };
      default: return { label: status, bg: 'bg-slate-100 text-slate-800' };
    }
  };

  // Stats Dashboard computations
  const totalCount = inquiries.length;
  const pendingCount = inquiries.filter(i => i.status === 'pending').length;
  const inProgressCount = inquiries.filter(i => i.status === 'in_progress').length;
  const issuedCount = inquiries.filter(i => i.status === 'issued').length;
  const readyCount = inquiries.filter(i => i.status === 'ready_for_issuance').length;
  
  const typeThirdParty = inquiries.filter(i => i.insuranceType === 'third_party').length;
  const typeBody = inquiries.filter(i => i.insuranceType === 'body').length;
  const typeFire = inquiries.filter(i => i.insuranceType === 'fire').length;
  const typeOther = totalCount - (typeThirdParty + typeBody + typeFire);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn text-right dir-rtl">
      
      {/* Upper Admin Navigation Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <UserCog className="w-6 h-6 text-emerald-400 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-white">
              پنل جامع کارشناسی و مدیریت نمایندگی گلزار ۳۰۹۶۲
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            بررسی پرونده‌های استعلام، مدیریت دسترسی کاربران و مدیران و نمایش آماری عملکرد نمایندگی بیمه ایران
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefreshAll}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            بروزرسانی داده‌ها
          </button>

          <button
            onClick={onOpenNewInquiry}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4.5 h-4.5" />
            ثبت پرونده دستی جدید
          </button>
        </div>
      </div>

      {/* Admin Module Sub-Tabs Selection */}
      <div className="flex border-b text-xs font-extrabold bg-white rounded-2xl p-1.5 border shadow-sm">
        <button
          onClick={() => setActiveSubTab('inquiries')}
          className={`flex-1 py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'inquiries'
              ? 'bg-emerald-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
          }`}
        >
          <Layers className="w-4.5 h-4.5" />
          <span>مدیریت استعلام‌ها و سفارشات ({inquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex-1 py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'users'
              ? 'bg-emerald-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
          }`}
        >
          <Users className="w-4.5 h-4.5" />
          <span>مدیریت دسترسی و کاربران ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`flex-1 py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'dashboard'
              ? 'bg-emerald-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
          }`}
        >
          <BarChart3 className="w-4.5 h-4.5" />
          <span>داشبورد گزارشات و آمار کلی</span>
        </button>

        <button
          onClick={() => setActiveSubTab('forms')}
          className={`flex-1 py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'forms'
              ? 'bg-emerald-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
          }`}
        >
          <FileText className="w-4.5 h-4.5" />
          <span>⚙️ مدیریت فرم‌ها و مدارک</span>
        </button>
      </div>

      {/* SUBTAB CONTENT 1: INQUIRIES LIST */}
      {activeSubTab === 'inquiries' && (
        <div className="space-y-6">
          
          {/* Filters and Search Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input 
                type="text"
                placeholder="جستجو با کد پیگیری، نام متقاضی، موبایل یا کد ملی..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 outline-none"
              />
            </div>

            {/* Status Tabs Filter */}
            <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto text-[11px] font-bold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                  statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-650 hover:bg-slate-200'
                }`}
              >
                همه ({inquiries.length})
              </button>

              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                  statusFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                }`}
              >
                در انتظار ({pendingCount})
              </button>

              <button
                onClick={() => setStatusFilter('in_progress')}
                className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                  statusFilter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                }`}
              >
                کارشناسی ({inProgressCount})
              </button>

              <button
                onClick={() => setStatusFilter('issued')}
                className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                  statusFilter === 'issued' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                }`}
              >
                صادر شده ({issuedCount})
              </button>
            </div>

          </div>

          {/* Inquiries Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-700" />
                <span>در حال واکشی اطلاعات از پایگاه داده...</span>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs font-bold">
                هیچ درخواست استعلامی مطابق شرایط فیلتر یافت نشد.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b">
                    <tr>
                      <th className="p-4">کد پیگیری پرونده</th>
                      <th className="p-4">نام متقاضی</th>
                      <th className="p-4">نوع بیمه‌نامه</th>
                      <th className="p-4">تلفن همراه</th>
                      <th className="p-4">اسناد پیوستی</th>
                      <th className="p-4">وضعیت پرونده</th>
                      <th className="p-4">تاریخ ثبت</th>
                      <th className="p-4 text-center">اقدام کارشناسی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInquiries.map((inq) => {
                      const badge = getStatusBadge(inq.status);
                      return (
                        <tr key={inq.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-4 font-mono font-bold text-slate-950 dir-ltr text-right text-[11px]">
                            {inq.trackingCode}
                          </td>
                          <td className="p-4 font-black text-slate-800">
                            {inq.fullName}
                          </td>
                          <td className="p-4 text-slate-750 font-bold">
                            {inq.insuranceType === 'third_party' ? 'شخص ثالث خودرو' :
                             inq.insuranceType === 'body' ? 'بیمه بدنه خودرو' :
                             inq.insuranceType === 'fire' ? 'آتش‌سوزی و زلزله' :
                             inq.insuranceType === 'health' ? 'درمان تکمیلی' : inq.insuranceType}
                          </td>
                          <td className="p-4 font-mono text-slate-700 font-bold">
                            {inq.mobile}
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold">
                              <FileText className="w-3.5 h-3.5 text-emerald-700" />
                              {inq.documents ? inq.documents.length : 0} مدرک
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500 font-medium">
                            {inq.createdAt}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => openInquiryModal(inq)}
                              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold rounded-xl text-xs shadow-md transition-all inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>کارشناسی و صدور</span>
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
        </div>
      )}

      {/* SUBTAB CONTENT 2: USER DIRECTORY & CREATOR */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl border shadow-sm">
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-slate-900">مدیریت و تعریف کاربران سیستم</h3>
              <p className="text-xs text-slate-500">لیست تمامی کاربران، پرسنل اداری و مشتریان ثبت‌نام شده در سامانه هوشمند</p>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
            >
              <UserPlus className="w-4.5 h-4.5 text-amber-400" />
              تعریف کاربر / همکار جدید
            </button>
          </div>

          <div className="bg-white rounded-2xl border shadow-md overflow-hidden">
            {usersLoading ? (
              <div className="p-12 text-center text-slate-500 text-xs">در حال واکشی لیست کاربران...</div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">هیچ کاربری یافت نشد.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-black border-b">
                    <tr>
                      <th className="p-4">نام کامل</th>
                      <th className="p-4">نام کاربری / ایمیل</th>
                      <th className="p-4">تلفن همراه</th>
                      <th className="p-4">کد ملی ده رقمی</th>
                      <th className="p-4">نقش دسترسی</th>
                      <th className="p-4">تاریخ ثبت‌نام</th>
                      <th className="p-4 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-55/60 transition-colors">
                        <td className="p-4 font-extrabold text-slate-900">{u.fullName}</td>
                        <td className="p-4 font-mono text-[11px] text-slate-650">{u.email}</td>
                        <td className="p-4 font-mono font-bold text-slate-700">{u.mobile}</td>
                        <td className="p-4 font-mono text-slate-700">{u.nationalId || 'نامشخص'}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            u.role === 'admin' 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                              : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          }`}>
                            {u.role === 'admin' ? '🛡️ مدیر ارشد / کارشناس' : '👤 کاربر عادی'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{u.createdAt}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            disabled={u.username === 'sadegh'}
                            className={`p-2 rounded-lg ${
                              u.username === 'sadegh' 
                                ? 'text-slate-300 cursor-not-allowed' 
                                : 'text-rose-600 hover:bg-rose-50'
                            }`}
                            title="حذف کاربر"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB CONTENT 3: ANALYTICS DASHBOARD */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Bento Stats Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-white p-5 sm:p-6 rounded-2xl border shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">مجموع استعلام‌ها</span>
                <span className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700">
                  <Layers className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">{totalCount}</p>
              <div className="text-[10px] text-slate-400 font-bold">درخواست‌های ثبت‌شده کل</div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">بیمه‌نامه‌های صادر شده</span>
                <span className="p-2.5 bg-emerald-700 rounded-xl text-white">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-black text-emerald-800">{issuedCount}</p>
              <div className="text-[10px] text-emerald-700 font-bold">نرخ صدور نهایی: {totalCount > 0 ? Math.round((issuedCount / totalCount) * 100) : 0}٪</div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">سفارشات معلق کارشناسی</span>
                <span className="p-2.5 bg-amber-50 rounded-xl text-amber-700">
                  <Clock className="w-5 h-5 animate-pulse" />
                </span>
              </div>
              <p className="text-2xl font-black text-amber-600">{pendingCount + inProgressCount}</p>
              <div className="text-[10px] text-slate-400 font-bold">در حال پردازش اداری</div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">کاربران ثبت‌نام شده</span>
                <span className="p-2.5 bg-slate-900 rounded-xl text-amber-400">
                  <Users className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">{users.length}</p>
              <div className="text-[10px] text-slate-400 font-bold">تعداد کل اعضا و پرسنل</div>
            </div>

          </div>

          {/* Graphical Analytics and Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Right Panel: Insurance distribution */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border shadow-md space-y-5">
              <div className="flex items-center gap-1.5 pb-3 border-b">
                <LineChart className="w-5 h-5 text-emerald-700" />
                <h4 className="font-extrabold text-sm text-slate-900">توزیع انواع بیمه‌نامه‌های استعلامی</h4>
              </div>

              <div className="space-y-4 text-xs font-bold text-slate-650">
                
                {/* Third Party */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>🚗 بیمه شخص ثالث خودرو</span>
                    <span className="text-slate-950">{typeThirdParty} درخواست ({totalCount > 0 ? Math.round((typeThirdParty / totalCount) * 100) : 0}٪)</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full" 
                      style={{ width: `${totalCount > 0 ? (typeThirdParty / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Body */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>🛡️ بیمه بدنه خودرو</span>
                    <span className="text-slate-950">{typeBody} درخواست ({totalCount > 0 ? Math.round((typeBody / totalCount) * 100) : 0}٪)</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-600 h-full rounded-full" 
                      style={{ width: `${totalCount > 0 ? (typeBody / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Fire */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>🏢 بیمه آتش‌سوزی و زلزله</span>
                    <span className="text-slate-950">{typeFire} درخواست ({totalCount > 0 ? Math.round((typeFire / totalCount) * 100) : 0}٪)</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="bg-slate-800 h-full rounded-full" 
                      style={{ width: `${totalCount > 0 ? (typeFire / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Others */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>➕ سایر بیمه‌نامه‌ها (درمان، مسئولیت و...)</span>
                    <span className="text-slate-950">{typeOther} درخواست ({totalCount > 0 ? Math.round((typeOther / totalCount) * 100) : 0}٪)</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full" 
                      style={{ width: `${totalCount > 0 ? (typeOther / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Left Panel: Financial Estimations */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 pb-3 border-b mb-4">
                  <Percent className="w-5 h-5 text-amber-500" />
                  <h4 className="font-extrabold text-sm text-slate-900">برآورد کارمزد و بازدهی مالی</h4>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-600">
                  <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center">
                    <span>میانگین حق بیمه هر پرونده:</span>
                    <span className="text-slate-950 font-black">۴,۸۰۰,۰۰۰ تومان</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center">
                    <span>برآورد حجم کل بیمه صادر شده:</span>
                    <span className="text-emerald-700 font-black">{issuedCount * 4800000} تومان</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center">
                    <span>کارمزد میانگین نمایندگی (۱۲٪):</span>
                    <span className="text-amber-600 font-black">{Math.round(issuedCount * 4800000 * 0.12)} تومان</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-[11px] text-emerald-900 font-medium leading-relaxed mt-4">
                💡 این برآورد به صورت خودکار بر اساس پرونده‌های نهایی با وضعیت <strong>«صادر شده»</strong> محاسبه شده است. تغییر دستی حق بیمه در پنل استعلام‌ها بر روی این آمار تأثیر مستقیم خواهد داشت.
              </div>
            </div>

          </div>

          {/* SMS Notification logs in dashboard */}
          <div className="bg-white rounded-3xl p-6 border shadow-md space-y-4">
            <div className="flex items-center gap-1.5 pb-2 border-b">
              <MessageSquare className="w-5 h-5 text-emerald-750" />
              <h4 className="font-extrabold text-sm text-slate-900">لاگ‌ها و پیامک‌های ارسالی به مشتریان</h4>
            </div>

            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-right text-[11px]">
                <thead className="bg-slate-50 text-slate-700 font-extrabold sticky top-0 border-b">
                  <tr>
                    <th className="p-2">شماره همراه</th>
                    <th className="p-2">کد پیگیری پرونده</th>
                    <th className="p-2">متن پیامک ارسالی</th>
                    <th className="p-2">زمان ارسال</th>
                    <th className="p-2 text-center">وضعیت دلیوری</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-650">
                  {smsLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-2 font-mono">{log.mobile}</td>
                      <td className="p-2 font-mono">{log.trackingCode}</td>
                      <td className="p-2 max-w-[250px] truncate" title={log.message}>{log.message}</td>
                      <td className="p-2">{log.sentAt}</td>
                      <td className="p-2 text-center">
                        <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {log.status === 'sent' ? 'ارسال موفق' : log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB CONTENT 4: CUSTOM FORMS MANAGEMENT */}
      {activeSubTab === 'forms' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border shadow-md space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-black text-slate-900">مدیریت فیلدها و مدارک اختصاصی رشته‌های بیمه</h3>
            <p className="text-xs text-slate-500 mt-1">
              در این پنل می‌توانید ردیف‌های مدارک و فیلدهای ورودی هر کدام از رشته‌های بیمه‌ای را برای اخذ مستندات از مشتری به‌صورت پویا مدیریت کنید.
            </p>
          </div>
          <FormsManagementPanel />
        </div>
      )}

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
                  <FileText className="w-4.5 h-4.5 text-emerald-700" />
                  تصاویر مدارک بارگذاری شده توسط مشتری:
                </h4>

                {!selectedInquiry.documents || selectedInquiry.documents.length === 0 ? (
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
                          مشاهده مدرک
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expert Action Section */}
              <div className="pt-4 border-t space-y-4 text-right">
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

                <label className="flex items-center gap-2 font-bold text-slate-850 cursor-pointer">
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

      {/* ADD USER MODAL MANUALLY */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border shadow-2xl w-full max-w-md overflow-hidden text-right">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-sm">تعریف کاربر یا همکار جدید</h4>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUserManually} className="p-6 space-y-4 text-xs">
              
              {userError && (
                <div className="p-3 bg-rose-50 text-rose-900 border border-rose-200 rounded-xl font-bold">
                  {userError}
                </div>
              )}

              {userSuccess && (
                <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl font-bold">
                  {userSuccess}
                </div>
              )}

              <div className="space-y-1">
                <label className="block font-bold text-slate-750">نام و نام خانوادگی <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="مثال: صادق گلزار"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-750">شماره همراه <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 09121112233"
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-750">کد ملی ده رقمی</label>
                <input
                  type="text"
                  placeholder="مثال: 0012345678"
                  value={newNationalId}
                  onChange={(e) => setNewNationalId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-750">آدرس ایمیل <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  required
                  placeholder="مثال: employee@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white outline-none font-bold dir-ltr text-right"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-750">نام کاربری اختصاصی <span className="text-slate-400 font-normal text-[10px]">(اختیاری)</span></label>
                <input
                  type="text"
                  placeholder="پیش‌فرض همان ایمیل خواهد بود"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-750">تعیین رمز عبور ورود <span className="text-rose-500">*</span></label>
                <input
                  type="password"
                  required
                  placeholder="رمز عبور ورود به سامانه"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-750">تعیین نقش و سطح دسترسی <span className="text-rose-500">*</span></label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white outline-none font-bold text-xs"
                >
                  <option value="user">کاربر عادی (مشتری)</option>
                  <option value="admin">مدیر ارشد سیستم / همکار کارشناس</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-2.5 rounded-xl border text-slate-700 font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow"
                >
                  ایجاد و ذخیره کاربر
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
