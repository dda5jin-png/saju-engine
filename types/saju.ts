export type ElementType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export interface SajuPillars {
  year: string;
  month: string;
  day: string;
  hour: string;
}

export interface ElementDistribution {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface ElementProfile {
  dominant: ElementType[];
  weak: ElementType[];
  missing: ElementType[];
  balance_score: number;
  total_count: number;
  summary: string;
  recommendation: string;
}

export interface DayMasterProfile {
  core: string;
  strength: string;
  risk: string;
  strategy: string;
}

export interface DetailedReading {
  basis: string[];
  temperament: string;
  work_style: string;
  relationship: string;
  money: string;
  timing: string;
  balance_practice: string;
  reliability_note: string;
}

export interface SajuAnalysis {
  summary: string;
  type_name: string;
  personality_keywords: string[];
  pain_point: string;
  relationship_style: string;
  money_style: string;
  timing_flow: string;
  element_distribution: ElementDistribution;
  pillars: SajuPillars;
  day_master: string;
  time_known: boolean;
  confidence_note: string;
  element_profile: ElementProfile;
  day_master_profile: DayMasterProfile;
  detailed_reading: DetailedReading;
  viral_sentences: {
    self_realization: string;
    painful_truth: string;
    social_share: string;
  };
}

export interface SajuResultCard {
  title: string;
  content: string;
  tag?: string;
}

export interface SajuInput {
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm
  gender: 'male' | 'female';
}
