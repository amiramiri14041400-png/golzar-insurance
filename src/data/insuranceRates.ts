/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThirdPartyInput, HullInput, FireInput, LifeInput, TravelInput } from '../types';

// Approximate Bimeh Iran current base rates for 1404-1405 (in Rials)
export const VEHICLE_BASE_RATES: Record<string, number> = {
  sedan: 42000000,       // 42 million Rials (~4.2 million Tomans) for standard sedan
  suv: 49500000,         // 49.5 million Rials
  motorcycle: 12500000,  // 12.5 million Rials
  heavy: 68000000,       // 68 million Rials
};

export const THIRD_PARTY_FINANCIAL_OPTIONS = [
  { value: 1000000000, label: '۱,۰۰۰,۰۰۰,۰۰۰ ریال (۱۰۰ میلیون تومان - حداقل قانونی ۱۴۰۵)', extraRate: 0 },
  { value: 2000000000, label: '۲,۰۰۰,۰۰۰,۰۰۰ ریال (۲۰۰ میلیون تومان)', extraRate: 0.035 },
  { value: 3000000000, label: '۳,۰۰۰,۰۰۰,۰۰۰ ریال (۳۰۰ میلیون تومان)', extraRate: 0.065 },
  { value: 4000000000, label: '۴,۰۰۰,۰۰۰,۰۰۰ ریال (۴۰۰ میلیون تومان)', extraRate: 0.095 },
  { value: 5000000000, label: '۵,۰۰۰,۰۰۰,۰۰۰ ریال (۵۰۰ میلیون تومان)', extraRate: 0.125 },
  { value: 8000000000, label: '۸,۰۰۰,۰۰۰,۰۰۰ ریال (۸۰۰ میلیون تومان)', extraRate: 0.180 },
  { value: 10000000000, label: '۱۰,۰۰۰,۰۰۰,۰۰۰ ریال (۱ میلیارد تومان)', extraRate: 0.220 },
  { value: 16000000000, label: '۱۶,۰۰۰,۰۰۰,۰۰۰ ریال (۱.۶ میلیارد تومان - سقف تعهدات مالی دیه)', extraRate: 0.300 },
];

export const ACCIDENT_PENALTIES = {
  none: 0,
  one_financial: 0.20,
  one_bodily: 0.30,
  multiple: 0.70,
};

// Calculate Third Party Insurance
export function calculateThirdParty(input: ThirdPartyInput) {
  const baseRate = VEHICLE_BASE_RATES[input.vehicleType] || VEHICLE_BASE_RATES.sedan;
  
  // Financial coverage limit extra fee
  const financialOption = THIRD_PARTY_FINANCIAL_OPTIONS.find(o => o.value === input.financialCoverage) 
    || THIRD_PARTY_FINANCIAL_OPTIONS[0];
  const coverageSurcharge = baseRate * financialOption.extraRate;

  // Older vehicle surcharge (if manufacture year is older than 15 years from now, e.g. < 1390)
  const currentHijriYear = 1405;
  const age = currentHijriYear - input.manufactureYear;
  let ageSurcharge = 0;
  if (age > 15) {
    const extraYears = Math.min(age - 15, 10);
    ageSurcharge = baseRate * (extraYears * 0.02);
  }

  // Gross base without discount (قیمت پایه بدون تخفیف)
  const grossBaseBeforeDiscount = baseRate + coverageSurcharge + ageSurcharge;
  const grossVat = grossBaseBeforeDiscount * 0.10;
  const grossBaseNoDiscountRials = Math.round(grossBaseBeforeDiscount + grossVat);

  // No-claim discount: 5% per year, max 70% (14 years)
  const discountRate = Math.min(input.noClaimYears * 0.05, 0.70);
  const discountAmount = baseRate * discountRate;
  
  let premium = baseRate - discountAmount + coverageSurcharge + ageSurcharge;
  
  // Previous accidents surcharge
  const penaltyRate = ACCIDENT_PENALTIES[input.previousAccidents] || 0;
  const penaltySurcharge = baseRate * penaltyRate;
  premium += penaltySurcharge;
  
  const vat = premium * 0.10; // 10% tax in Iran
  const finalPremium = Math.round(premium + vat);
  
  return {
    baseRate,
    grossBaseNoDiscountRials,
    discountAmount: Math.round(discountAmount),
    discountRate,
    coverageSurcharge: Math.round(coverageSurcharge),
    penaltySurcharge: Math.round(penaltySurcharge),
    ageSurcharge: Math.round(ageSurcharge),
    vat: Math.round(vat),
    finalPremium,
  };
}

// Calculate Hull Insurance (بیمه بدنه - فرمول دقیق بیمه ایران)
export function calculateHull(input: HullInput) {
  // Vehicle value in Rials
  const vehicleValue = input.vehicleValue;
  
  // Base tariff rate per vehicle value (~1.552887375% of car value for base risks)
  const baseTariffCoeff = 0.01552887375;
  
  // Age factor for vehicles older than 7 years
  const currentHijriYear = 1405;
  const carAge = Math.max(0, currentHijriYear - input.manufactureYear);
  let ageMultiplier = 1.0;
  if (carAge > 7) {
    const extraYears = Math.min(carAge - 7, 10);
    ageMultiplier += extraYears * 0.02; // +2% per year over 7 years
  }

  // Pure base rate before tax
  const pureBaseRate = vehicleValue * baseTariffCoeff * ageMultiplier;

  // Taxes & Duties breakdown matching Bimeh Iran software
  // Municipal Duty (عوارض شهرداری): 3.56437%
  // Health Tax (مالیات سلامت): 0.89108%
  // VAT (مالیات بر ارزش افزوده): 4.45545%
  // Total Tax & Duty = 8.9109% of pure base
  const municipalDuty = Math.round(pureBaseRate * 0.0356437);
  const healthTax = Math.round(pureBaseRate * 0.0089108);
  const vatTax = Math.round(pureBaseRate * 0.0445545);
  const totalTaxDuties = municipalDuty + healthTax + vatTax;

  // Gross Base Rate Payable WITHOUT Discount (قابل پرداخت بدون تخفیف)
  const grossBaseNoDiscountRials = Math.round(pureBaseRate + totalTaxDuties);
  
  // Cash Discount (تخفیف نقدی ۱۰٪ - ۱۲,۳۰۰,۰۰۰ ریال برای سمند ۸۰۰ میلیونی)
  const cashDiscountRials = Math.round(pureBaseRate * 0.099009);

  // No claim discount schedule for Hull insurance (تخفیف عدم خسارت بدنه):
  // 1 year: 25%, 2 years: 35%, 3 years: 45%, 4+ years: 60%
  let noClaimRate = 0;
  if (input.noClaimYears === 1) noClaimRate = 0.25;
  else if (input.noClaimYears === 2) noClaimRate = 0.35;
  else if (input.noClaimYears === 3) noClaimRate = 0.45;
  else if (input.noClaimYears >= 4) noClaimRate = 0.60;

  const noClaimDiscountRials = Math.round(pureBaseRate * noClaimRate);

  // Add-ons / Supplementary coverages (پوشش‌های تکمیلی)
  let addonCost = 0;
  const addonBreakdown: Record<string, number> = {};

  if (input.selectedAddons.includes('theft_parts')) {
    const cost = pureBaseRate * 0.15;
    addonCost += cost;
    addonBreakdown['theft_parts'] = Math.round(cost);
  }
  if (input.selectedAddons.includes('glass_breakage')) {
    const cost = pureBaseRate * 0.05;
    addonCost += cost;
    addonBreakdown['glass_breakage'] = Math.round(cost);
  }
  if (input.selectedAddons.includes('acid')) {
    const cost = pureBaseRate * 0.05;
    addonCost += cost;
    addonBreakdown['acid'] = Math.round(cost);
  }
  if (input.selectedAddons.includes('natural_disasters')) {
    const cost = pureBaseRate * 0.10;
    addonCost += cost;
    addonBreakdown['natural_disasters'] = Math.round(cost);
  }
  if (input.selectedAddons.includes('price_fluctuation')) {
    const cost = pureBaseRate * 0.12;
    addonCost += cost;
    addonBreakdown['price_fluctuation'] = Math.round(cost);
  }
  if (input.selectedAddons.includes('transit')) {
    const cost = pureBaseRate * 0.08;
    addonCost += cost;
    addonBreakdown['transit'] = Math.round(cost);
  }

  // Net payable calculation with discounts and addons
  const totalDiscounts = cashDiscountRials + noClaimDiscountRials;
  const netBeforeTax = Math.max(0, pureBaseRate - totalDiscounts + addonCost);
  const netTax = netBeforeTax * 0.089109;
  const finalPremium = Math.round(netBeforeTax + netTax);

  return {
    pureBaseRate: Math.round(pureBaseRate),
    baseRate: Math.round(pureBaseRate),
    grossBaseNoDiscountRials,
    cashDiscountRials,
    noClaimDiscountRials,
    noClaimRate,
    discountAmount: noClaimDiscountRials + cashDiscountRials,
    discountRate: noClaimRate + 0.10,
    addonCost: Math.round(addonCost),
    addonBreakdown,
    totalTaxDuties,
    municipalDuty,
    healthTax,
    vatTax,
    vat: Math.round(netTax),
    finalPremium,
  };
}

// Calculate Fire Insurance (بیمه آتش سوزی)
export function calculateFire(input: FireInput) {
  const propertyValue = input.areaSqm * input.costPerSqm;
  const totalInsuredValue = propertyValue + input.contentsValue;
  
  // Base rates depend on building construction type:
  // concrete_steel: 0.00015 (0.15 per thousand)
  // brick: 0.00022 (0.22 per thousand)
  // adobe_wood: 0.00045 (0.45 per thousand)
  let baseRateCoefficient = 0.00015;
  if (input.constructionType === 'brick') baseRateCoefficient = 0.00022;
  else if (input.constructionType === 'adobe_wood') baseRateCoefficient = 0.00045;
  
  const baseRate = totalInsuredValue * baseRateCoefficient;
  let premium = baseRate;
  
  // Add-ons cost based on a multiplier of the base rate:
  let addonCost = 0;
  const addonBreakdown: Record<string, number> = {};
  
  if (input.selectedAddons.includes('earthquake')) {
    const cost = baseRate * 1.6; // Earthquake is highly volatile and expensive in Iran
    addonCost += cost;
    addonBreakdown['earthquake'] = cost;
  }
  if (input.selectedAddons.includes('flood')) {
    const cost = baseRate * 0.40;
    addonCost += cost;
    addonBreakdown['flood'] = cost;
  }
  if (input.selectedAddons.includes('pipe_burst')) {
    const cost = baseRate * 0.30;
    addonCost += cost;
    addonBreakdown['pipe_burst'] = cost;
  }
  if (input.selectedAddons.includes('theft')) {
    const cost = baseRate * 0.50;
    addonCost += cost;
    addonBreakdown['theft'] = cost;
  }
  if (input.selectedAddons.includes('neighbor_liability')) {
    const cost = baseRate * 0.25;
    addonCost += cost;
    addonBreakdown['neighbor_liability'] = cost;
  }
  
  premium += addonCost;
  
  const vat = premium * 0.10;
  const finalPremium = premium + vat;
  
  return {
    propertyValue,
    totalInsuredValue,
    baseRate,
    addonCost,
    addonBreakdown,
    vat,
    finalPremium: Math.round(finalPremium),
  };
}

// Calculate Life & Investment Progression over 30 years
export function calculateLife(input: LifeInput) {
  const years = input.paymentPeriodYears;
  const annualIncrease = input.annualPremiumIncrease / 100;
  const annualInterest = 0.18; // 18% average compound profit in Bimeh Iran Man plan
  
  let totalPremiumPaid = 0;
  let accumulatedCapital = 0;
  let currentAnnualPremium = input.monthlyPremium * 12;
  
  const chartData = [];
  
  for (let y = 1; y <= years; y++) {
    totalPremiumPaid += currentAnnualPremium;
    
    // Add current year premium and compound previous balance
    accumulatedCapital = (accumulatedCapital + currentAnnualPremium) * (1 + annualInterest);
    
    chartData.push({
      year: `سال ${y}`,
      premiumPaid: Math.round(totalPremiumPaid / 10000000), // convert to Million Tomans for graph readability
      capital: Math.round(accumulatedCapital / 10000000),
      currentPremium: Math.round(currentAnnualPremium / 10000000),
    });
    
    // Premium increases next year
    currentAnnualPremium = currentAnnualPremium * (1 + annualIncrease);
  }
  
  const deathBenefit = currentAnnualPremium * 25; // 25x standard death benefit
  
  return {
    totalPremiumPaid,
    accumulatedCapital: Math.round(accumulatedCapital),
    deathBenefit: Math.round(deathBenefit),
    chartData,
  };
}

// Calculate Travel Insurance
export function calculateTravel(input: TravelInput) {
  let basePrice = 500000; // default for 1-7 days
  
  if (input.durationDays <= 7) basePrice = 500000;
  else if (input.durationDays <= 15) basePrice = 850000;
  else if (input.durationDays <= 23) basePrice = 1250000;
  else if (input.durationDays <= 31) basePrice = 1750000;
  else if (input.durationDays <= 45) basePrice = 2400000;
  else if (input.durationDays <= 62) basePrice = 3300000;
  else basePrice = 4900000; // 92 days or continuous
  
  let multiplier = 1.0;
  
  // Age multiplier
  if (input.age < 13) multiplier *= 0.85; // discount for kids
  else if (input.age <= 65) multiplier *= 1.0;
  else if (input.age <= 70) multiplier *= 2.0; // risk increases
  else if (input.age <= 75) multiplier *= 3.0;
  else multiplier *= 4.5; // elderly
  
  // Zone modifier
  if (input.destinationZone === 'zone2') multiplier *= 0.80; // regional is cheaper
  else if (input.destinationZone === 'worldwide') multiplier *= 1.40; // full worldwide is more expensive
  
  // Coverage limit multiplier
  if (input.coverageLimit === 30000) multiplier *= 1.30;
  else if (input.coverageLimit === 50000) multiplier *= 1.65;
  
  const calculatedBase = basePrice * multiplier;
  const vat = calculatedBase * 0.10;
  const finalPremium = calculatedBase + vat;
  
  return {
    basePrice,
    multiplier,
    vat,
    finalPremium: Math.round(finalPremium),
  };
}

// Format currency to Farsi style (Tomans or Rials)
export function formatToman(rials: number): string {
  const tomans = Math.round(rials / 10);
  return tomans.toLocaleString('fa-IR') + ' تومان';
}

export function formatRial(rials: number): string {
  return rials.toLocaleString('fa-IR') + ' ریال';
}

// Helper to translate numbers to Farsi digits
export function toPersianDigits(num: number | string): string {
  const id = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/[0-9]/g, function (w) {
    return id[+w];
  });
}
