import { Solar, Lunar } from 'lunar-javascript';
import { SajuAnalysis, SajuInput, ElementDistribution, ElementType } from '../types/saju';
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

export function analyzeSaju(input: SajuInput): SajuAnalysis {
  const date = new Date(input.birthDate);
  let solar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
  
  if (input.birthTime) {
    const [hours, minutes] = input.birthTime.split(':').map(Number);
    solar = Solar.fromYmdHms(date.getFullYear(), date.getMonth() + 1, date.getDate(), hours, minutes, 0);
  }

  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  
  const pillars = {
    year: eightChar.getYear(),
    month: eightChar.getMonth(),
    day: eightChar.getDay(),
    hour: eightChar.getHour()
  };

  // 오행 분포 계산
  const distribution: ElementDistribution = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  
  const addElement = (char: string, isBranch: boolean) => {
    const type = isBranch ? BRANCH_ELEMENTS[char] : STEM_ELEMENTS[char];
    if (type) distribution[type]++;
  };

  // 8글자 오행 집계
  [pillars.year, pillars.month, pillars.day, pillars.hour].forEach(p => {
    addElement(p[0], false);
    addElement(p[1], true);
  });

  const dayMaster = pillars.day[0];
  const info = DAY_MASTER_INFO[dayMaster] || { typeName: '미지의 구조', summary: '알 수 없는 구조입니다.' };

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
    // 바이럴 문구 추가
    viral_sentences: {
      self_realization: primaryRule ? primaryRule.content.share_sentence : "나는 나를 알아가는 과정에 있다.",
      painful_truth: primaryRule ? primaryRule.content.pain_point : "진실은 때로 아프지만 성장에 보탬이 됩니다.",
      social_share: `나는 '${info.typeName}'의 구조를 가진 사람입니다.`
    }
  };
}

// 상세 분석 헬퍼 함수들 (로직 보강 필요)
function getKeywords(dm: string, dist: ElementDistribution): string[] {
  const base = ["논리적", "분석적"];
  if (dist.fire > 2) base.push("열정적");
  if (dist.metal > 2) base.push("냉철함");
  if (dist.wood > 2) base.push("추진력");
  return base.slice(0, 4);
}

function getPainPoint(dm: string, dist: ElementDistribution): string {
  if (dist.fire > 3) return "폭발적인 에너지가 제어되지 않아 스스로를 소진시키고 있습니다. 멈춰야 할 때 가속 페달을 밟는 것이 당신의 가장 큰 결함입니다.";
  if (dist.metal > 3) return "지나치게 날카로운 원칙이 본인과 주변의 숨통을 조이고 있습니다. 유연함이 결여된 정답은 때로 오답보다 위험합니다.";
  if (dist.water > 3) return "생각의 깊이가 너무 깊어 실행력이 침수되었습니다. 완벽한 계획을 세우느라 기회의 파도를 놓치고 있지는 않나요?";
  return "확신이 생길 때까지 움직이지 않는 신중함이 때로는 성장의 속도를 늦추는 독이 됩니다.";
}

function getRelationshipStyle(dm: string, dist: ElementDistribution): string {
  return "표면적인 다정함보다 구조적인 신뢰를 중시합니다. 바운더리 안의 사람에게는 절대적이지만, 선을 넘는 순간 차갑게 회로를 차단합니다.";
}

function getMoneyStyle(dm: string, dist: ElementDistribution): string {
  return "단순한 저축보다 자산의 흐름과 시스템 구축에 집착합니다. 논리적으로 납득되지 않는 지출에는 인색하지만, 승부처라고 판단되면 과감하게 베팅합니다.";
}
