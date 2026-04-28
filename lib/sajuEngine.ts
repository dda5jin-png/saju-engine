import { Solar } from 'lunar-javascript';
import {
  DayMasterProfile,
  ElementDistribution,
  ElementProfile,
  ElementType,
  SajuAnalysis,
  SajuInput,
} from '../types/saju';
import { sajuRules } from './knowledge/sajuRules';

const STEM_ELEMENTS: Record<string, ElementType> = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water'
};

const BRANCH_ELEMENTS: Record<string, ElementType> = {
  '寅': 'wood', '卯': 'wood',
  '巳': 'fire', '午': 'fire',
  '辰': 'earth', '戌': 'earth', '丑': 'earth', '未': 'earth',
  '申': 'metal', '酉': 'metal',
  '亥': 'water', '子': 'water'
};

const UNKNOWN_HOUR = '미상';

const ELEMENT_LABELS: Record<ElementType, string> = {
  wood: '목',
  fire: '화',
  earth: '토',
  metal: '금',
  water: '수',
};

// 일간(Day Master)별 핵심 성격 키워드
const DAY_MASTER_INFO: Record<string, { typeName: string; summary: string }> = {
  '甲': { typeName: '거대한 거목(甲)', summary: '앞장서서 나아가고 뿌리 깊은 자존감을 가진 리더 타입입니다.' },
  '乙': { typeName: '유연한 넝쿨(乙)', summary: '적응력이 뛰어나고 끈질긴 생명력을 가진 현실주의적 소통가입니다.' },
  '丙': { typeName: '강렬한 태양(丙)', summary: '존재감이 확실하며 솔직하고 열정적으로 에너지를 발산합니다.' },
  '丁': { typeName: '따뜻한 등불(丁)', summary: '내면의 열정이 강하며 세심하게 주변을 챙기는 전략가 스타일입니다.' },
  '戊': { typeName: '단단한 태산(戊)', summary: '묵직한 존재감과 신뢰를 바탕으로 흔들림 없이 자리를 지킵니다.' },
  '己': { typeName: '비옥한 대지(己)', summary: '포용력이 넓고 실속을 챙길 줄 아는 내실 있는 생산자입니다.' },
  '庚': { typeName: '날카로운 원석(庚)', summary: '결단력이 빠르고 공과 사가 확실한 원칙주의적 개혁가입니다.' },
  '辛': { typeName: '섬세한 보석(辛)', summary: '섬세하고 예민하며 완벽한 결과를 추구하는 완성형 전문가입니다.' },
  '壬': { typeName: '깊은 바다(壬)', summary: '지혜롭고 유연하며 거대한 흐름을 읽을 줄 아는 통찰가입니다.' },
  '癸': { typeName: '맑은 냇물(癸)', summary: '두뇌 회전이 빠르고 창의적이며 주변에 스며드는 지략가입니다.' }
};

const DAY_MASTER_PROFILES: Record<string, DayMasterProfile> = {
  '甲': {
    core: '크게 방향을 잡고 앞으로 뻗어가는 개척형 일간',
    strength: '판을 키우고 사람을 끌어모으는 추진력',
    risk: '속도가 빨라 디테일과 마감이 뒤로 밀릴 수 있음',
    strategy: '큰 목표를 작게 쪼개고, 매주 정리하는 루틴을 붙이면 강점이 오래 갑니다.',
  },
  '乙': {
    core: '환경을 읽고 유연하게 살아남는 적응형 일간',
    strength: '관계와 흐름을 세밀하게 조율하는 감각',
    risk: '맞춰주다 보면 자기 기준이 흐려질 수 있음',
    strategy: '양보할 수 없는 기준 3가지를 먼저 정해두면 유연함이 무기가 됩니다.',
  },
  '丙': {
    core: '존재감과 표현력이 강한 발산형 일간',
    strength: '분위기를 띄우고 빠르게 몰입시키는 에너지',
    risk: '감정 온도가 높아질수록 판단이 성급해질 수 있음',
    strategy: '중요한 결정은 하루를 넘겨 확인하면 직관의 정확도가 올라갑니다.',
  },
  '丁': {
    core: '작지만 오래 타오르는 집중형 일간',
    strength: '사람의 마음과 맥락을 읽는 섬세한 통찰',
    risk: '혼자 오래 품다가 소진되거나 예민해질 수 있음',
    strategy: '생각을 글로 꺼내고, 도움 요청 시점을 미리 정해두는 것이 좋습니다.',
  },
  '戊': {
    core: '중심을 잡고 버티는 안정형 일간',
    strength: '흔들리는 상황에서도 기준을 유지하는 신뢰감',
    risk: '변화가 필요한 순간에도 고집으로 버틸 수 있음',
    strategy: '고정된 원칙 옆에 예외 조건을 함께 써두면 안정감이 성과로 이어집니다.',
  },
  '己': {
    core: '현실을 가꾸고 결과로 만드는 생산형 일간',
    strength: '세부를 챙기고 사람을 품는 실무 감각',
    risk: '너무 많이 받아주다 자기 에너지가 분산될 수 있음',
    strategy: '내 몫과 남의 몫을 구분하는 체크리스트가 필요합니다.',
  },
  '庚': {
    core: '필요한 것을 자르고 결정하는 결단형 일간',
    strength: '복잡한 상황을 단순하게 만드는 판단력',
    risk: '기준이 강해 관계에서 차갑게 느껴질 수 있음',
    strategy: '결론 전에 이유를 한 문장 더 설명하면 영향력이 부드럽게 커집니다.',
  },
  '辛': {
    core: '완성도와 품질을 끌어올리는 정밀형 일간',
    strength: '작은 차이를 발견하고 결과물을 다듬는 능력',
    risk: '완벽 기준이 높아 시작이 늦거나 피로가 쌓일 수 있음',
    strategy: '초안과 완성본을 분리해서 평가하면 날카로움이 생산성으로 바뀝니다.',
  },
  '壬': {
    core: '큰 흐름을 읽고 전략을 설계하는 확장형 일간',
    strength: '복잡한 정보를 연결해 방향을 보는 통찰',
    risk: '생각이 커질수록 실행 단위가 흐려질 수 있음',
    strategy: '큰 그림을 세운 뒤 오늘 할 한 가지 행동으로 바로 내려와야 합니다.',
  },
  '癸': {
    core: '작은 신호를 포착하고 해법을 찾는 지략형 일간',
    strength: '섬세한 관찰과 빠른 학습 능력',
    risk: '불안이 많아지면 결정을 미루기 쉬움',
    strategy: '정보 수집 시간을 제한하면 판단 속도와 자신감이 함께 올라갑니다.',
  },
};

function hasBirthTime(input: SajuInput) {
  return Boolean(input.birthTime && /^\d{2}:\d{2}$/.test(input.birthTime));
}

function parseBirthDate(birthDate: string) {
  const [year, month, day] = birthDate.split('-').map(Number);
  return { year, month, day };
}

function addPillarElements(pillar: string, distribution: ElementDistribution) {
  if (pillar.length < 2) return;

  const stemType = STEM_ELEMENTS[pillar[0]];
  const branchType = BRANCH_ELEMENTS[pillar[1]];

  if (stemType) distribution[stemType]++;
  if (branchType) distribution[branchType]++;
}

function getRankedElements(distribution: ElementDistribution) {
  return (Object.keys(distribution) as ElementType[])
    .map((type) => ({ type, count: distribution[type] }))
    .sort((a, b) => b.count - a.count);
}

function formatElements(types: ElementType[]) {
  return types.map((type) => ELEMENT_LABELS[type]).join(', ');
}

function buildElementProfile(distribution: ElementDistribution, timeKnown: boolean): ElementProfile {
  const ranked = getRankedElements(distribution);
  const totalCount = ranked.reduce((sum, item) => sum + item.count, 0);
  const max = ranked[0]?.count ?? 0;
  const min = ranked[ranked.length - 1]?.count ?? 0;
  const dominant = ranked.filter((item) => item.count === max && item.count > 0).map((item) => item.type);
  const weak = ranked.filter((item) => item.count === min).map((item) => item.type);
  const missing = ranked.filter((item) => item.count === 0).map((item) => item.type);
  const ideal = totalCount / 5;
  const imbalance = ranked.reduce((sum, item) => sum + Math.abs(item.count - ideal), 0);
  const maxImbalance = totalCount * 1.6;
  const balanceScore = Math.max(0, Math.min(100, Math.round(100 - (imbalance / maxImbalance) * 100)));
  const dominantText = dominant.length > 0 ? formatElements(dominant) : '특정 오행';
  const weakText = missing.length > 0 ? formatElements(missing) : formatElements(weak);
  const timePrefix = timeKnown ? '8글자 기준' : '시간 미상으로 6글자 기준';

  return {
    dominant,
    weak,
    missing,
    balance_score: balanceScore,
    total_count: totalCount,
    summary: `${timePrefix}에서 ${dominantText} 기운이 가장 강하고, ${weakText} 기운이 보강 포인트입니다.`,
    recommendation:
      missing.length > 0
        ? `비어 있는 ${formatElements(missing)} 기운을 생활 루틴과 의사결정 방식에서 의식적으로 채우는 것이 좋습니다.`
        : `${dominantText} 기운이 과하게 앞서지 않도록, 약한 ${formatElements(weak)} 기운을 보완하는 선택이 균형을 만듭니다.`,
  };
}

export function analyzeSaju(input: SajuInput): SajuAnalysis {
  const { year, month, day } = parseBirthDate(input.birthDate);
  const birthTime = input.birthTime;
  const timeKnown = hasBirthTime(input);
  let solar = Solar.fromYmd(year, month, day);
  
  if (timeKnown && birthTime) {
    const [hours, minutes] = birthTime.split(':').map(Number);
    solar = Solar.fromYmdHms(year, month, day, hours, minutes, 0);
  }

  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  
  const pillars = {
    year: eightChar.getYear(),
    month: eightChar.getMonth(),
    day: eightChar.getDay(),
    hour: timeKnown ? eightChar.getTime() : UNKNOWN_HOUR
  };

  // 오행 분포 계산
  const distribution: ElementDistribution = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

  // 시간 미상인 경우 시주를 추정하지 않고 6글자 기준으로만 집계한다.
  [pillars.year, pillars.month, pillars.day, ...(timeKnown ? [pillars.hour] : [])].forEach(p => {
    addPillarElements(p, distribution);
  });

  const dayMaster = pillars.day[0];
  const info = DAY_MASTER_INFO[dayMaster] || { typeName: '미지의 구조', summary: '알 수 없는 구조입니다.' };
  const elementProfile = buildElementProfile(distribution, timeKnown);
  const dayMasterProfile = DAY_MASTER_PROFILES[dayMaster] || {
    core: info.summary,
    strength: '자기 구조를 읽고 조정하는 힘',
    risk: '아직 해석 데이터가 충분하지 않아 단정하기 어려움',
    strategy: '반복되는 선택 패턴을 먼저 기록해보는 것이 좋습니다.',
  };

  // 3. 룰 엔진 적용 (매칭되는 모든 룰 찾기)
  const matchedRules = sajuRules.filter(rule => rule.condition(distribution));
  
  // 기본값 설정 (매칭된 룰이 없을 경우 대비)
  const primaryRule = matchedRules[0];

  return {
    summary: primaryRule ? primaryRule.interpretation.personality : info.summary,
    type_name: info.typeName,
    personality_keywords: matchedRules.length > 0 
      ? matchedRules.map(r => r.interpretation.strength).slice(0, 3) 
      : ["논리적", "분석적"],
    pain_point: matchedRules.length > 0 
      ? matchedRules.map(r => r.content.pain_point).join(" ") 
      : "분석을 위해 더 많은 데이터가 필요합니다.",
    relationship_style: primaryRule ? primaryRule.interpretation.relationship_style : "신중하고 논리적인 관계를 지향합니다.",
    money_style: primaryRule ? primaryRule.interpretation.money_style : "안정적인 흐름을 중시합니다.",
    timing_flow: "현재는 자신의 구조를 이해하고 에너지를 응축해야 하는 시기입니다.",
    element_distribution: distribution,
    pillars: pillars,
    day_master: dayMaster,
    time_known: timeKnown,
    confidence_note: timeKnown
      ? '태어난 시간이 입력되어 시주까지 포함한 8글자 기준 분석입니다.'
      : '태어난 시간이 없어 시주는 추정하지 않았고, 연주·월주·일주 6글자 기준으로 분석했습니다.',
    element_profile: elementProfile,
    day_master_profile: dayMasterProfile,
    // 바이럴 문구 추가
    viral_sentences: {
      self_realization: primaryRule ? primaryRule.content.share_sentence : "나는 나를 알아가는 과정에 있다.",
      painful_truth: primaryRule ? primaryRule.content.pain_point : "진실은 때로 아프지만 성장에 보탬이 됩니다.",
      social_share: `나는 '${info.typeName}'의 구조를 가진 사람입니다.`
    }
  };
}
