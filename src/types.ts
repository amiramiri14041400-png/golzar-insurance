export type InsuranceType = 
  | 'third_party'  // بیمه شخص ثالث
  | 'body'         // بیمه بدنه
  | 'fire'         // بیمه آتش‌سوزی و زلزله
  | 'health'       // بیمه تکمیلی درمان
  | 'life'         // بیمه عمر و سرمایه‌گذاری
  | 'liability'    // بیمه مسئولیت
  | 'travel';      // بیمه مسافرتی

export type InquiryStatus = 
  | 'pending'           // در انتظار بررسی
  | 'in_progress'       // در حال پیگیری و کارشناسی
  | 'ready_for_issuance'// آماده صدور و واریز
  | 'issued'            // صادر شده
  | 'rejected';         // رد شده / انصراف

export interface UploadedDocument {
  id: string;
  type: 'car_card_front' | 'car_card_back' | 'prev_policy' | 'national_card' | 'driving_license' | 'other';
  label: string;
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  uploadedAt: string;
}

export interface Inquiry {
  id: string;
  trackingCode: string; // e.g. IR30962-92814
  insuranceType: InsuranceType;
  fullName: string;
  nationalId: string;
  mobile: string;
  province: string;
  city: string;
  address?: string;
  status: InquiryStatus;
  formData: Record<string, any>;
  documents: UploadedDocument[];
  expertNotes?: string;
  issuedPolicyUrl?: string;
  issuedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SmsLog {
  id: string;
  mobile: string;
  trackingCode: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed';
  sentAt: string;
  provider: 'FarazSMS' | 'Kavenegar' | 'MeliPayamak' | 'SystemSimulated';
}

export interface AgencyInfo {
  code: string;
  name: string;
  agentName: string;
  phone1: string;
  phone2: string;
  mobileEmergency: string;
  address: string;
  province: string;
  city: string;
  workingHours: string;
  licenseNumber: string;
  email: string;
}

export const IRAN_BIMEH_AGENCY: AgencyInfo = {
  code: '30962',
  name: 'نمایندگی گلزار',
  agentName: 'مهندس گلزار',
  phone1: '۰۲۱-۸۸۹۹۰۰۱۱',
  phone2: '۰۲۱-۸۸۹۹۰۰۱۲',
  mobileEmergency: '۰۹۱۲۳۴۵۶۷۸۹',
  address: 'تهران، خیابان ولیعصر، نرسیده به میدان ونک، مجتمع تجاری اداری گلزار، طبقه دوم، واحد ۳۰۹',
  province: 'تهران',
  city: 'تهران',
  workingHours: 'شنبه تا چهارشنبه ۸:۰۰ الی ۱۸:۰۰ | پنجشنبه‌ها ۸:۰۰ الی ۱۳:۰۰',
  licenseNumber: 'ب‌ا/۳۰۹۶۲/۱۴۰۲',
  email: 'info@iranbimeh30962.ir'
};
