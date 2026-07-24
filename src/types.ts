/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export type InsuranceType = 'third_party' | 'hull' | 'fire' | 'life' | 'travel';

export interface ThirdPartyInput {
  vehicleType: string; // 'sedan' | 'suv' | 'motorcycle' | 'heavy'
  cylinders: string; // '4cyl_under_1500' | '4cyl_over_1500' | '6cyl' | 'other'
  manufactureYear: number; // Solar Hijri year, e.g., 1400
  noClaimYears: number; // 0 to 14
  previousAccidents: 'none' | 'one_financial' | 'one_bodily' | 'multiple';
  financialCoverage: number; // coverage limit in Rials, e.g., 1,000,000,000
}

export interface HullInput {
  vehicleValue: number; // in Rials, e.g., 5,000,000,000
  vehicleType: string;
  manufactureYear: number;
  noClaimYears: number;
  selectedAddons: string[]; // 'theft_parts' | 'glass_breakage' | 'acid' | 'natural_disasters' | 'price_fluctuation'
}

export interface FireInput {
  propertyType: 'apartment' | 'house' | 'villa' | 'commercial';
  constructionType: 'concrete_steel' | 'brick' | 'adobe_wood';
  areaSqm: number;
  costPerSqm: number; // in Rials, e.g., 150,000,000
  contentsValue: number; // in Rials
  selectedAddons: string[]; // 'earthquake' | 'flood' | 'pipe_burst' | 'theft' | 'neighbor_liability'
}

export interface LifeInput {
  age: number;
  monthlyPremium: number; // in Rials
  paymentPeriodYears: number; // 5 to 30
  annualPremiumIncrease: number; // 0 | 10 | 15 | 20 (percent)
  inflationTarget: number; // expected inflation for compound charts
}

export interface TravelInput {
  age: number;
  durationDays: number; // 1 to 92+
  destinationZone: string; // 'zone1' | 'zone2' | 'worldwide'
  coverageLimit: number; // in Euros, e.g. 10000 | 30000 | 50000
}
