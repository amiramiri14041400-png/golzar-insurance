// Calculation logic for Iran Insurance premiums according to 1405 Bimeh Iran directives
// (محاسبه‌گر رسمی حق‌بیمه ایران طبق بخشنامه‌های سال ۱۴۰۵)

export type InsuranceType = 
  | 'third_party' 
  | 'body' 
  | 'fire' 
  | 'health' 
  | 'life' 
  | 'liability' 
  | 'travel';

export interface BaseInput {
  paymentMode?: 'cash' | 'installments'; // نقدی یا اقساطی
  installmentCount?: number; // تعداد اقساط (مثلا ۴ یا ۶ ماهه)
}

export interface ThirdPartyInput extends BaseInput {
  vehicleType: string; // passenger_4cyl, passenger_6cyl, motorcycle, pickup, heavy
  modelYear: number; // e.g. 1403
  noClaimDiscountYears: number; // 0 to 14 years (تخفیف عدم خسارت ثالث)
  driverDiscountYears: number; // 0 to 14 years
  financialLimit: number; // تعهد مالی درخواستی (مثلاً ۱۰۰ تا ۸۰۰ میلیون تومان)
  previousCompany: string;
  hasDamageHistory: boolean;
}

export interface BodyInsuranceInput extends BaseInput {
  vehicleType: string;
  vehicleValueTomans: number; // ارزش روز خودرو به تومان
  modelYear: number;
  noClaimYears: number; // تخفیف عدم خسارت بدنه (0 تا 5+ سال)
  coverGlass: boolean;
  coverNaturalDisasters: boolean;
  coverChemicals: boolean;
  coverPriceFluctuation: boolean;
}

export interface FireInsuranceInput extends BaseInput {
  propertyType: 'residential' | 'commercial' | 'industrial';
  buildingValueTomans: number;
  appliancesValueTomans: number;
  areaSizeSqm: number;
  coverEarthquake: boolean;
  coverPipeBurst: boolean;
  coverFlood: boolean;
  isJaamZarrin?: boolean; // طرح جامع جام زرین بیمه ایران
  goldAssetValueTomans?: number; // ارزش طلا، جواهر و مسکوکات بیمه‌شده تحت طرح جام زرین
}

export interface HealthInsuranceInput extends BaseInput {
  planType: 'basic' | 'standard' | 'golden';
  ageCategory: 'under_40' | '40_to_60' | 'over_60';
  personCount: number;
  hasDental: boolean;
  isSamaZarrin?: boolean; // طرح سما زرین بیمه ایران (تکمیلی + عمر)
  occupation: string; // شغل بیمه‌گذار (برای تعیین گروه ریسک)
  jobRiskCategory?: number; // گروه ریسک شغلی از ۱ تا ۵
}

export interface LiabilityInput extends BaseInput {
  liabilityType: 'employer' | 'civil' | 'professional'; // کارفرما، مدنی عمومی، حرفه‌ای پزشکان
  staffCount?: number; // تعداد کارکنان
  occupation: string; // شغل یا حوزه فعالیت
  jobRiskCategory: number; // گروه ریسک شغلی از ۱ تا ۵
  coverageLimitTomans: number; // تعهد دیه درخواستی (مثلاً ۱,۲۰۰,۰۰۰,۰۰۰ تومان دیه کامل ۱۴۰۵)
}

// Helper for installment calculation
function getPaymentSchedule(finalPremium: number, mode: 'cash' | 'installments', count: number = 4) {
  if (mode === 'cash') {
    const cashDiscount = finalPremium * 0.10; // 10% discount for cash payment
    const payableAmount = finalPremium - cashDiscount;
    return {
      paymentMode: 'cash' as const,
      cashDiscount: Math.round(cashDiscount),
      payableAmount: Math.round(payableAmount),
      downPayment: Math.round(payableAmount),
      installments: [] as number[],
      monthlyInstallmentAmount: 0
    };
  } else {
    // 30% down payment, remaining split into installments
    const downPayment = finalPremium * 0.30;
    const remaining = finalPremium - downPayment;
    const installmentsCount = Math.max(1, Math.min(count, 8)); // 1 to 8 installments
    const monthlyAmount = remaining / installmentsCount;
    
    const installments = [];
    for (let i = 0; i < installmentsCount; i++) {
      installments.push(Math.round(monthlyAmount));
    }

    return {
      paymentMode: 'installments' as const,
      cashDiscount: 0,
      payableAmount: Math.round(finalPremium),
      downPayment: Math.round(downPayment),
      installments,
      monthlyInstallmentAmount: Math.round(monthlyAmount)
    };
  }
}

// 1. Calculate Third Party Insurance (بیمه شخص ثالث سال ۱۴۰۵)
export function calculateThirdPartyPremium(input: ThirdPartyInput) {
  // Base tariff approved by Central Insurance for 1405
  let baseTariff = 7400000; // 7,400,000 Tomans for 4-cylinder passenger car
  if (input.vehicleType === 'passenger_6cyl') baseTariff = 8600000;
  if (input.vehicleType === 'motorcycle') baseTariff = 2100000;
  if (input.vehicleType === 'pickup') baseTariff = 7850000;
  if (input.vehicleType === 'heavy') baseTariff = 12600000;

  // Discount percentage per year (5% per year up to 70% in Iran Insurance)
  const discountPercent = Math.min((input.noClaimDiscountYears || 0) * 5, 70);
  const discountAmount = (baseTariff * discountPercent) / 100;

  // Additional financial coverage fee (1405 default is 100M base, up to 800M)
  let financialExtra = 0;
  const currentBaseLimit = 100000000;
  if (input.financialLimit > currentBaseLimit) {
    financialExtra = ((input.financialLimit - currentBaseLimit) / 100000000) * 480000;
  }

  // Model year depreciation / extra charge if car is older than 15 years
  const currentYear = 1405;
  let agePenalty = 0;
  if (currentYear - input.modelYear > 15) {
    agePenalty = Math.min((currentYear - input.modelYear - 15) * 0.02 * baseTariff, baseTariff * 0.20); // capped at 20%
  }

  let finalPremiumBeforeTax = baseTariff - discountAmount + financialExtra + agePenalty;
  
  // Tax & Toll (10%)
  const taxAndTolls = finalPremiumBeforeTax * 0.10;
  let finalPremiumWithTax = finalPremiumBeforeTax + taxAndTolls;

  const payment = getPaymentSchedule(
    finalPremiumWithTax, 
    input.paymentMode || 'cash', 
    input.installmentCount || 4
  );

  return {
    baseTariff: Math.round(baseTariff),
    discountPercent,
    discountAmount: Math.round(discountAmount),
    financialExtra: Math.round(financialExtra),
    agePenalty: Math.round(agePenalty),
    taxAndTolls: Math.round(taxAndTolls),
    finalPremiumBeforeTax: Math.round(finalPremiumBeforeTax),
    finalPremium: payment.payableAmount,
    payment
  };
}

// 2. Calculate Body Insurance (بیمه بدنه سال ۱۴۰۵)
export function calculateBodyPremium(input: BodyInsuranceInput) {
  if (!input.vehicleValueTomans || input.vehicleValueTomans < 50000000) {
    return { finalPremium: 0, discountPercent: 0, baseTariff: 0, payment: null };
  }

  // Base rate ~0.42% of car value in 1405
  let baseRate = 0.0042;
  let baseTariff = input.vehicleValueTomans * baseRate;

  // Add-on covers
  let addOns = 0;
  if (input.coverGlass) addOns += baseTariff * 0.05;
  if (input.coverNaturalDisasters) addOns += baseTariff * 0.08;
  if (input.coverChemicals) addOns += baseTariff * 0.04;
  if (input.coverPriceFluctuation) addOns += baseTariff * 0.10;

  // Discount based on no-claim years (1st: 30%, 2nd: 40%, 3rd: 50%, 4th: 60%, 5th+: 70%)
  let discountPercent = 0;
  const years = input.noClaimYears || 0;
  if (years === 1) discountPercent = 30;
  else if (years === 2) discountPercent = 40;
  else if (years === 3) discountPercent = 50;
  else if (years === 4) discountPercent = 60;
  else if (years >= 5) discountPercent = 70;

  const discountAmount = (baseTariff * discountPercent) / 100;

  // Age Penalty (vehicles older than 10 years pay 2% extra per year)
  const currentYear = 1405;
  let agePenalty = 0;
  if (currentYear - input.modelYear > 10) {
    agePenalty = (currentYear - input.modelYear - 10) * 0.02 * baseTariff;
  }

  let finalPremiumBeforeTax = baseTariff + addOns + agePenalty - discountAmount;
  const taxAndTolls = finalPremiumBeforeTax * 0.10;
  let finalPremiumWithTax = finalPremiumBeforeTax + taxAndTolls;

  const payment = getPaymentSchedule(
    finalPremiumWithTax, 
    input.paymentMode || 'cash', 
    input.installmentCount || 4
  );

  return {
    baseTariff: Math.round(baseTariff),
    addOns: Math.round(addOns),
    agePenalty: Math.round(agePenalty),
    discountPercent,
    discountAmount: Math.round(discountAmount),
    taxAndTolls: Math.round(taxAndTolls),
    finalPremiumBeforeTax: Math.round(finalPremiumBeforeTax),
    finalPremium: payment.payableAmount,
    payment
  };
}

// 3. Calculate Fire Insurance & "Jaam Zarrin" (بیمه آتش‌سوزی و طرح جام زرین سال ۱۴۰۵)
export function calculateFirePremium(input: FireInsuranceInput) {
  const totalAssetValue = (input.buildingValueTomans || 0) + (input.appliancesValueTomans || 0);
  if (totalAssetValue <= 0) {
    return { finalPremium: 0, baseTariff: 0, payment: null };
  }

  // Base per-mil rate in 1405
  let baseRate = 0.00032; // 0.032%
  if (input.propertyType === 'commercial') baseRate = 0.00065;
  if (input.propertyType === 'industrial') baseRate = 0.0013;

  // Increase base rate for "Jaam Zarrin" due to enhanced theft & property coverage
  if (input.isJaamZarrin) {
    baseRate *= 1.25;
  }

  let baseTariff = totalAssetValue * baseRate;

  let earthquakeFee = input.coverEarthquake ? totalAssetValue * 0.00026 : 0;
  let pipeFee = input.coverPipeBurst ? 140000 : 0;
  let floodFee = input.coverFlood ? totalAssetValue * 0.00011 : 0;

  // Custom addition for precious metals / assets under "Jaam Zarrin" coverage
  let zarrinTheftFee = 0;
  if (input.isJaamZarrin && input.goldAssetValueTomans) {
    zarrinTheftFee = input.goldAssetValueTomans * 0.0015; // 0.15% rate for high-value safes
  }

  let finalPremiumBeforeTax = baseTariff + earthquakeFee + pipeFee + floodFee + zarrinTheftFee;
  const taxAndTolls = finalPremiumBeforeTax * 0.10;
  let finalPremiumWithTax = finalPremiumBeforeTax + taxAndTolls;

  const payment = getPaymentSchedule(
    finalPremiumWithTax, 
    input.paymentMode || 'cash', 
    input.installmentCount || 4
  );

  return {
    baseTariff: Math.round(baseTariff),
    earthquakeFee: Math.round(earthquakeFee),
    pipeFee: Math.round(pipeFee),
    floodFee: Math.round(floodFee),
    zarrinTheftFee: Math.round(zarrinTheftFee),
    isJaamZarrin: !!input.isJaamZarrin,
    taxAndTolls: Math.round(taxAndTolls),
    finalPremiumBeforeTax: Math.round(finalPremiumBeforeTax),
    finalPremium: payment.payableAmount,
    payment
  };
}

// 4. Calculate Health Insurance & "Sama Zarrin" (بیمه درمان و طرح سما زرین سال ۱۴۰۵)
export function calculateHealthPremium(input: HealthInsuranceInput) {
  let perPersonBase = 310000; // Monthly base premium in 1405
  if (input.planType === 'standard') perPersonBase = 490000;
  if (input.planType === 'golden') perPersonBase = 790000;

  // Add rider premium if "Sama Zarrin" (Comprehensive Premium health + life savings + specialized illness coverage)
  if (input.isSamaZarrin) {
    perPersonBase += 150000;
  }

  // Age Multiplier
  let ageMultiplier = 1.0;
  if (input.ageCategory === '40_to_60') ageMultiplier = 1.3;
  if (input.ageCategory === 'over_60') ageMultiplier = 1.7;

  // Job risk category multiplier (Category 1 to 5)
  // Category 1 = Low risk, Category 5 = Extreme risk
  let jobMultiplier = 1.0;
  const risk = input.jobRiskCategory || 1;
  if (risk === 2) jobMultiplier = 1.10;
  else if (risk === 3) jobMultiplier = 1.25;
  else if (risk === 4) jobMultiplier = 1.45;
  else if (risk === 5) jobMultiplier = 1.70;

  let dentalFee = input.hasDental ? 95000 : 0;

  const monthlyPerPerson = (perPersonBase * ageMultiplier * jobMultiplier) + dentalFee;
  const yearlyTotalBeforeTax = monthlyPerPerson * 12 * (input.personCount || 1);
  const taxAndTolls = yearlyTotalBeforeTax * 0.10;
  let finalPremiumWithTax = yearlyTotalBeforeTax + taxAndTolls;

  const payment = getPaymentSchedule(
    finalPremiumWithTax, 
    input.paymentMode || 'cash', 
    input.installmentCount || 6
  );

  return {
    monthlyPerPerson: Math.round(monthlyPerPerson),
    yearlyTotalBeforeTax: Math.round(yearlyTotalBeforeTax),
    isSamaZarrin: !!input.isSamaZarrin,
    jobRiskCategory: risk,
    taxAndTolls: Math.round(taxAndTolls),
    finalPremium: payment.payableAmount,
    payment
  };
}

// 5. Calculate Liability Insurance (بیمه مسئولیت سال ۱۴۰۵)
export function calculateLiabilityPremium(input: LiabilityInput) {
  // Base premium for standard 1.2 Billion Toman (DIYEH 1405) coverage
  let basePremium = 1400000; // employer
  if (input.liabilityType === 'civil') basePremium = 750000;
  if (input.liabilityType === 'professional') basePremium = 950000;

  // Job Risk multiplier (Category 1 to 5)
  let jobMultiplier = 1.0;
  const risk = input.jobRiskCategory || 1;
  if (risk === 2) jobMultiplier = 1.15;
  else if (risk === 3) jobMultiplier = 1.35;
  else if (risk === 4) jobMultiplier = 1.60;
  else if (risk === 5) jobMultiplier = 2.00;

  // Staff Count multiplier (for Employer Liability)
  let staffMultiplier = 1.0;
  if (input.liabilityType === 'employer' && input.staffCount) {
    const staff = input.staffCount;
    if (staff <= 5) staffMultiplier = 1.0;
    else if (staff <= 10) staffMultiplier = 1.4;
    else if (staff <= 20) staffMultiplier = 1.8;
    else staffMultiplier = 2.5;
  }

  // Coverage multiplier based on requested limit compared to 1.2 Billion standard
  const standardLimit = 1200000000;
  const coverageMultiplier = Math.max(0.8, (input.coverageLimitTomans / standardLimit) * 1.10);

  const finalPremiumBeforeTax = basePremium * jobMultiplier * staffMultiplier * coverageMultiplier;
  const taxAndTolls = finalPremiumBeforeTax * 0.10;
  const finalPremiumWithTax = finalPremiumBeforeTax + taxAndTolls;

  const payment = getPaymentSchedule(
    finalPremiumWithTax, 
    input.paymentMode || 'cash', 
    input.installmentCount || 4
  );

  return {
    basePremium: Math.round(basePremium),
    jobRiskCategory: risk,
    staffCount: input.staffCount || 1,
    taxAndTolls: Math.round(taxAndTolls),
    finalPremiumBeforeTax: Math.round(finalPremiumBeforeTax),
    finalPremium: payment.payableAmount,
    payment
  };
}
