import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { Inquiry, SmsLog, IRAN_BIMEH_AGENCY } from './src/types.js';

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // Helper: Format Persian Jalali date simulation
  const getPersianDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} - ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

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

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{
              text: `تو مشاور رسمی بیمه ایران نمایندگی گلزار (کد ۳۰۹۶۲) هستی. پاسخ را به زبان فارسی روان، محترمانه، کاربردی و کوتاه بده. تاکید کن که نمایندگی گلزار کد ۳۰۹۶۲ امکان صدور آنلاین، تحویل فوری و مشاوره رایگان دارد.\nسوال کاربر: ${prompt}`
            }]
          }
        ]
      });

      const text = response.text || 'پاسخی یافت نشد.';
      res.json({ response: text });
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
