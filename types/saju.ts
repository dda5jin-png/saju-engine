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

export interface JewelryRecommendation {
  support_element: ElementType;
  element_label: string;
  gemstone: string;
  jewelry: string;
  tone: string;
  reason: string;
  styling_tip: string;
}

export interface ViralCharacterMode {
  character_type: string;
  character_definition: string;
  decision_style: string;
  similar_character: string;
  outsider_quotes: string[];
  one_liner: string;
  share_lines: string[];
}

export type DecisionCategory = 'love' | 'money' | 'career' | 'general';

export interface DecisionChoice {
  label: string;
  expected_flow: string;
  pros: string;
  cons: string;
}

export interface DecisionCoachResult {
  situation: string;
  choices: DecisionChoice[];
  recommended_action: string;
  risk_warning: string;
  one_line_guide: string;
  closing_message: string;
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
  jewelry_recommendation?: JewelryRecommendation;
  detailed_reading: DetailedReading;
  viral_character?: ViralCharacterMode;
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
