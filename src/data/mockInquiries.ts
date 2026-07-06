import { Inquiry, SmsLog } from '../types';

export const MOCK_INQUIRIES: Inquiry[] = [
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
      financialLimit: '100,000,000 تومان',
      driverDiscount: '30% (3 سال)'
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
      },
      {
        id: 'doc-2',
        type: 'prev_policy',
        label: 'بیمه‌نامه قبلی',
        fileName: 'bimeh_ghabli_hosseini.pdf',
        fileUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80',
        fileSize: '850 KB',
        uploadedAt: '1403/04/10 - 10:16'
      }
    ],
    expertNotes: 'مشتری درخواست صدور با تخفیف سابقه قبلی و حداکثر پوشش مالی را دارد. مدارک کامل است.',
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
      estimatedValue: '1,450,000,000 تومان',
      coverGlassBreakage: true,
      coverNaturalDisasters: true,
      coverChemicalSpill: false,
      coverPriceFluctuation: true
    },
    documents: [
      {
        id: 'doc-3',
        type: 'car_card_front',
        label: 'کارت خودرو',
        fileName: 'jac_s5_card.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
        fileSize: '2.1 MB',
        uploadedAt: '1403/04/09 - 16:30'
      }
    ],
    expertNotes: 'کارشناس بازدید هماهنگ شد برای فردا ساعت ۱۱ صبح.',
    createdAt: '1403/04/09 - 16:30',
    updatedAt: '1403/04/10 - 09:00'
  },
  {
    id: 'inq-103',
    trackingCode: 'IR30962-91024',
    insuranceType: 'fire',
    fullName: 'شرکت آریا تجهیز شمال',
    nationalId: '۱۰۱۰۲۹۳۸۴۷۵',
    mobile: '09125556677',
    province: 'تهران',
    city: 'تهران',
    address: 'شهرک صنعتی عباس آباد، بلوار ابن سینا، پلاک ۱۱۲',
    status: 'ready_for_issuance',
    formData: {
      propertyType: 'کارگاه صنعتی و انبار',
      areaSize: '450 متر مربع',
      buildingStructure: 'اسکلت فلزی استاندارد',
      applianceValue: '3,200,000,000 تومان',
      buildingValue: '1,800,000,000 تومان',
      coverEarthquake: true,
      coverPipeBurst: true,
      coverFlood: true
    },
    documents: [
      {
        id: 'doc-4',
        type: 'other',
        label: 'سند / اجاره نامه محل',
        fileName: 'sanad_kargah.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&auto=format&fit=crop&q=80',
        fileSize: '3.4 MB',
        uploadedAt: '1403/04/08 - 11:20'
      }
    ],
    expertNotes: 'محاسبه حق‌بیمه انجام شد. مبلغ کل: ۴,۸۵۰,۰۰۰ تومان. فاکتور پیش‌صدور ارسال شد.',
    createdAt: '1403/04/08 - 11:20',
    updatedAt: '1403/04/09 - 14:00'
  },
  {
    id: 'inq-104',
    trackingCode: 'IR30962-62915',
    insuranceType: 'third_party',
    fullName: 'دکتر علی محمدی',
    nationalId: '۰۰۶۵۴۳۲۱۸۹',
    mobile: '09127778899',
    province: 'تهران',
    city: 'تهران',
    address: 'میدان ونک، خیابان ملاصدرا، پلاک ۱۵',
    status: 'issued',
    formData: {
      vehicleType: 'تویوتا رافور 2017',
      modelYear: '2017',
      plateNumber: '12 ط 345 - ایران 11',
      previousCompany: 'بیمه ایران',
      noClaimDiscount: '70% (حداکثر تخفیف)',
      financialLimit: '200,000,000 تومان'
    },
    documents: [
      {
        id: 'doc-5',
        type: 'car_card_front',
        label: 'کارت خودرو',
        fileName: 'rav4_card.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
        fileSize: '1.8 MB',
        uploadedAt: '1403/04/05 - 09:00'
      }
    ],
    expertNotes: 'بیمه‌نامه صادر شد و نسخه الکترونیکی ارسال گردید. اصل بیمه‌نامه تحویل پیک شد.',
    issuedPolicyUrl: 'https://bimeh-iran30962.ir/docs/policy-62915.pdf',
    issuedAt: '1403/04/06 - 12:30',
    createdAt: '1403/04/05 - 09:00',
    updatedAt: '1403/04/06 - 12:30'
  }
];

export const MOCK_SMS_LOGS: SmsLog[] = [
  {
    id: 'sms-1',
    mobile: '09121112233',
    trackingCode: 'IR30962-84910',
    message: 'رضا حسینی پور عزیز، درخواست استعلام بیمه شخص ثالث شما با کد پیگیری IR30962-84910 در نمایندگی گلزار بیمه ایران (کد ۳۰۹۶۲) ثبت شد. کارشناسان ما به زودی با شما تماس خواهند گرفت.',
    status: 'sent',
    sentAt: '1403/04/10 - 10:15',
    provider: 'FarazSMS'
  },
  {
    id: 'sms-2',
    mobile: '09123334455',
    trackingCode: 'IR30962-73821',
    message: 'مریم ابراهیمی عزیز، درخواست بیمه بدنه با کد IR30962-73821 در حال کارشناسی و هماهنگی بازدید است. نمایندگی گلزار بیمه ایران ۳۰۹۶۲.',
    status: 'sent',
    sentAt: '1403/04/10 - 09:00',
    provider: 'MeliPayamak'
  }
];
