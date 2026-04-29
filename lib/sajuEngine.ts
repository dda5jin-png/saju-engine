import { Solar } from 'lunar-javascript';
import {
  DayMasterProfile,
  DetailedReading,
  ElementDistribution,
  ElementProfile,
  ElementType,
  JewelryRecommendation,
  JewelryOption,
  SajuAnalysis,
  SajuInput,
  ViralCharacterMode,
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

const ELEMENT_MEANINGS: Record<ElementType, { trait: string; excess: string; practice: string; image: string; lowImage: string }> = {
  wood: {
    trait: '성장, 기획, 확장, 시작의 힘',
    excess: '일을 크게 벌리지만 마무리 에너지가 분산되기 쉽습니다.',
    practice: '목표를 작게 쪼개고 마감 기준을 먼저 정하세요.',
    image: '봄비를 맞고 한 번에 가지를 뻗는 나무처럼, 기회를 보면 먼저 몸이 앞으로 나갑니다.',
    lowImage: '화분의 흙은 있는데 새순이 늦게 올라오는 모습처럼, 시작의 명분과 방향을 더 분명히 세워야 힘이 붙습니다.',
  },
  fire: {
    trait: '표현, 열정, 몰입, 드러나는 에너지',
    excess: '감정 온도가 높아질 때 말과 선택이 빨라질 수 있습니다.',
    practice: '중요한 대화와 결제는 한 번 식힌 뒤 진행하세요.',
    image: '방 안의 조명을 단숨에 켜는 사람처럼, 분위기와 속도를 바꾸는 존재감이 있습니다.',
    lowImage: '좋은 장작이 있어도 불씨가 약한 상태라, 마음속 의욕을 밖으로 드러내는 연습이 필요합니다.',
  },
  earth: {
    trait: '안정, 축적, 현실감, 중재의 힘',
    excess: '익숙한 방식에 머물러 변화 타이밍을 늦출 수 있습니다.',
    practice: '유지할 것과 바꿀 것을 나누어 적어보세요.',
    image: '사람들이 잠시 쉬어갈 수 있는 넓은 마당처럼, 주변을 받아내고 판을 안정시키는 힘이 큽니다.',
    lowImage: '집을 짓기 전 기초 공사가 얇은 상태라, 약속·돈·일정의 기본 틀을 먼저 세울수록 안정됩니다.',
  },
  metal: {
    trait: '정리, 판단, 경계, 결단의 힘',
    excess: '기준이 강해져 관계에서 차갑게 보일 수 있습니다.',
    practice: '결론 앞에 이유와 감정을 한 문장 덧붙이세요.',
    image: '흐트러진 책상을 칼같이 정리하는 손처럼, 복잡한 문제에서 핵심만 남기는 감각이 좋습니다.',
    lowImage: '가위가 무뎌진 상태라 자를 것과 남길 것을 정하는 데 시간이 걸릴 수 있습니다.',
  },
  water: {
    trait: '사고, 탐색, 정보, 흐름을 읽는 힘',
    excess: '생각이 깊어질수록 실행이 늦어질 수 있습니다.',
    practice: '정보 수집 시간을 제한하고 작은 실행부터 시작하세요.',
    image: '겉으로는 잔잔하지만 바닥에서는 물길이 계속 움직이는 강처럼, 보이지 않는 계산과 관찰이 많습니다.',
    lowImage: '지도는 있는데 물길이 마른 상태라, 정보와 휴식이 채워질 때 판단의 유연함이 살아납니다.',
  },
};

const JEWELRY_MATCHING: Record<ElementType, {
  meaning: string;
  gems: string[];
  colors: string[];
  metals: string[];
  shapes: string[];
  jewelry: string;
  tone: string;
}> = {
  wood: {
    meaning: '성장, 확장, 시작',
    gems: ['에메랄드', '페리도트', '그린 투어말린', '제이드'],
    colors: ['그린'],
    metals: ['화이트골드', '옐로우골드'],
    shapes: ['길쭉한 형태'],
    jewelry: '그린 스톤 펜던트',
    tone: '그린, 새싹색, 브러시드 골드',
  },
  fire: {
    meaning: '추진력, 행동력, 표현',
    gems: ['루비', '가넷', '레드 스피넬', '핑크 사파이어'],
    colors: ['레드', '핑크'],
    metals: ['옐로우골드', '핑크골드'],
    shapes: ['날카롭고 역동적인 컷'],
    jewelry: '레드 스톤 링',
    tone: '레드, 핑크, 로즈골드',
  },
  earth: {
    meaning: '안정, 재물, 기반',
    gems: ['시트린', '타이거아이', '옐로우 토파즈', '스모키 쿼츠'],
    colors: ['브라운', '옐로우'],
    metals: ['순금', '옐로우골드'],
    shapes: ['둥근 형태'],
    jewelry: '골드 브레이슬릿',
    tone: '브라운, 옐로우, 순금',
  },
  metal: {
    meaning: '결단력, 통제, 구조',
    gems: ['다이아몬드', '화이트 사파이어', '화이트 토파즈'],
    colors: ['화이트', '실버'],
    metals: ['화이트골드', '플래티넘'],
    shapes: ['각진 컷'],
    jewelry: '화이트 메탈 링',
    tone: '화이트, 실버, 플래티넘',
  },
  water: {
    meaning: '흐름, 지혜, 관계',
    gems: ['아쿠아마린', '블루 사파이어', '라피스라줄리', '블루 토파즈'],
    colors: ['블루', '블랙'],
    metals: ['화이트골드', '실버'],
    shapes: ['물방울형'],
    jewelry: '블루 스톤 네크리스',
    tone: '블루, 블랙, 화이트 메탈',
  },
};

const DAY_MASTER_SCENES: Record<string, { metaphor: string; shadow: string; advice: string }> = {
  '甲': {
    metaphor: '큰 나무가 하늘을 향해 곧게 서듯, 방향이 정해지면 주변을 이끌며 판을 키웁니다.',
    shadow: '가지가 너무 빨리 뻗으면 아래쪽 정리가 늦어져, 시작한 일들이 동시에 관리 이슈가 됩니다.',
    advice: '리더 역할을 맡되 마지막 점검표를 곁에 두면 신뢰가 오래 갑니다.',
  },
  '乙': {
    metaphor: '담장을 타고 올라가는 넝쿨처럼, 막힌 길에서도 틈을 찾아 결국 살아남습니다.',
    shadow: '너무 잘 맞춰주면 내 줄기가 어디로 향하는지 흐려질 수 있습니다.',
    advice: '관계의 온도는 유지하되 양보하지 않을 기준을 먼저 정하세요.',
  },
  '丙': {
    metaphor: '해가 뜨면 방 안의 먼지까지 보이듯, 존재감이 상황을 밝히고 사람들을 움직입니다.',
    shadow: '빛이 너무 강하면 가까운 사람이 눈부심을 느끼듯, 직설과 속도가 부담이 될 수 있습니다.',
    advice: '표현력은 살리고 결정은 한 박자 늦추면 매력이 설득력으로 바뀝니다.',
  },
  '丁': {
    metaphor: '작은 촛불이 어두운 방의 방향을 잡아주듯, 조용하지만 오래 집중하는 힘이 있습니다.',
    shadow: '혼자 속을 태우면 불빛보다 그을음이 먼저 쌓입니다.',
    advice: '마음에 품은 판단을 글이나 대화로 조금씩 꺼내야 에너지가 맑게 탑니다.',
  },
  '戊': {
    metaphor: '산이 계절마다 자리를 지키듯, 흔들리는 상황에서 중심을 세우는 사람입니다.',
    shadow: '산은 쉽게 움직이지 않기 때문에, 변화가 필요한 순간에는 고집처럼 보일 수 있습니다.',
    advice: '원칙은 유지하되 예외 조건을 미리 정하면 안정감이 답답함으로 굳지 않습니다.',
  },
  '己': {
    metaphor: '밭이 씨앗을 품어 작물로 바꾸듯, 사람과 일을 현실적인 결과로 키우는 힘이 있습니다.',
    shadow: '너무 많이 품으면 좋은 흙도 금방 지치고, 남의 문제까지 내 책임처럼 떠안게 됩니다.',
    advice: '돌볼 것과 돌려보낼 것을 나누면 포용력이 생산성으로 이어집니다.',
  },
  '庚': {
    metaphor: '원석을 단단한 칼날로 벼리듯, 필요한 것만 남기고 결론을 내리는 힘이 강합니다.',
    shadow: '칼날이 너무 먼저 나오면 상대는 해결보다 공격으로 받아들일 수 있습니다.',
    advice: '결론을 말하기 전에 맥락을 한 문장 얹으면 단단함이 믿음으로 전달됩니다.',
  },
  '辛': {
    metaphor: '보석을 마지막까지 연마하듯, 작은 흠과 어긋남을 발견해 완성도를 높입니다.',
    shadow: '기준이 높아질수록 시작 전부터 마음이 피곤해지고, 완성 전에는 스스로를 인정하기 어렵습니다.',
    advice: '초안은 거칠게, 완성은 섬세하게 나누면 예민함이 실력이 됩니다.',
  },
  '壬': {
    metaphor: '넓은 바다가 여러 물길을 받아들이듯, 큰 흐름과 복잡한 정보를 한꺼번에 읽습니다.',
    shadow: '생각의 바다가 넓어질수록 오늘 할 한 걸음이 흐려질 수 있습니다.',
    advice: '큰 전략을 세운 뒤 가장 작은 실행 단위로 내려오는 습관이 필요합니다.',
  },
  '癸': {
    metaphor: '새벽 이슬이 소리 없이 스며들듯, 작고 미묘한 신호를 빨리 포착합니다.',
    shadow: '감지가 빠른 만큼 걱정도 빨리 번져, 결정 전에 경우의 수가 너무 많아질 수 있습니다.',
    advice: '정보 수집 시간을 제한하면 섬세함이 불안이 아니라 판단력으로 남습니다.',
  },
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

function sentenceList(items: string[]) {
  return items.filter(Boolean).join(' ');
}

function getSupportElement(elementProfile: ElementProfile, distribution: ElementDistribution): ElementType {
  const ranked = getRankedElements(distribution);
  return elementProfile.missing[0] ?? elementProfile.weak[0] ?? ranked[ranked.length - 1]?.type ?? 'water';
}

function classifyElementStates(distribution: ElementDistribution) {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  const lowCut = total >= 8 ? 1 : 0;
  const highCut = total >= 8 ? 3 : 2;

  return (Object.keys(distribution) as ElementType[]).reduce(
    (states, type) => {
      const count = distribution[type];
      states[type] = count <= lowCut ? '부족' : count >= highCut ? '과다' : '적정';
      return states;
    },
    {} as Record<ElementType, '부족' | '적정' | '과다'>,
  );
}

function getAvoidElement(elementProfile: ElementProfile, distribution: ElementDistribution, supportElement: ElementType): ElementType {
  const ranked = getRankedElements(distribution);
  return elementProfile.dominant.find((type) => type !== supportElement) ?? ranked[0]?.type ?? supportElement;
}

function buildJewelryOptions(supportElement: ElementType, avoidElement: ElementType): JewelryOption[] {
  const match = JEWELRY_MATCHING[supportElement];
  const avoidLabel = ELEMENT_LABELS[avoidElement];

  return match.gems.slice(0, 2).map((gemstone, index) => ({
    gemstone,
    reason:
      index === 0
        ? `${ELEMENT_LABELS[supportElement]}은 ${match.meaning}의 에너지입니다. 현재 구조에서 이 기운을 보완해야 하므로, ${match.colors.join('/')} 계열의 ${gemstone}이 가장 직접적인 상징이 됩니다. 과한 ${avoidLabel} 기운을 더 키우지 않고 필요한 방향만 선명하게 보강합니다.`
        : `${gemstone}은 같은 ${ELEMENT_LABELS[supportElement]} 계열을 더 일상적으로 쓰기 좋은 대안입니다. 첫 번째 보석보다 부담이 적고, 매일 착용해도 스타일이 과해지지 않아 루틴형 보완에 적합합니다.`,
    metal: match.metals[index % match.metals.length],
    shape: match.shapes[0],
  }));
}

function buildJewelryPracticalStrategy(supportElement: ElementType) {
  const label = ELEMENT_LABELS[supportElement];

  return {
    love: `${label} 기운을 보완하는 보석은 관계에서 부족한 태도를 의식하게 만드는 장치입니다. 감정 표현이 약하면 목걸이, 결단이 약하면 반지로 시선을 고정하세요.`,
    money: `${label} 기운은 재물 판단에서 빠진 기준을 보강합니다. 계약·결제·투자처럼 숫자를 다루는 날에는 손에 보이는 반지나 팔찌가 가장 실용적입니다.`,
    business: `사업이나 업무 확장 상황에서는 ${label}의 상징을 작은 포인트로 두는 편이 좋습니다. 과한 장식보다 매일 반복 착용 가능한 디자인이 신뢰감을 만듭니다.`,
    relationship: `인간관계에서는 부족한 ${label} 기운을 말투보다 분위기로 먼저 보완하세요. 목걸이는 인상을 부드럽게, 팔찌는 행동의 리듬을 안정시킵니다.`,
  };
}

function buildJewelryWearingGuide(supportElement: ElementType) {
  const match = JEWELRY_MATCHING[supportElement];
  const primaryGem = match.gems[0];
  const secondaryGem = match.gems[1];
  const metal = match.metals[0];

  return {
    ring: `${metal} ${primaryGem} 반지는 결정을 내려야 하는 날에 가장 적합합니다. 손에 보이는 위치라 선택 기준을 계속 상기시킵니다.`,
    necklace: `${secondaryGem} 목걸이는 대화, 연애, 인간관계처럼 인상이 중요한 상황에 맞습니다. 시선이 얼굴과 목선으로 올라와 부드러운 보완이 됩니다.`,
    bracelet: `${match.metals[match.metals.length - 1]} 팔찌는 돈, 일정, 업무처럼 반복 관리가 필요한 날에 좋습니다. 과시보다 루틴을 잡는 용도로 쓰세요.`,
  };
}

function buildJewelryRecommendation(elementProfile: ElementProfile, distribution: ElementDistribution): JewelryRecommendation {
  const supportElement = getSupportElement(elementProfile, distribution);
  const avoidElement = getAvoidElement(elementProfile, distribution, supportElement);
  const match = JEWELRY_MATCHING[supportElement];
  const recommendations = buildJewelryOptions(supportElement, avoidElement);
  const practicalStrategy = buildJewelryPracticalStrategy(supportElement);
  const wearingGuide = buildJewelryWearingGuide(supportElement);

  return {
    support_element: supportElement,
    element_label: ELEMENT_LABELS[supportElement],
    gemstone: recommendations.map((item) => item.gemstone).join(' 또는 '),
    jewelry: match.jewelry,
    tone: match.tone,
    reason: `${ELEMENT_LABELS[supportElement]} 기운은 현재 명식에서 보강해야 할 용신 축입니다. ${match.meaning}을 상징하는 색과 형태로 가져가야 해석과 착용 전략이 겹치지 않고 기능적으로 분리됩니다.`,
    styling_tip: `${recommendations[0].metal} 소재와 ${recommendations[0].shape}를 우선으로 고르세요. 중요한 상황에서는 작은 포인트 하나만 선명하게 쓰는 편이 가장 단정합니다.`,
    element_states: classifyElementStates(distribution),
    needed_element: supportElement,
    avoid_element: avoidElement,
    needed_element_label: ELEMENT_LABELS[supportElement],
    avoid_element_label: ELEMENT_LABELS[avoidElement],
    recommendations,
    practical_strategy: practicalStrategy,
    wearing_guide: wearingGuide,
    scenario_summary: `중요한 결정이나 도전 상황에서는 ${recommendations[0].metal} ${recommendations[0].gemstone} 반지를 착용하는 것이 가장 효과적입니다.`,
  };
}

function buildDetailedReading(
  input: SajuInput,
  pillars: { year: string; month: string; day: string; hour: string },
  dayMaster: string,
  dayMasterProfile: DayMasterProfile,
  elementProfile: ElementProfile,
  distribution: ElementDistribution,
  timeKnown: boolean,
  matchedRules: typeof sajuRules,
): DetailedReading {
  const ranked = getRankedElements(distribution);
  const dominant = elementProfile.dominant[0] ?? ranked[0]?.type ?? 'earth';
  const support = getSupportElement(elementProfile, distribution);
  const dominantMeaning = ELEMENT_MEANINGS[dominant];
  const supportMeaning = ELEMENT_MEANINGS[support];
  const dayScene = DAY_MASTER_SCENES[dayMaster];
  const ruleStrengths = matchedRules.map((rule) => rule.interpretation.strength).slice(0, 3);
  const ruleWeaknesses = matchedRules.map((rule) => rule.interpretation.weakness).slice(0, 2);
  const genderContext = input.gender === 'female' ? '여성 사주' : '남성 사주';

  return {
    basis: [
      `연주 ${pillars.year}`,
      `월주 ${pillars.month}`,
      `일주 ${pillars.day}`,
      timeKnown ? `시주 ${pillars.hour}` : '시주 미상',
      `일간 ${dayMaster}`,
      `오행 총 ${elementProfile.total_count}글자`,
    ],
    temperament: sentenceList([
      `${genderContext}로 입력된 이 명식은 일간 ${dayMaster}을 중심축으로 봅니다.`,
      dayMasterProfile.core,
      dayScene?.metaphor ?? '',
      `가장 강한 ${ELEMENT_LABELS[dominant]} 기운은 ${dominantMeaning.trait}을 뜻합니다. ${dominantMeaning.image}`,
      ruleStrengths.length > 0 ? `특히 ${ruleStrengths.join(', ')}이 장점으로 드러납니다.` : '',
    ]),
    work_style: sentenceList([
      `일에서는 ${dayMasterProfile.strength}이 강점입니다.`,
      `${ELEMENT_LABELS[dominant]} 기운이 앞설 때는 ${dominantMeaning.excess}`,
      dayScene?.shadow ?? '',
      ruleWeaknesses.length > 0 ? `주의할 점은 ${ruleWeaknesses.join(', ')}입니다.` : dayMasterProfile.risk,
      `${dayMasterProfile.strategy} ${dayScene?.advice ?? ''}`,
    ]),
    relationship: sentenceList([
      `관계에서는 ${supportMeaning.trait}이 보완 포인트입니다.`,
      matchedRules[0]?.interpretation.relationship_style ?? '가까운 관계일수록 기준과 감정 표현의 균형이 중요합니다.',
      `부족한 ${ELEMENT_LABELS[support]} 기운은 ${supportMeaning.lowImage}`,
      '상대가 원하는 답보다 내가 줄 수 있는 답의 범위를 먼저 말하면 관계가 덜 소모됩니다.',
    ]),
    money: sentenceList([
      matchedRules[0]?.interpretation.money_style ?? '돈의 흐름은 안정성과 실행 속도의 균형을 함께 봐야 합니다.',
      `${ELEMENT_LABELS[dominant]} 기운이 강할수록 판단의 속도와 기준이 선명해지지만, 기록 없이 움직이면 반복 지출이나 무리한 선택으로 번질 수 있습니다.`,
      '기분이 올라간 날에는 지출과 투자를 바로 확정하지 말고 하루 뒤 다시 보는 장치가 필요합니다.',
      '예산, 손절 기준, 보유 기간을 먼저 숫자로 정하면 돈의 흐름을 감정이 아니라 구조로 다루기 쉬워집니다.',
    ]),
    timing: sentenceList([
      timeKnown
        ? '태어난 시간이 있어 시주까지 포함했기 때문에 말년, 실행 습관, 외부로 드러나는 행동 패턴을 조금 더 구체적으로 볼 수 있습니다.'
        : '태어난 시간이 없어 시주는 해석하지 않았습니다. 그래서 말년운이나 세밀한 실행 패턴은 단정하지 않고 큰 구조 중심으로 봅니다.',
      '현재 결과는 대운·세운까지 계산한 예측이 아니라, 태어난 사주의 기본 구조를 설명하는 정적 해석입니다.',
      '다음 고도화 단계에서는 절기 기준 대운 시작 시점과 연도별 세운을 분리해 타이밍 해석을 붙이는 것이 좋습니다.',
    ]),
    balance_practice: sentenceList([
      elementProfile.recommendation,
      `${ELEMENT_LABELS[support]} 보완 실천: ${supportMeaning.practice}`,
      `하루를 마감할 때 오늘의 선택을 ${ELEMENT_LABELS[dominant]}의 강점으로 처리한 일과 ${ELEMENT_LABELS[support]}로 보완할 일로 나눠 적어보세요.`,
      '사주는 확정된 운명표라기보다 반복되는 선택 습관을 읽는 참고 도구로 쓰는 편이 가장 안전합니다.',
    ]),
    reliability_note:
      '음양력 변환은 천문 역법 기준 계산 라이브러리를 사용하고, 해석은 일간 중심·오행 분포·강약 보완이라는 명리학의 전통적 구조를 앱 안에서 규칙화한 것입니다. 개인의 실제 삶, 환경, 선택을 대체하는 판단으로 사용하지 마세요.',
  };
}

function buildViralCharacterMode(
  dayMaster: string,
  dayMasterProfile: DayMasterProfile,
  elementProfile: ElementProfile,
  distribution: ElementDistribution,
  matchedRules: typeof sajuRules,
): ViralCharacterMode {
  const ranked = getRankedElements(distribution);
  const dominant = elementProfile.dominant[0] ?? ranked[0]?.type ?? 'earth';
  const support = getSupportElement(elementProfile, distribution);
  const dominantLabel = ELEMENT_LABELS[dominant];
  const supportLabel = ELEMENT_LABELS[support];
  const primaryRule = matchedRules[0];

  const archetypes: Record<string, { type: string; definition: string; decision: string; similar: string; quotes: string[]; lines: string[] }> = {
    '甲': {
      type: '판을 키우는 개척자형',
      definition: '넌 작은 판에서 오래 버티는 사람보다, 판 자체를 키우는 쪽에 가깝다. 방향이 보이면 먼저 깃발을 꽂고 사람을 모은다.',
      decision: '완벽한 준비보다 큰 방향을 먼저 본다. 대신 시작한 뒤 정리할 사람이 없으면 스스로가 제일 피곤해진다.',
      similar: 'RPG로 치면 선봉에 서는 리더 클래스. 무작정 돌격하는 전사가 아니라, 길을 열고 팀을 앞으로 당기는 타입이다.',
      quotes: ['얘는 일단 판부터 크게 봄.', '작게 하자고 해도 결국 크게 만듦.', '문제는 마감 디테일에서 체력 빠질 때 있음.'],
      lines: ['작게 시작해도 결국 판을 키우는 사람', '방향 잡히면 제일 먼저 움직이는 타입', '기회가 보이면 판부터 키우는 사람'],
    },
    '乙': {
      type: '틈을 찾는 생존 전략가형',
      definition: '넌 힘으로 밀어붙이는 타입이 아니다. 막힌 길에서도 틈을 찾고, 안 되는 상황을 되게 만드는 쪽에 가깝다.',
      decision: '정면 돌파보다 우회로를 선호한다. 유연하지만, 너무 맞춰주면 자기 기준이 흐려질 수 있다.',
      similar: '게임 직업으로 치면 정찰과 교섭을 같이 하는 서포트 전략가. 싸움을 피하는 게 아니라 이길 각을 고르는 사람이다.',
      quotes: ['얘는 진짜 어떻게든 방법을 찾음.', '근데 자기 마음은 잘 숨김.', '착해 보이는데 은근히 생존력 강함.'],
      lines: ['부드럽지만 쉽게 꺾이지 않는 사람', '정면보다 빈틈을 먼저 보는 타입', '맞춰주지만 자기 길은 끝내 찾는 사람'],
    },
    '丙': {
      type: '분위기를 장악하는 발광체형',
      definition: '넌 존재감이 약한 사람이 아니다. 말하지 않아도 공기의 온도를 바꾸고, 들어오면 장면이 밝아지는 타입이다.',
      decision: '판단이 빠르고 표현도 빠르다. 장점은 추진력이고, 약점은 감정 온도가 높을 때 결론까지 빨라진다는 점이다.',
      similar: '무대 위 주연 캐릭터에 가깝다. 앞에서 빛나지만, 그 빛이 강할수록 주변은 눈부심을 느낄 수 있다.',
      quotes: ['얘 들어오면 분위기 달라짐.', '말이 빠른데 이상하게 설득됨.', '근데 화나면 결론도 너무 빨리 냄.'],
      lines: ['존재감으로 판을 밝히는 사람', '느끼면 바로 움직이는 발산형', '분위기를 바꾸고 속도를 올리는 타입'],
    },
    '丁': {
      type: '조용히 오래 타는 집중형',
      definition: '넌 시끄럽게 증명하는 사람은 아니다. 조용히 보고, 오래 품고, 결정적인 순간에 정확히 불을 켜는 타입이다.',
      decision: '한 번 마음에 들어온 문제는 쉽게 놓지 않는다. 다만 혼자 오래 품으면 생각이 감정보다 뜨거워질 수 있다.',
      similar: '후방에서 판세를 읽는 마법사형 캐릭터. 화려한 폭발보다 필요한 순간의 한 방이 강하다.',
      quotes: ['얘는 말은 적은데 다 보고 있음.', '혼자 생각하다가 갑자기 정답을 냄.', '근데 속에 쌓이면 티가 확 남.'],
      lines: ['조용하지만 오래 타오르는 사람', '말보다 관찰로 판을 읽는 타입', '작게 보여도 결정적일 때 강한 사람'],
    },
    '戊': {
      type: '중심을 세우는 기준점형',
      definition: '넌 쉽게 흔들리는 사람이 아니다. 상황이 복잡해질수록 중심을 잡고, 사람들이 기대는 기준점이 된다.',
      decision: '빠른 변화보다 안정된 판단을 선호한다. 단단함이 장점이지만, 가끔은 고집으로 보일 수 있다.',
      similar: '파티의 탱커나 요새 같은 캐릭터. 먼저 흔들리지 않아서 전체가 버틸 수 있게 만든다.',
      quotes: ['얘 있으면 이상하게 판이 안정됨.', '결정은 느린데 한번 정하면 잘 안 바뀜.', '가끔 너무 안 움직여서 답답함.'],
      lines: ['흔들릴수록 더 단단해지는 사람', '판이 흔들릴 때 중심 잡는 타입', '느리지만 쉽게 무너지지 않는 사람'],
    },
    '己': {
      type: '현실을 결과로 바꾸는 운영자형',
      definition: '넌 말보다 실제로 굴러가게 만드는 사람이다. 흩어진 일을 받아내고, 사람과 일을 현실적인 결과로 묶는다.',
      decision: '가능한 것부터 정리하고 쌓아간다. 다만 너무 많이 받아주면 남의 문제까지 내 몫이 된다.',
      similar: 'RPG로 치면 운영형 서포터. 전면에 드러나진 않아도 없으면 전체 시스템이 삐걱인다.',
      quotes: ['얘 없으면 일 정리가 안 됨.', '은근히 다 챙기고 있음.', '근데 너무 떠안다가 혼자 지침.'],
      lines: ['흩어진 일을 현실로 묶는 사람', '조용히 판을 굴리는 운영자 타입', '챙기다 지치기 쉬운 실무형 인간'],
    },
    '庚': {
      type: '필요한 것만 남기는 결단형',
      definition: '넌 애매한 상태를 오래 견디는 사람이 아니다. 복잡한 상황에서 남길 것과 자를 것을 빠르게 구분한다.',
      decision: '감정보다 기준을 먼저 세운다. 그래서 명확하지만, 때로는 차갑게 보일 수 있다.',
      similar: '전략 게임의 지휘관형. 감정으로 움직이지 않고, 손실을 계산한 뒤 가장 빠른 결론을 낸다.',
      quotes: ['얘는 말 돌리는 거 별로 안 좋아함.', '복잡한 걸 한 방에 정리함.', '근데 가끔 너무 칼같아서 무서움.'],
      lines: ['애매하면 자르고 가는 사람', '복잡할수록 기준이 선명해지는 타입', '필요한 것만 남기는 결단형 인간'],
    },
    '辛': {
      type: '완성도를 포기 못 하는 정밀형',
      definition: '넌 대충 넘어가는 걸 잘 못한다. 작은 어긋남을 먼저 보고, 결과물의 마지막 질감을 끝까지 다듬는다.',
      decision: '시작보다 완성 기준이 먼저 떠오른다. 장점은 품질이고, 약점은 스스로에게 너무 빡빡하다는 점이다.',
      similar: '보석 세공사 같은 캐릭터. 남들이 못 보는 흠을 보고, 그 작은 차이로 완성도를 만든다.',
      quotes: ['얘 눈에는 남들이 못 보는 게 보임.', '대충 하자는 말을 제일 싫어함.', '근데 본인이 제일 피곤하게 삶.'],
      lines: ['대충을 못 견디는 완성형 인간', '작은 차이로 결과를 바꾸는 타입', '완벽 기준이 높은 정밀한 사람'],
    },
    '壬': {
      type: '큰 흐름을 읽는 전략가형',
      definition: '넌 눈앞의 사건보다 그 뒤의 흐름을 본다. 정보가 모이면 머릿속에서 판이 커지고, 전체 구조를 먼저 읽는다.',
      decision: '바로 뛰기보다 흐름을 확인한다. 생각이 깊은 만큼 실행 단위가 흐려질 때가 있다.',
      similar: '맵 전체를 보는 전략 시뮬레이션 플레이어. 한 칸 싸움보다 다음 세 턴을 계산하는 타입이다.',
      quotes: ['얘는 생각이 진짜 멀리 감.', '말은 늦는데 방향은 꽤 정확함.', '근데 가끔 실행보다 시뮬레이션이 김.'],
      lines: ['눈앞보다 흐름을 먼저 읽는 사람', '세 턴 뒤를 계산하는 전략가', '생각이 깊어서 출발이 늦는 타입'],
    },
    '癸': {
      type: '작은 신호를 읽는 감지형',
      definition: '넌 큰 소리보다 작은 낌새를 먼저 듣는다. 남들이 넘긴 신호를 잡고, 조용히 해법을 찾는 타입이다.',
      decision: '확신이 생기기 전까지 정보를 더 모은다. 섬세함이 장점이지만, 걱정이 많아지면 결정이 늦어진다.',
      similar: '은밀한 분석가나 힐러형 캐릭터. 전면에 서기보다 흐름을 감지하고 빈틈을 메우는 쪽에 강하다.',
      quotes: ['얘는 분위기 변한 걸 제일 빨리 느낌.', '말 안 해도 눈치챔.', '근데 생각이 많아져서 혼자 불안해질 때 있음.'],
      lines: ['작은 신호를 제일 먼저 읽는 사람', '확신 전까지 절대 쉽게 안 움직이는 타입', '조용히 판을 읽고 해법을 찾는 사람'],
    },
  };

  const archetype = archetypes[dayMaster] ?? archetypes['癸'];
  const ruleHook = primaryRule?.interpretation.decision_style;
  const oneLiner = archetype.lines[0];

  return {
    character_type: `${dominantLabel} 강한 ${archetype.type}`,
    character_definition: `${archetype.definition}\n\n강한 ${dominantLabel} 기운 때문에 반응은 분명하고, 부족한 ${supportLabel} 기운 때문에 보완해야 할 빈틈도 선명하다.`,
    decision_style: ruleHook
      ? `${archetype.decision}\n\n이 명식의 판단 습관은 "${ruleHook}"에 가깝다.`
      : archetype.decision,
    similar_character: archetype.similar,
    outsider_quotes: archetype.quotes,
    one_liner: oneLiner,
    share_lines: archetype.lines,
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
    jewelry_recommendation: buildJewelryRecommendation(elementProfile, distribution),
    detailed_reading: buildDetailedReading(
      input,
      pillars,
      dayMaster,
      dayMasterProfile,
      elementProfile,
      distribution,
      timeKnown,
      matchedRules,
    ),
    viral_character: buildViralCharacterMode(
      dayMaster,
      dayMasterProfile,
      elementProfile,
      distribution,
      matchedRules,
    ),
    // 바이럴 문구 추가
    viral_sentences: {
      self_realization: primaryRule ? primaryRule.content.share_sentence : "나는 나를 알아가는 과정에 있다.",
      painful_truth: primaryRule ? primaryRule.content.pain_point : "진실은 때로 아프지만 성장에 보탬이 됩니다.",
      social_share: `나는 '${info.typeName}'의 구조를 가진 사람입니다.`
    }
  };
}
