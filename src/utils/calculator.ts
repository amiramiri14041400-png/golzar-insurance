// Calculation logic for approximate Iran Insurance premiums (محاسبه‌گر تقریبی حق‌بیمه ایران)

export interface ThirdPartyInput {
  vehicleType: string; // passenger_4cyl, passenger_6cyl, motorcycle, pickup, heavy
  modelYear: number; // e.g. 1402
  noClaimDiscountYears: number; // 0 to 14 years
  driverDiscountYears: number; // 0 to 14 years
  financialLimit: number; // e.g. 100000000 (100 million) or 200000000
  previousCompany: string;
  hasDamageHistory: boolean;
}

export interface BodyInsuranceInput {
  vehicleType: string;
  vehicleValueTomans: number; // e.g. 800000000
  modelYear: number;
  noClaimYears: number;
  coverGlass: boolean;
  coverNaturalDisasters: boolean;
  coverChemicals: boolean;
  coverPriceFluctuation: boolean;
}

export interface FireInsuranceInput {
  propertyType: 'residential' | 'commercial' | 'industrial';
  buildingValueTomans: number;
  appliancesValueTomans: number;
  areaSizeSqm: number;
  coverEarthquake: boolean;
  coverPipeBurst: boolean;
  coverFlood: boolean;
}

export interface HealthInsuranceInput {
  planType: 'basic' | 'standard' | 'golden';
  ageCategory: 'under_40' | '40_to_60' | 'over_60';
  personCount: number;
  hasDental: boolean;
}

// 1. Calculate Third Party Insurance (بیمه شخص ثالث)
export function calculateThirdPartyPremium(input: ThirdPartyInput) {
  // Base tariff approved by Central Insurance for 1403/1404
  let baseTariff = 6800000; // 6,800,000 Tomans for 4-cylinder passenger car
  if (input.vehicleType === 'passenger_6cyl') baseTariff = 7900000;
  if (input.vehicleType === 'motorcycle') baseTariff = 1900000;
  if (input.vehicleType === 'pickup') baseTariff = 7200000;
  if (input.vehicleType === 'heavy') baseTariff = 11500000;

  // Discount percentage per year (5% per year up to 70%)
  const discountPercent = Math.min(input.noClaimDiscountYears * 5, 70);
  const discountAmount = (baseTariff * discountPercent) / 100;

  // Additional financial coverage fee (e.g. 100M base vs 200M)
  let financialExtra = 0;
  if (input.financialLimit > 100000000) {
    financialExtra = ((input.financialLimit - 100000000) / 100000000) * 450000;
  }

  // Model year depreciation / extra charge if car is older than 15 years
  const currentYear = 1403;
  let agePenalty = 0;
  if (currentYear - input.modelYear > 15) {
    agePenalty = (currentYear - input.modelYear - 15) * 0.02 * baseTariff;
  }

  let finalPremium = baseTariff - discountAmount + financialExtra + agePenalty;
  
  // Tax & Toll (10%)
  const taxAndTolls = finalPremium * 0.10;
  finalPremium += taxAndTolls;

  return {
    baseTariff: Math.round(baseTariff),
    discountPercent,
    discountAmount: Math.round(discountAmount),
    financialExtra: Math.round(financialExtra),
    taxAndTolls: Math.round(taxAndTolls),
    finalPremiumTomans: Math.round(finalPremium)
  };
}

// 2. Calculate Body Insurance (بیمه بدنه)
export function calculateBodyPremium(input: BodyInsuranceInput) {
  if (!input.vehicleValueTomans || input.vehicleValueTomans < 50000000) {
    return { finalPremiumTomans: 0, discountPercent: 0, baseTariff: 0 };
  }

  // Base rate ~0.45% of car value
  let baseRate = 0.0045;
  let baseTariff = input.vehicleValueTomans * baseRate;

  // Add-on covers
  let addOns = 0;
  if (input.coverGlass) addOns += baseTariff * 0.05;
  if (input.coverNaturalDisasters) addOns += baseTariff * 0.08;
  if (input.coverChemicals) addOns += baseTariff * 0.04;
  if (input.coverPriceFluctuation) addOns += baseTariff * 0.10;

  // Discount based on no-claim years (up to 60%)
  const discountPercent = Math.min(input.noClaimYears * 10, 60);
  const discountAmount = (baseTariff * discountPercent) / 100;

  let finalPremium = baseTariff + addOns - discountAmount;
  const tax = finalPremium * 0.10;
  finalPremium += tax;

  return {
    baseTariff: Math.round(baseTariff),
    addOns: Math.round(addOns),
    discountPercent,
    discountAmount: Math.round(discountAmount),
    finalPremiumTomans: Math.round(finalPremium)
  };
}

// 3. Calculate Fire Insurance (بیمه آتش‌سوزی)
export function calculateFirePremium(input: FireInsuranceInput) {
  const totalAssetValue = (input.buildingValueTomans || 0) + (input.appliancesValueTomans || 0);
  if (totalAssetValue <= 0) return { finalPremiumTomans: 0 };

  // Base per-mil rate
  let baseRate = 0.0003; // 0.03%
  if (input.propertyType === 'commercial') baseRate = 0.0006;
  if (input.propertyType === 'industrial') baseRate = 0.0012;

  let baseTariff = totalAssetValue * baseRate;

  let earthquakeFee = input.coverEarthquake ? totalAssetValue * 0.00025 : 0;
  let pipeFee = input.coverPipeBurst ? 120000 : 0;
  let floodFee = input.coverFlood ? totalAssetValue * 0.0001 : 0;

  let finalPremium = baseTariff + earthquakeFee + pipeFee + floodFee;
  const tax = finalPremium * 0.10;
  finalPremium += tax;

  return {
    baseTariff: Math.round(baseTariff),
    earthquakeFee: Math.round(earthquakeFee),
    finalPremiumTomans: Math.round(finalPremium)
  };
}

// 4. Calculate Health Insurance (بیمه درمان تکمیلی)
export function calculateHealthPremium(input: HealthInsuranceInput) {
  let perPersonBase = 280000; // Tomans / month
  if (input.planType === 'standard') perPersonBase = 450000;
  if (input.planType === 'golden') perPersonBase = 720000;

  let ageMultiplier = 1.0;
  if (input.ageCategory === '40_to_60') ageMultiplier = 1.25;
  if (input.ageCategory === 'over_60') ageMultiplier = 1.6;

  let dentalFee = input.hasDental ? 85000 : 0;

  const monthlyPerPerson = (perPersonBase * ageMultiplier) + dentalFee;
  const yearlyTotal = monthlyPerPerson * 12 * (input.personCount || 1);

  return {
    monthlyPerPersonTomans: Math.round(monthlyPerPerson),
    finalPremiumTomans: Math.round(yearlyTotal)
  };
}
