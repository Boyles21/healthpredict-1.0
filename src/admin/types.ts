export interface AdminUser {
  uid: string;
  fullName: string;
  email: string;
  createdAt: any; // Firestore Timestamp or Date string
  lastLogin: any; // Firestore Timestamp or Date string
  role: "admin" | "user";
  disabled?: boolean;
}

export interface AdminProfile {
  uid: string;
  fullName: string;
  email: string;
  location: string;
  ethnicity: string;
  bloodType: string;
  allergies: string;
  chronicConditions: string;
  medications: string;
  updatedAt: any;
}

export interface AdminAssessment {
  id: string;
  uid: string;
  userEmail?: string;
  userFullName?: string;
  age: number;
  weight: number;
  height: number;
  predictionPercentage: number;
  riskCategory: "LOW" | "MODERATE" | "HIGH";
  recommendations: string[];
  createdAt: any;
  diseaseType: "PCOS" | "Fibroid";
  
  // PCOS Specific fields
  cycleLength?: number;
  cycleRegularity?: string;
  weightGain?: boolean;
  hairGrowth?: boolean;
  hairLoss?: boolean;
  acne?: boolean;
  skinDarkening?: boolean;
  fastFood?: boolean;
  exercise?: boolean;
  pelvicPain?: boolean;
  fatigue?: boolean;

  // Fibroid Specific fields
  heavyBleeding?: boolean;
  prolongedMenstruation?: boolean;
  abdominalSwelling?: boolean;
  frequentUrination?: boolean;
  constipation?: boolean;
  fatigueAnemia?: boolean;
  painDuringIntercourse?: boolean;
  lowerBackPain?: boolean;
  irregularMenstrualFlow?: boolean;
  familyHistory?: boolean;
  pregnancyDifficulty?: boolean;
}

export interface SystemSettings {
  systemName: string;
  logoType: "default" | "hospital" | "modern";
  pcosThresholdHigh: number;
  pcosThresholdModerate: number;
  fibroidThresholdHigh: number;
  fibroidThresholdModerate: number;
  backupInterval: "daily" | "weekly" | "monthly";
}
