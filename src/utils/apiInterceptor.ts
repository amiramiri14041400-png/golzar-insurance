import { Inquiry, SmsLog, User, IRAN_BIMEH_AGENCY } from '../types';

// Initialize localStorage stores if they don't exist
const initLocalStorage = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem('inquiriesStore')) {
    localStorage.setItem('inquiriesStore', JSON.stringify([
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
    ]));
  }

  if (!localStorage.getItem('smsLogsStore')) {
    localStorage.setItem('smsLogsStore', JSON.stringify([
      {
        id: 'sms-1',
        mobile: '09121112233',
        trackingCode: 'IR30962-84910',
        message: 'رضا حسینی پور عزیز، درخواست استعلام بیمه شما با کد IR30962-84910 در نمایندگی گلزار بیمه ایران (کد ۳۰۹۶۲) ثبت شد.',
        status: 'sent',
        sentAt: '1403/04/10 - 10:15',
        provider: 'FarazSMS'
      }
    ]));
  }

  if (!localStorage.getItem('usersStore')) {
    localStorage.setItem('usersStore', JSON.stringify([
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
    ]));
  }
};

// Helpers to read/write local stores
const getInquiries = (): Inquiry[] => JSON.parse(localStorage.getItem('inquiriesStore') || '[]');
const saveInquiries = (data: Inquiry[]) => localStorage.setItem('inquiriesStore', JSON.stringify(data));

const getSmsLogs = (): SmsLog[] => JSON.parse(localStorage.getItem('smsLogsStore') || '[]');
const saveSmsLogs = (data: SmsLog[]) => localStorage.setItem('smsLogsStore', JSON.stringify(data));

const getUsers = (): any[] => JSON.parse(localStorage.getItem('usersStore') || '[]');
const saveUsers = (data: any[]) => localStorage.setItem('usersStore', JSON.stringify(data));

const getPersianDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} - ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// Mock response creator
const createMockResponse = (body: any, status = 200, statusText = 'OK') => {
  return new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: { 'Content-Type': 'application/json' }
  });
};

// Smart Local AI Insurance assistant
const handleLocalAiConsultant = (prompt: string): string => {
  const cleanPrompt = prompt.toLowerCase();
  
  if (cleanPrompt.includes('ثالث') || cleanPrompt.includes('شخص') || cleanPrompt.includes('خودرو') || cleanPrompt.includes('ماشین')) {
    return `بیمه شخص ثالث در نمایندگی رسمی ۳۰۹۶۲ بیمه ایران (گلزار) با اعمال حداکثر تخفیف‌های سابقه عدم خسارت تا سقف ۷۰٪ صادر می‌شود.
امکان صدور فوری آنلاین و ارسال پیامک تایید با پرداخت نقدی و قسطی مهیاست. مدارک لازم: کارت ماشین، سند سبز و بیمه‌نامه قبلی.`;
  }
  
  if (cleanPrompt.includes('بدنه') || cleanPrompt.includes('تصادف') || cleanPrompt.includes('خسارت')) {
    return `بیمه بدنه خودرو در نمایندگی گلزار شامل پوشش‌های متنوعی چون سرقت کلی و جزئی، تصادفات، آتش‌سوزی، بلایای طبیعی، شکست شیشه و نوسان قیمت خودرو است.
هماهنگی کارشناس بازدید و عکس‌برداری در سریع‌ترین زمان انجام می‌شود و امکان تخفیف‌های ویژه خودروی صفر کیلومتر وجود دارد.`;
  }

  if (cleanPrompt.includes('آتش') || cleanPrompt.includes('زلزله') || cleanPrompt.includes('خانه') || cleanPrompt.includes('انبار') || cleanPrompt.includes('ساختمان')) {
    return `بیمه آتش‌سوزی و زلزله نمایندگی گلزار ۳۰۹۶۲ مناسب انواع واحدهای مسکونی، اداری، تجاری و صنعتی است.
این بیمه خسارت‌های وارد شده به بنای ساختمان و اثاثیه را پوشش می‌دهد. صدور پیش‌فاکتور با تعرفه‌های حداقلی در کمتر از ۱۰ دقیقه انجام می‌گیرد.`;
  }

  if (cleanPrompt.includes('تخفیف') || cleanPrompt.includes('قیمت') || cleanPrompt.includes('هزینه') || cleanPrompt.includes('قسط')) {
    return `در نمایندگی ۳۰۹۶۲ بیمه ایران (گلزار)، شرایط اقساطی ویژه‌ای بدون ضامن و با چک صیادی فراهم است.
همچنین تخفیف‌های قانونی عدم خسارت (تا ۷۰٪ شخص ثالث و تا ۷۵٪ بیمه بدنه) به طور کامل و خودکار برای شما اعمال می‌شود.`;
  }

  if (cleanPrompt.includes('آدرس') || cleanPrompt.includes('تلفن') || cleanPrompt.includes('ساعت') || cleanPrompt.includes('تماس')) {
    return `نمایندگی گلزار کد ۳۰۹۶۲ در تهران، خیابان ولیعصر، نرسیده به میدان ونک واقع شده است.
شماره‌های تماس دفتر: ${IRAN_BIMEH_AGENCY.phone1} و ${IRAN_BIMEH_AGENCY.phone2} است.
ساعت کاری ما شنبه تا چهارشنبه ۸:۰۰ الی ۱۸:۰۰ و پنجشنبه‌ها ۸:۰۰ الی ۱۳:۰۰ می‌باشد.`;
  }

  return `سلام! من مشاور هوشمند بیمه ایران نمایندگی گلزار (کد ۳۰۹۶۲) هستم.
درخواست شما در خصوص "${prompt}" دریافت شد. نمایندگی گلزار امکان صدور آنلاین فوری انواع بیمه‌نامه‌ها را دارد.
برای دریافت دقیق‌ترین مشاوره و استعلام تعرفه‌ها، می‌توانید مدارکتان را در سامانه بارگذاری نمایید یا با شماره‌های ما (${IRAN_BIMEH_AGENCY.phone1}) تماس حاصل فرمایید.`;
};

// Client-side API simulation router
const simulateApi = (urlStr: string, options: any): Response | null => {
  initLocalStorage();
  const url = new URL(urlStr, window.location.origin);
  const path = url.pathname;
  const method = (options?.method || 'GET').toUpperCase();

  // 1. Auth: Login
  if (path === '/api/auth/login' && method === 'POST') {
    const { username, password } = JSON.parse(options.body || '{}');
    if (!username || !password) {
      return createMockResponse({ error: 'نام کاربری و رمز عبور الزامی است.' }, 400);
    }
    const users = getUsers();
    const user = users.find(u => 
      (u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()) && 
      u.passwordHash === password
    );
    if (!user) {
      return createMockResponse({ error: 'نام کاربری یا رمز عبور اشتباه است.' }, 401);
    }
    return createMockResponse({
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
  }

  // 2. Auth: Register
  if (path === '/api/auth/register' && method === 'POST') {
    const { email, password, fullName, mobile, nationalId } = JSON.parse(options.body || '{}');
    if (!email || !password || !fullName || !mobile) {
      return createMockResponse({ error: 'وارد کردن فیلدهای ستاره‌دار الزامی است.' }, 400);
    }
    const users = getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return createMockResponse({ error: 'کاربری با این ایمیل قبلاً ثبت‌نام کرده است.' }, 400);
    }
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      username: email,
      passwordHash: password,
      fullName,
      mobile,
      nationalId,
      role: 'user',
      createdAt: getPersianDateStr()
    };
    users.push(newUser);
    saveUsers(users);

    return createMockResponse({
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
    }, 211); // use 211 or 201
  }

  // 3. User inquiries: Filtered by mobile/nationalId
  if (path === '/api/my-inquiries' && method === 'GET') {
    const mobile = url.searchParams.get('mobile');
    const nationalId = url.searchParams.get('nationalId');
    if (!mobile && !nationalId) {
      return createMockResponse({ error: 'شماره موبایل یا کد ملی جهت استعلام الزامی است.' }, 400);
    }
    const inquiries = getInquiries();
    const filtered = inquiries.filter(inq => 
      (mobile && inq.mobile === mobile) || 
      (nationalId && inq.nationalId === nationalId)
    );
    return createMockResponse(filtered);
  }

  // 4. Admin Users list
  if (path === '/api/users' && method === 'GET') {
    const users = getUsers().map(u => ({
      id: u.id,
      email: u.email,
      username: u.username,
      fullName: u.fullName,
      mobile: u.mobile,
      nationalId: u.nationalId,
      role: u.role,
      createdAt: u.createdAt
    }));
    return createMockResponse(users);
  }

  // 5. Admin Create user
  if (path === '/api/users' && method === 'POST') {
    const { email, username, password, fullName, mobile, nationalId, role } = JSON.parse(options.body || '{}');
    if (!email || !password || !fullName || !mobile) {
      return createMockResponse({ error: 'فیلدهای الزامی خالی هستند.' }, 400);
    }
    const users = getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return createMockResponse({ error: 'کاربری با این ایمیل قبلاً ثبت شده است.' }, 400);
    }
    const newUser = {
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
    users.push(newUser);
    saveUsers(users);
    return createMockResponse({ success: true, user: newUser }, 201);
  }

  // 6. Admin Delete user
  if (path.startsWith('/api/users/') && method === 'DELETE') {
    const id = path.split('/').pop();
    const users = getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) {
      return createMockResponse({ error: 'کاربر پیدا نشد.' }, 404);
    }
    if (users[idx].username === 'sadegh') {
      return createMockResponse({ error: 'مدیر ارشد سیستم قابل حذف نیست.' }, 400);
    }
    users.splice(idx, 1);
    saveUsers(users);
    return createMockResponse({ success: true, message: 'کاربر با موفقیت حذف شد.' });
  }

  // 7. Get Agency Info
  if (path === '/api/agency' && method === 'GET') {
    return createMockResponse(IRAN_BIMEH_AGENCY);
  }

  // 8. Inquiries: Get all (Admin)
  if (path === '/api/inquiries' && method === 'GET') {
    return createMockResponse(getInquiries());
  }

  // 9. Inquiries: Create new
  if (path === '/api/inquiries' && method === 'POST') {
    const { insuranceType, fullName, nationalId, mobile, province, city, address, formData, documents } = JSON.parse(options.body || '{}');
    if (!fullName || !mobile || !nationalId) {
      return createMockResponse({ error: 'نام و نام خانوادگی، شماره ملی و شماره موبایل الزامی است.' }, 400);
    }
    const trackingCode = `IR30962-${Math.floor(10000 + Math.random() * 90000)}`;
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

    const inquiries = getInquiries();
    inquiries.unshift(newInquiry);
    saveInquiries(inquiries);

    // Create SMS Log
    const smsMessage = `${fullName} عزیز، درخواست بیمه شما با کد پیگیری ${trackingCode} در نمایندگی گلزار بیمه ایران (کد ۳۰۹۶۲) ثبت شد. کارشناسان ما به زودی با شما تماس خواهند گرفت.`;
    const smsLog: SmsLog = {
      id: `sms-${Date.now()}`,
      mobile,
      trackingCode,
      message: smsMessage,
      status: 'sent',
      sentAt: nowStr,
      provider: 'SystemSimulated'
    };
    const smsLogs = getSmsLogs();
    smsLogs.unshift(smsLog);
    saveSmsLogs(smsLogs);

    return createMockResponse({
      success: true,
      inquiry: newInquiry,
      sms: smsLog
    }, 201);
  }

  // 10. Track inquiry
  if (path.startsWith('/api/inquiries/track/') && method === 'GET') {
    const query = decodeURIComponent(path.split('/').pop() || '').trim();
    const inquiries = getInquiries();
    const results = inquiries.filter(item => 
      item.trackingCode.toLowerCase() === query.toLowerCase() ||
      item.mobile.replace(/\s+/g, '') === query.replace(/\s+/g, '') ||
      item.nationalId === query
    );
    if (results.length === 0) {
      return createMockResponse({ success: false, message: 'هیچ درخواستی با این کد پیگیری یا شماره پیدا نشد.' }, 404);
    }
    return createMockResponse({ success: true, inquiries: results });
  }

  // 11. Update inquiry status
  if (path.startsWith('/api/inquiries/') && path.endsWith('/status') && method === 'PATCH') {
    const parts = path.split('/');
    const id = parts[parts.length - 2];
    const { status, expertNotes, issuedPolicyUrl, sendSms } = JSON.parse(options.body || '{}');

    const inquiries = getInquiries();
    const inquiry = inquiries.find(i => i.id === id);
    if (!inquiry) {
      return createMockResponse({ error: 'درخواست پیدا نشد.' }, 404);
    }

    if (status) inquiry.status = status;
    if (expertNotes !== undefined) inquiry.expertNotes = expertNotes;
    if (issuedPolicyUrl !== undefined) {
      inquiry.issuedPolicyUrl = issuedPolicyUrl;
      inquiry.issuedAt = getPersianDateStr();
    }
    inquiry.updatedAt = getPersianDateStr();

    saveInquiries(inquiries);

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
        provider: 'SystemSimulated'
      };
      const smsLogs = getSmsLogs();
      smsLogs.unshift(smsLog);
      saveSmsLogs(smsLogs);
    }

    return createMockResponse({
      success: true,
      inquiry,
      sms: smsLog
    });
  }

  // 12. Get SMS logs
  if (path === '/api/sms-logs' && method === 'GET') {
    return createMockResponse(getSmsLogs());
  }

  // 13. AI Consultant
  if (path === '/api/ai-consultant' && method === 'POST') {
    const { prompt } = JSON.parse(options.body || '{}');
    const reply = handleLocalAiConsultant(prompt || '');
    return createMockResponse({ response: reply });
  }

  return null;
};

// Original fetch pointer
const originalFetch = window.fetch;

// Intercept window.fetch
window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  // Only intercept API calls starting with /api/
  if (urlStr.includes('/api/')) {
    try {
      // First try real fetch request to backend
      const response = await originalFetch(input, init);
      
      // If we get index.html (which is HTML, indicating static SPA route fallback from Cloudflare Pages)
      // or if it returns 404/500 and is HTML, we intercept and run local simulation
      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('text/html')) {
        const simulated = simulateApi(urlStr, init);
        if (simulated) return simulated;
      }
      
      return response;
    } catch (error) {
      // If network error (e.g., completely offline or backend server not running), fall back to local storage simulation
      const simulated = simulateApi(urlStr, init);
      if (simulated) return simulated;
      
      throw error;
    }
  }

  // Non-API calls: pass through to original fetch
  return originalFetch(input, init);
};

// Auto-run on load
initLocalStorage();
