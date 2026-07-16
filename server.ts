import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { Inquiry, SmsLog, IRAN_BIMEH_AGENCY, User, CustomField } from './src/types.js';
import { 
  calculateThirdPartyPremium, 
  calculateBodyPremium, 
  calculateFirePremium, 
  calculateHealthPremium,
  calculateLiabilityPremium
} from './src/utils/calculator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory data store initialized with seed items
let inquiriesStore: Inquiry[] = [
  {
    id: 'inq-101',
    trackingCode: 'IR30962-84910',
    insuranceType: 'third_party',
    fullName: 'رضا حسینی پور',
    nationalId: '۰۰۷۸۹۱۲۳۴۵',
    mobile: '09121112233',
    province: 'تهران',
    city: 'تهران',
    address: 'خیابان شریعتی، بالاتر از پل رومی، پلاک ۴۲',
    status: 'pending',
    formData: {
      vehicleType: 'پژو پارس TU5',
      modelYear: '1401',
      plateNumber: '55 ج 892 - ایران 77',
      previousCompany: 'بیمه ایران',
      noClaimDiscount: '30% (3 سال تخفیف)',
      financialLimit: '100,000,000 تومان'
    },
    documents: [
      {
        id: 'doc-1',
        type: 'car_card_front',
        label: 'روی کارت خودرو',
        fileName: 'car_card_front_peugeot.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
        fileSize: '1.2 MB',
        uploadedAt: '1403/04/10 - 10:15'
      }
    ],
    expertNotes: 'مشتری درخواست صدور با تخفیف سابقه قبلی دارد.',
    createdAt: '1403/04/10 - 10:15',
    updatedAt: '1403/04/10 - 10:15'
  },
  {
    id: 'inq-102',
    trackingCode: 'IR30962-73821',
    insuranceType: 'body',
    fullName: 'مریم ابراهیمی',
    nationalId: '۱۲۹۴۵۶۷۸۹۰',
    mobile: '09123334455',
    province: 'اصفهان',
    city: 'اصفهان',
    address: 'خیابان چهارباغ بالا، مجتمع کوثر',
    status: 'in_progress',
    formData: {
      vehicleType: 'جک S5 اتوماتیک',
      modelYear: '1402',
      estimatedValue: '1,450,000,000 تومان'
    },
    documents: [],
    expertNotes: 'کارشناس بازدید هماهنگ شد.',
    createdAt: '1403/04/09 - 16:30',
    updatedAt: '1403/04/10 - 09:00'
  }
];

let smsLogsStore: SmsLog[] = [
  {
    id: 'sms-1',
    mobile: '09121112233',
    trackingCode: 'IR30962-84910',
    message: 'رضا حسینی پور عزیز، درخواست استعلام بیمه شما با کد IR30962-84910 در نمایندگی گلزار بیمه ایران (کد ۳۰۹۶۲) ثبت شد.',
    status: 'sent',
    sentAt: '1403/04/10 - 10:15',
    provider: 'FarazSMS'
  }
];


let customFieldsStore: CustomField[] = [
  {
    id: 'cf-1',
    insuranceType: 'third_party',
    label: 'تصویر کارت خودرو (پشت و رو)',
    type: 'file_image_or_pdf',
    required: true,
    placeholder: 'لطفا تصویر پشت و روی کارت خودرو را بارگذاری کنید',
    createdAt: '1403/04/10 - 10:15'
  },
  {
    id: 'cf-2',
    insuranceType: 'third_party',
    label: 'تصویر گواهی معاینه فنی خودرو',
    type: 'file_image_or_pdf',
    required: false,
    placeholder: 'اختیاری - در صورت وجود جهت دریافت امتیاز سلامت فنی',
    createdAt: '1403/04/10 - 10:15'
  },
  {
    id: 'cf-3',
    insuranceType: 'fire',
    label: 'کد پستی ملک مورد بیمه',
    type: 'number',
    required: true,
    digitCount: 10,
    placeholder: 'کد پستی ده رقمی ملک مسکونی یا تجاری را وارد کنید',
    createdAt: '1403/04/10 - 10:15'
  },
  {
    id: 'cf-4',
    insuranceType: 'travel',
    label: 'تصویر صفحه اول پاسپورت',
    type: 'file_image_or_pdf',
    required: true,
    placeholder: 'تصویر خوانا از صفحه اول گذرنامه مسافر',
    createdAt: '1403/04/10 - 10:15'
  },
  {
    id: 'cf-5',
    insuranceType: 'liability',
    label: 'تصویر پروانه کسب یا جواز فعالیت',
    type: 'file_image_or_pdf',
    required: true,
    placeholder: 'جواز کسب کارگاه، پروانه مطب یا سند احراز فعالیت صنفی',
    createdAt: '1403/04/10 - 10:15'
  }
];

interface UserStoreItem {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  fullName: string;
  mobile: string;
  nationalId?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

let usersStore: UserStoreItem[] = [
  {
    id: 'user-admin',
    email: 'sadegh@golzar.ir',
    username: 'sadegh',
    passwordHash: '123456',
    fullName: 'صادق گلزار (مدیر)',
    mobile: '09123456789',
    nationalId: '0012345678',
    role: 'admin',
    createdAt: '1403/01/01 - 08:00'
  },
  {
    id: 'user-1',
    email: 'user@gmail.com',
    username: 'user@gmail.com',
    passwordHash: '123456',
    fullName: 'امیر امیری',
    mobile: '09121112233',
    nationalId: '0078912345',
    role: 'user',
    createdAt: '1403/04/10 - 10:15'
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // Helper: Format Persian Jalali date simulation
  const getPersianDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} - ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // Auth API: Login
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'نام کاربری و رمز عبور الزامی است.' });
    }

    const user = usersStore.find(u => 
      (u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()) && 
      u.passwordHash === password
    );

    if (!user) {
      return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        mobile: user.mobile,
        nationalId: user.nationalId,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  });

  // Auth API: Register
  app.post('/api/auth/register', (req, res) => {
    const { email, password, fullName, mobile, nationalId } = req.body;
    if (!email || !password || !fullName || !mobile) {
      return res.status(400).json({ error: 'وارد کردن فیلدهای ستاره‌دار الزامی است.' });
    }

    const existingUser = usersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'کاربری با این ایمیل قبلاً ثبت‌نام کرده است.' });
    }

    const newUser: UserStoreItem = {
      id: `user-${Date.now()}`,
      email: email,
      username: email,
      passwordHash: password,
      fullName,
      mobile,
      nationalId,
      role: 'user',
      createdAt: getPersianDateStr()
    };

    usersStore.push(newUser);

    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        fullName: newUser.fullName,
        mobile: newUser.mobile,
        nationalId: newUser.nationalId,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  });

  // User inquiries filtering
  app.get('/api/my-inquiries', (req, res) => {
    const { mobile, nationalId } = req.query;
    if (!mobile && !nationalId) {
      return res.status(400).json({ error: 'شماره موبایل یا کد ملی جهت استعلام الزامی است.' });
    }

    const filtered = inquiriesStore.filter(inq => 
      (mobile && inq.mobile === mobile) || 
      (nationalId && inq.nationalId === nationalId)
    );

    res.json(filtered);
  });

  // Admin API: Get all users
  app.get('/api/users', (req, res) => {
    const safeUsers = usersStore.map(u => ({
      id: u.id,
      email: u.email,
      username: u.username,
      fullName: u.fullName,
      mobile: u.mobile,
      nationalId: u.nationalId,
      role: u.role,
      createdAt: u.createdAt
    }));
    res.json(safeUsers);
  });

  // Admin API: Create User manually
  app.post('/api/users', (req, res) => {
    const { email, username, password, fullName, mobile, nationalId, role } = req.body;
    if (!email || !password || !fullName || !mobile) {
      return res.status(400).json({ error: 'فیلدهای الزامی خالی هستند.' });
    }

    const existingUser = usersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'کاربری با این ایمیل قبلاً ثبت شده است.' });
    }

    const newUser: UserStoreItem = {
      id: `user-${Date.now()}`,
      email,
      username: username || email,
      passwordHash: password,
      fullName,
      mobile,
      nationalId,
      role: role || 'user',
      createdAt: getPersianDateStr()
    };

    usersStore.push(newUser);
    res.status(201).json({ success: true, user: newUser });
  });

  // Admin API: Delete User
  app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const userIndex = usersStore.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'کاربر پیدا نشد.' });
    }

    const user = usersStore[userIndex];
    if (user.username === 'sadegh') {
      return res.status(400).json({ error: 'مدیر ارشد سیستم قابل حذف نیست.' });
    }

    usersStore.splice(userIndex, 1);
    res.json({ success: true, message: 'کاربر با موفقیت حذف شد.' });
  });

  // Admin API: Get all custom fields
  app.get('/api/custom-fields', (req, res) => {
    res.json(customFieldsStore);
  });

  // Admin API: Create or update custom field
  app.post('/api/custom-fields', (req, res) => {
    const { id, insuranceType, label, type, required, digitCount, placeholder, options } = req.body;
    if (!insuranceType || !label || !type) {
      return res.status(400).json({ error: 'نوع بیمه‌نامه، عنوان فیلد و نوع فیلد الزامی هستند.' });
    }

    if (id) {
      // Edit existing field
      const index = customFieldsStore.findIndex(cf => cf.id === id);
      if (index !== -1) {
        customFieldsStore[index] = {
          ...customFieldsStore[index],
          insuranceType,
          label,
          type,
          required: !!required,
          digitCount: digitCount ? Number(digitCount) : undefined,
          placeholder: placeholder || '',
          options: options || []
        };
        return res.json({ success: true, customField: customFieldsStore[index] });
      }
    }

    // Add new field
    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      insuranceType,
      label,
      type,
      required: !!required,
      digitCount: digitCount ? Number(digitCount) : undefined,
      placeholder: placeholder || '',
      options: options || [],
      createdAt: getPersianDateStr()
    };

    customFieldsStore.push(newField);
    res.status(201).json({ success: true, customField: newField });
  });

  // Admin API: Delete custom field
  app.delete('/api/custom-fields/:id', (req, res) => {
    const { id } = req.params;
    const index = customFieldsStore.findIndex(cf => cf.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'فیلد سفارشی پیدا نشد.' });
    }

    customFieldsStore.splice(index, 1);
    res.json({ success: true, message: 'فیلد سفارشی با موفقیت حذف شد.' });
  });

  // Helper: Generate tracking code
  const generateTrackingCode = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `IR30962-${randomNum}`;
  };

  // API 1: Get Agency Info
  app.get('/api/agency', (req, res) => {
    res.json(IRAN_BIMEH_AGENCY);
  });

  // API 2: Get all inquiries (For Admin)
  app.get('/api/inquiries', (req, res) => {
    res.json(inquiriesStore);
  });

  // API 3: Create new Inquiry
  app.post('/api/inquiries', (req, res) => {
    const { insuranceType, fullName, nationalId, mobile, province, city, address, formData, documents } = req.body;

    if (!fullName || !mobile || !nationalId) {
      return res.status(400).json({ error: 'نام و نام خانوادگی، شماره ملی و شماره موبایل الزامی است.' });
    }

    const trackingCode = generateTrackingCode();
    const nowStr = getPersianDateStr();

    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      trackingCode,
      insuranceType: insuranceType || 'third_party',
      fullName,
      nationalId,
      mobile,
      province: province || 'تهران',
      city: city || 'تهران',
      address: address || '',
      status: 'pending',
      formData: formData || {},
      documents: documents || [],
      createdAt: nowStr,
      updatedAt: nowStr
    };

    inquiriesStore.unshift(newInquiry);

    // Create automated SMS log
    const smsMessage = `${fullName} عزیز، درخواست بیمه شما با کد پیگیری ${trackingCode} در نمایندگی گلزار بیمه ایران (کد ۳۰۹۶۲) ثبت شد. کارشناسان ما به زودی با شما تماس خواهند گرفت.`;
    const smsLog: SmsLog = {
      id: `sms-${Date.now()}`,
      mobile,
      trackingCode,
      message: smsMessage,
      status: 'sent',
      sentAt: nowStr,
      provider: 'FarazSMS'
    };
    smsLogsStore.unshift(smsLog);

    res.status(201).json({
      success: true,
      inquiry: newInquiry,
      sms: smsLog
    });
  });

  // API 4: Track Inquiry by Code or Mobile
  app.get('/api/inquiries/track/:query', (req, res) => {
    const query = req.params.query.trim();
    const results = inquiriesStore.filter(item => 
      item.trackingCode.toLowerCase() === query.toLowerCase() ||
      item.mobile.replace(/\s+/g, '') === query.replace(/\s+/g, '') ||
      item.nationalId === query
    );

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'هیچ درخواستی با این کد پیگیری یا شماره پیدا نشد.' });
    }

    res.json({ success: true, inquiries: results });
  });

  // API 5: Update Inquiry Status & Notes (Admin Action)
  app.patch('/api/inquiries/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, expertNotes, issuedPolicyUrl, sendSms } = req.body;

    const inquiry = inquiriesStore.find(i => i.id === id);
    if (!inquiry) {
      return res.status(404).json({ error: 'درخواست پیدا نشد.' });
    }

    if (status) inquiry.status = status;
    if (expertNotes !== undefined) inquiry.expertNotes = expertNotes;
    if (issuedPolicyUrl !== undefined) {
      inquiry.issuedPolicyUrl = issuedPolicyUrl;
      inquiry.issuedAt = getPersianDateStr();
    }
    inquiry.updatedAt = getPersianDateStr();

    let smsLog: SmsLog | null = null;
    if (sendSms) {
      let statusTextFa = '';
      switch(inquiry.status) {
        case 'in_progress': statusTextFa = 'در حال پیگیری و بررسی توسط کارشناس'; break;
        case 'ready_for_issuance': statusTextFa = 'آماده صدور و واریز وجه'; break;
        case 'issued': statusTextFa = 'بیمه‌نامه با موفقیت صادر شد'; break;
        case 'rejected': statusTextFa = 'متأسفانه لغو یا بایگانی شد'; break;
        default: statusTextFa = 'در انتظار بررسی'; break;
      }

      const message = `${inquiry.fullName} عزیز، وضعیت درخواست بیمه کد ${inquiry.trackingCode} به "${statusTextFa}" تغییر یافت. بیمه ایران نمایندگی گلزار ۳۰۹۶۲. تلفن: ۰۲۱-۸۸۹۹۰۰۱۱`;
      smsLog = {
        id: `sms-${Date.now()}`,
        mobile: inquiry.mobile,
        trackingCode: inquiry.trackingCode,
        message,
        status: 'sent',
        sentAt: getPersianDateStr(),
        provider: 'FarazSMS'
      };
      smsLogsStore.unshift(smsLog);
    }

    res.json({
      success: true,
      inquiry,
      sms: smsLog
    });
  });

  // API 6: Get SMS Logs
  app.get('/api/sms-logs', (req, res) => {
    res.json(smsLogsStore);
  });

  // API Custom Fields: Get all custom fields
  app.get('/api/custom-fields', (req, res) => {
    res.json(customFieldsStore);
  });

  // API Custom Fields: Create a custom field
  app.post('/api/custom-fields', (req, res) => {
    const { insuranceType, label, type, required, digitCount, placeholder, options } = req.body;

    if (!insuranceType || !label || !type) {
      return res.status(400).json({ error: 'نوع بیمه‌نامه، عنوان فیلد و نوع فیلد الزامی است.' });
    }

    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      insuranceType,
      label,
      type,
      required: !!required,
      digitCount: digitCount ? Number(digitCount) : undefined,
      placeholder: placeholder || '',
      options: options || [],
      createdAt: getPersianDateStr()
    };

    customFieldsStore.push(newField);
    res.status(201).json({ success: true, field: newField });
  });

  // API Custom Fields: Delete a custom field
  app.delete('/api/custom-fields/:id', (req, res) => {
    const { id } = req.params;
    const index = customFieldsStore.findIndex(f => f.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'فیلد مورد نظر پیدا نشد.' });
    }

    customFieldsStore.splice(index, 1);
    res.json({ success: true, message: 'فیلد اختصاصی با موفقیت حذف شد.' });
  });

  // API 7: AI Insurance Assistant (Gemini API)
  app.post('/api/ai-consultant', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'متن پرسش الزامی است.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          response: `سلام! من مشاور هوشمند بیمه ایران (نمایندگی گلزار کد ۳۰۹۶۲) هستم. پاسخ سوال شما: درباره ${prompt}، در بیمه ایران نمایندگی گلزار امکان استعلام آنلاین، اعمال حداکثر تخفیف‌های قانونی و صدور فوری وجود دارد. برای راهنمایی دقیق‌تر می‌توانید با شماره ۰۲۱-۸۸۹۹۰۰۱۱ تماس بگیرید.`
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Function declarations for Gemini tools (1405 Bimeh Iran guidelines)
      const calculateThirdPartyDeclaration = {
        name: 'calculateThirdPartyPremium',
        description: 'این تابع برای محاسبه دقیق بیمه شخص ثالث خودرو با مشخصات ورودی کاربر و قوانین سال ۱۴۰۵ استفاده می‌شود.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            vehicleType: {
              type: Type.STRING,
              description: 'نوع خودرو: passenger_4cyl (سواری ۴ سیلندر)، passenger_6cyl (سواری ۶ سیلندر یا شاسی بلند)، motorcycle (موتورسیکلت)، pickup (وانت و نیسان)، heavy (سنگین و کامیون)',
              enum: ['passenger_4cyl', 'passenger_6cyl', 'motorcycle', 'pickup', 'heavy']
            },
            modelYear: {
              type: Type.INTEGER,
              description: 'سال ساخت خودرو به شمسی (مثلاً 1404 یا 1405)'
            },
            noClaimDiscountYears: {
              type: Type.INTEGER,
              description: 'تعداد سال تخفیف عدم خسارت بیمه ثالث (بین 0 تا 14 سال)'
            },
            driverDiscountYears: {
              type: Type.INTEGER,
              description: 'تعداد سال تخفیف گواهینامه راننده (بین 0 تا 14 سال)'
            },
            financialLimit: {
              type: Type.INTEGER,
              description: 'تعهد مالی درخواستی به تومان (مثلا 100000000 برای ۱۰۰ میلیون یا تا ۸۰۰ میلیون تومان)'
            },
            previousCompany: {
              type: Type.STRING,
              description: 'شرکت بیمه قبلی'
            },
            hasDamageHistory: {
              type: Type.BOOLEAN,
              description: 'آیا در سال گذشته سابقه خسارت داشته است؟'
            },
            paymentMode: {
              type: Type.STRING,
              description: 'روش پرداخت: cash (نقدی شامل ۱۰٪ تخفیف) یا installments (اقساطی با پیش‌پرداخت ۳۰٪)',
              enum: ['cash', 'installments']
            },
            installmentCount: {
              type: Type.INTEGER,
              description: 'تعداد اقساط در صورت پرداخت اقساطی (بین ۱ تا ۸ ماه)'
            }
          },
          required: ['vehicleType', 'modelYear', 'noClaimDiscountYears']
        }
      };

      const calculateBodyDeclaration = {
        name: 'calculateBodyPremium',
        description: 'این تابع برای محاسبه دقیق بیمه بدنه خودرو با مشخصات ورودی کاربر طبق تعرفه سال ۱۴۰۵ استفاده می‌شود.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            vehicleType: {
              type: Type.STRING,
              description: 'نوع خودرو'
            },
            vehicleValueTomans: {
              type: Type.INTEGER,
              description: 'ارزش تقریبی خودرو به تومان (مثلا 850000000)'
            },
            modelYear: {
              type: Type.INTEGER,
              description: 'سال ساخت خودرو به شمسی'
            },
            noClaimYears: {
              type: Type.INTEGER,
              description: 'سال تخفیف عدم خسارت بیمه بدنه (بین 0 تا 10 سال)'
            },
            coverGlass: {
              type: Type.BOOLEAN,
              description: 'آیا پوشش شیشه می‌خواهد؟'
            },
            coverNaturalDisasters: {
              type: Type.BOOLEAN,
              description: 'آیا پوشش بلایای طبیعی می‌خواهد؟'
            },
            coverChemicals: {
              type: Type.BOOLEAN,
              description: 'آیا پوشش مواد شیمیایی می‌خواهد؟'
            },
            coverPriceFluctuation: {
              type: Type.BOOLEAN,
              description: 'آیا پوشش نوسان قیمت می‌خواهد؟'
            },
            paymentMode: {
              type: Type.STRING,
              description: 'روش پرداخت: cash (نقدی شامل ۱۰٪ تخفیف) یا installments (اقساطی)',
              enum: ['cash', 'installments']
            },
            installmentCount: {
              type: Type.INTEGER,
              description: 'تعداد اقساط (مثلاً ۴ یا ۶ ماه)'
            }
          },
          required: ['vehicleValueTomans', 'noClaimYears']
        }
      };

      const calculateFireDeclaration = {
        name: 'calculateFirePremium',
        description: 'این تابع برای محاسبه بیمه آتش‌سوزی، زلزله و طرح نوین جام زرین بیمه ایران سال ۱۴۰۵ استفاده می‌شود.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            propertyType: {
              type: Type.STRING,
              description: 'نوع ملک: residential (مسکونی)، commercial (تجاری)، industrial (صنعتی)',
              enum: ['residential', 'commercial', 'industrial']
            },
            buildingValueTomans: {
              type: Type.INTEGER,
              description: 'ارزش ساخت و اعیان ملک به تومان'
            },
            appliancesValueTomans: {
              type: Type.INTEGER,
              description: 'ارزش لوازم و اثاثیه ملک به تومان'
            },
            areaSizeSqm: {
              type: Type.INTEGER,
              description: 'متراژ ملک به مترمربع'
            },
            coverEarthquake: {
              type: Type.BOOLEAN,
              description: 'آیا پوشش زلزله فعال باشد؟'
            },
            coverPipeBurst: {
              type: Type.BOOLEAN,
              description: 'آیا پوشش ترکیدگی لوله آب فعال باشد؟'
            },
            coverFlood: {
              type: Type.BOOLEAN,
              description: 'آیا پوشش سیل فعال باشد?'
            },
            isJaamZarrin: {
              type: Type.BOOLEAN,
              description: 'آیا مایل به خرید طرح نوین جام زرین بیمه ایران (پکیج جامع لوکس سرقت، آتش‌سوزی و دارایی‌های نفیس داخل گاوصندوق) است؟'
            },
            goldAssetValueTomans: {
              type: Type.INTEGER,
              description: 'ارزش تقریبی طلا، مسکوکات و ارز موجود در منزل جهت پوشش سرقت جام زرین به تومان'
            },
            paymentMode: {
              type: Type.STRING,
              description: 'روش پرداخت: cash یا installments',
              enum: ['cash', 'installments']
            },
            installmentCount: {
              type: Type.INTEGER,
              description: 'تعداد اقساط'
            }
          },
          required: ['propertyType', 'buildingValueTomans', 'appliancesValueTomans']
        }
      };

      const calculateHealthDeclaration = {
        name: 'calculateHealthPremium',
        description: 'این تابع برای محاسبه بیمه درمان تکمیلی انفرادی و طرح نوین سما زرین بیمه ایران سال ۱۴۰۵ استفاده می‌شود.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            planType: {
              type: Type.STRING,
              description: 'نوع طرح: basic (پایه)، standard (استاندارد)، golden (طلایی)',
              enum: ['basic', 'standard', 'golden']
            },
            ageCategory: {
              type: Type.STRING,
              description: 'رده سنی بیمه‌شده: under_40 (زیر ۴۰ سال)، 40_to_60 (۴۰ تا ۶۰ سال)، over_60 (بالای ۶۰ سال)',
              enum: ['under_40', '40_to_60', 'over_60']
            },
            personCount: {
              type: Type.INTEGER,
              description: 'تعداد افراد خانواده تحت پوشش'
            },
            hasDental: {
              type: Type.BOOLEAN,
              description: 'آیا پوشش دندانپزشکی فعال باشد؟'
            },
            isSamaZarrin: {
              type: Type.BOOLEAN,
              description: 'آیا مایل به عضویت در طرح نوین سما زرین بیمه ایران (تکمیلی درمان جامع + سرمایه‌گذاری عمر و حوادث انفرادی) است؟'
            },
            occupation: {
              type: Type.STRING,
              description: 'شغل دقیق بیمه‌گذار (برای ارزیابی ریسک و اعمال در حق بیمه)'
            },
            jobRiskCategory: {
              type: Type.INTEGER,
              description: 'گروه ریسک شغلی از ۱ تا ۵ (۱: کم‌ریسک اداری، ۲: پزشک و فروشنده، ۳: راننده و کارگر فنی، ۴: ساختمان و معدن، ۵: مشاغل پرخطر ویژه)'
            },
            paymentMode: {
              type: Type.STRING,
              description: 'روش پرداخت: cash یا installments',
              enum: ['cash', 'installments']
            },
            installmentCount: {
              type: Type.INTEGER,
              description: 'تعداد اقساط'
            }
          },
          required: ['planType', 'ageCategory', 'personCount']
        }
      };

      const calculateLiabilityDeclaration = {
        name: 'calculateLiabilityPremium',
        description: 'این تابع برای محاسبه دقیق بیمه مسئولیت مدنی، حرفه‌ای پزشکان و کارفرما بر اساس دیه سال ۱۴۰۵ استفاده می‌شود.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            liabilityType: {
              type: Type.STRING,
              description: 'نوع بیمه مسئولیت: employer (کارفرما در قبال کارکنان)، civil (مسئولیت مدنی عمومی)، professional (حرفه‌ای پزشکان و پیراپزشکان)',
              enum: ['employer', 'civil', 'professional']
            },
            staffCount: {
              type: Type.INTEGER,
              description: 'تعداد کارکنان تحت پوشش (فقط برای نوع کارفرما)'
            },
            occupation: {
              type: Type.STRING,
              description: 'شغل یا حوزه دقیق فعالیت بیمه‌گذار'
            },
            jobRiskCategory: {
              type: Type.INTEGER,
              description: 'گروه ریسک شغلی از ۱ تا ۵ (مثلاً ۱ برای منشی و ۲ برای پزشک و ۴ برای کارگر ساختمانی)'
            },
            coverageLimitTomans: {
              type: Type.INTEGER,
              description: 'تعهد دیه درخواستی به تومان (تعهد پایه سال ۱۴۰۵ معادل ۱,۲۰۰,۰۰۰,۰۰۰ تومان دیه کامل است)'
            },
            paymentMode: {
              type: Type.STRING,
              description: 'روش پرداخت: cash یا installments',
              enum: ['cash', 'installments']
            },
            installmentCount: {
              type: Type.INTEGER,
              description: 'تعداد اقساط'
            }
          },
          required: ['liabilityType', 'occupation', 'jobRiskCategory', 'coverageLimitTomans']
        }
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{
              text: `تو مشاور رسمی و متخصص بیمه ایران نمایندگی گلزار (کد ۳۰۹۶۲) هستی. پاسخ را به زبان فارسی روان، محترمانه، کاربردی و بر اساس آخرین بخشنامه‌ها و قوانین سال ۱۴۰۵ (۲۰۲۶ میلادی) بده.
تاکید کن که نمایندگی گلزار کد ۳۰۹۶۲ امکان صدور آنلاین، تحویل فوری و مشاوره رایگان دارد.

اگر کاربر اطلاعات لازم برای محاسبه (مانند نوع خودرو، سال ساخت، ارزش روز خودرو، ارزش ساخت ملک، شغل دقیق، سن یا طرح‌های نوین جام زرین/سما زرین) را ارائه کرده، تو حتماً باید تابع/ابزار مربوطه را با پارامترهای مناسب و دقیق صدا بزنی.
اگر اطلاعات کامل نیست، حدود کلی را طبق قوانین ۱۴۰۵ ارائه بده و محترمانه پارامترهای گمشده را بپرس (به خصوص شغل برای بیمه‌های مسئولیت و حوادث، سال عدم خسارت برای خودرو، و روش پرداخت نقدی/اقساطی).

توضیحات طرح‌های جدید بیمه ایران برای راهنمایی:
۱. طرح جام زرین: پکیج بیمه لوکس آتش‌سوزی، سیل، زلزله و سرقت منزل به همراه پوشش ویژه طلا و جواهرات داخل گاوصندوق تا سقف ارزش اعلامی کاربر.
۲. طرح سما زرین: پکیج درمان تکمیلی لوکس همراه با بیمه عمر، سرمایه‌گذاری و حوادث انفرادی که بر اساس شغل و سن بیمه‌گذار محاسبه می‌شود.

مهم‌ترین قانون: فقط و فقط قیمت یا اطلاعات مربوط به نوع بیمه‌ای که کاربر درباره آن سوال کرده ارائه بده.

درخواست یا سوال کاربر: ${prompt}`
            }]
          }
        ],
        config: {
          tools: [{
            functionDeclarations: [
              calculateThirdPartyDeclaration,
              calculateBodyDeclaration,
              calculateFireDeclaration,
              calculateHealthDeclaration,
              calculateLiabilityDeclaration
            ]
          }]
        }
      });

      let finalResponseText = '';
      let calculationInfo: any = null;

      if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];
        let calculationResult: any = null;

        try {
          if (call.name === 'calculateThirdPartyPremium') {
            const args = call.args as any;
            calculationResult = calculateThirdPartyPremium({
              vehicleType: args.vehicleType || 'passenger_4cyl',
              modelYear: Number(args.modelYear) || 1405,
              noClaimDiscountYears: args.noClaimDiscountYears !== undefined ? Number(args.noClaimDiscountYears) : 0,
              driverDiscountYears: args.driverDiscountYears !== undefined ? Number(args.driverDiscountYears) : 0,
              financialLimit: Number(args.financialLimit) || 100000000,
              previousCompany: args.previousCompany || 'بیمه ایران',
              hasDamageHistory: !!args.hasDamageHistory,
              paymentMode: args.paymentMode || 'cash',
              installmentCount: Number(args.installmentCount) || 4
            });
            calculationInfo = {
              type: 'third_party',
              basePremium: calculationResult.baseTariff,
              discountAmount: calculationResult.discountAmount,
              finalPremium: calculationResult.finalPremium,
              args: args
            };
          } else if (call.name === 'calculateBodyPremium') {
            const args = call.args as any;
            calculationResult = calculateBodyPremium({
              vehicleType: args.vehicleType || 'passenger_4cyl',
              vehicleValueTomans: Number(args.vehicleValueTomans) || 500000000,
              modelYear: Number(args.modelYear) || 1405,
              noClaimYears: args.noClaimYears !== undefined ? Number(args.noClaimYears) : 0,
              coverGlass: !!args.coverGlass,
              coverNaturalDisasters: !!args.coverNaturalDisasters,
              coverChemicals: !!args.coverChemicals,
              coverPriceFluctuation: !!args.coverPriceFluctuation,
              paymentMode: args.paymentMode || 'cash',
              installmentCount: Number(args.installmentCount) || 4
            });
            calculationInfo = {
              type: 'body',
              basePremium: calculationResult.baseTariff,
              discountAmount: calculationResult.discountAmount,
              finalPremium: calculationResult.finalPremium,
              args: args
            };
          } else if (call.name === 'calculateFirePremium') {
            const args = call.args as any;
            calculationResult = calculateFirePremium({
              propertyType: args.propertyType || 'residential',
              buildingValueTomans: Number(args.buildingValueTomans) || 1000000000,
              appliancesValueTomans: Number(args.appliancesValueTomans) || 200000000,
              areaSizeSqm: Number(args.areaSizeSqm) || 100,
              coverEarthquake: !!args.coverEarthquake,
              coverPipeBurst: !!args.coverPipeBurst,
              coverFlood: !!args.coverFlood,
              isJaamZarrin: !!args.isJaamZarrin,
              goldAssetValueTomans: args.goldAssetValueTomans ? Number(args.goldAssetValueTomans) : 0,
              paymentMode: args.paymentMode || 'cash',
              installmentCount: Number(args.installmentCount) || 4
            });
            calculationInfo = {
              type: 'fire',
              basePremium: calculationResult.baseTariff,
              discountAmount: calculationResult.zarrinTheftFee || 0,
              finalPremium: calculationResult.finalPremium,
              args: args
            };
          } else if (call.name === 'calculateHealthPremium') {
            const args = call.args as any;
            calculationResult = calculateHealthPremium({
              planType: args.planType || 'standard',
              ageCategory: args.ageCategory || 'under_40',
              personCount: Number(args.personCount) || 1,
              hasDental: !!args.hasDental,
              isSamaZarrin: !!args.isSamaZarrin,
              occupation: args.occupation || 'آزاد',
              jobRiskCategory: Number(args.jobRiskCategory) || 1,
              paymentMode: args.paymentMode || 'cash',
              installmentCount: Number(args.installmentCount) || 6
            });
            calculationInfo = {
              type: 'health',
              basePremium: calculationResult.yearlyTotalBeforeTax,
              discountAmount: 0,
              finalPremium: calculationResult.finalPremium,
              args: args
            };
          } else if (call.name === 'calculateLiabilityPremium') {
            const args = call.args as any;
            calculationResult = calculateLiabilityPremium({
              liabilityType: args.liabilityType || 'civil',
              staffCount: args.staffCount ? Number(args.staffCount) : 1,
              occupation: args.occupation || 'آزاد',
              jobRiskCategory: Number(args.jobRiskCategory) || 1,
              coverageLimitTomans: Number(args.coverageLimitTomans) || 1200000000,
              paymentMode: args.paymentMode || 'cash',
              installmentCount: Number(args.installmentCount) || 4
            });
            calculationInfo = {
              type: 'liability',
              basePremium: calculationResult.basePremium,
              discountAmount: 0,
              finalPremium: calculationResult.finalPremium,
              args: args
            };
          }

          if (calculationResult) {
            // Second turn call to Gemini to generate the formatted final Persian response
            const secondResponse = await ai.models.generateContent({
              model: 'gemini-3.5-flash',
              contents: [
                {
                  role: 'user',
                  parts: [{
                    text: `کاربر درخواست محاسبه حق بیمه داشت و سیستم با مقادیر زیر محاسبات را با دقت انجام داده است:
${JSON.stringify(calculationResult, null, 2)}

مشخصات ورودی کاربر برای این محاسبه:
${JSON.stringify(call.args, null, 2)}

لطفاً به عنوان مشاور رسمی بیمه ایران نمایندگی گلزار (کد ۳۰۹۶۲)، با تکیه بر این محاسبات سیستمی دقیق، فاکتور و جزئیات قیمت نهایی (تومان) را با لحنی بسیار خوشرو، حرفه‌ای، محترمانه و منظم به کاربر ارائه دهی.
حتما قیمت نهایی (تومان) و درصد تخفیف را درشت و برجسته نشان بده.
تخفیف‌های اعمال شده را هم ذکر کن و مراحل ثبت رسمی و صادر کردن با زدن دکمه بالای صفحه چت را یادآور شو.`
                  }]
                }
              ]
            });
            finalResponseText = secondResponse.text || 'پاسخی یافت نشد.';
          } else {
            finalResponseText = response.text || 'پاسخی یافت نشد.';
          }
        } catch (calcErr) {
          console.error('Calculation execution error:', calcErr);
          finalResponseText = response.text || 'پاسخی یافت نشد.';
        }
      } else {
        finalResponseText = response.text || 'پاسخی یافت نشد.';
      }

      res.json({ response: finalResponseText, calculation: calculationInfo });
    } catch (err: any) {
      console.error('Gemini error:', err);
      res.json({
        response: 'متأسفانه در دریافت پاسخ از مشاور هوشمند خطایی رخ داد. لطفاً با شماره ۰۲۱-۸۸۹۹۰۰۱۱ تماس بگیرید.'
      });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
