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

export interface LuckTiming {
  current_year: number;
  start_solar: string;
  direction: 'forward' | 'reverse';
  current_daeyun?: {
    gan_zhi: string;
    start_year: number;
    end_year: number;
    start_age: number;
    end_age: number;
  };
  current_sewoon?: {
    gan_zhi: string;
    year: number;
    age: number;
  };
  precision_note: string;
}

export interface JewelryRecommendation {
  support_element: ElementType;
  element_label: string;
  gemstone: string;
  jewelry: string;
  tone: string;
  reason: string;
  styling_tip: string;
  element_states?: Record<ElementType, '부족' | '적정' | '과다'>;
  needed_element?: ElementType;
  avoid_element?: ElementType;
  needed_element_label?: string;
  avoid_element_label?: string;
  recommendations?: JewelryOption[];
  practical_strategy?: JewelryPracticalStrategy;
  wearing_guide?: JewelryWearingGuide;
  scenario_summary?: string;
}

export interface JewelryOption {
  gemstone: string;
  reason: string;
  metal: string;
  shape: string;
}

export interface JewelryPracticalStrategy {
  love: string;
  money: string;
  business: string;
  relationship: string;
}

export interface JewelryWearingGuide {
  ring: string;
  necklace: string;
  bracelet: string;
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
  when_to_choose?: string;
  first_action?: string;
  watch_signal?: string;
}

export interface DecisionCoachResult {
  decision_basis?: string;
  situation: string;
  choices: DecisionChoice[];
  recommended_action: string;
  risk_warning: string;
  avoid_action?: string;
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
  luck_timing?: LuckTiming;
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
