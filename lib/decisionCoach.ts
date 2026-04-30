import {
  DecisionCategory,
  DecisionChoice,
  DecisionCoachResult,
  ElementType,
  SajuAnalysis,
} from "@/types/saju";

type DecisionProfile = {
  characterType: string;
  decisionStyle: string;
  dominantElementType: ElementType;
  weakElementType: ElementType;
  dominantElement: string;
  weakElement: string;
  blindSpot: string;
  strength: string;
  risk: string;
  strategy: string;
  categoryInsight: string;
};

type Scenario = {
  category: DecisionCategory;
  question: string;
  choices: string[];
  urgency: "now" | "soon" | "later";
  intent: string;
  stake: string;
  riskTheme: string;
  tension: string;
};

const elementLabels: Record<ElementType, string> = {
  wood: "목",
  fire: "화",
  earth: "토",
  metal: "금",
  water: "수",
};

const elementStrengths: Record<ElementType, string> = {
  wood: "새로운 관계와 가능성을 키우는 힘",
  fire: "드러내고 속도를 내는 힘",
  earth: "흔들리는 상황을 버티고 정리하는 힘",
  metal: "필요 없는 것을 자르고 기준을 세우는 힘",
  water: "정보를 모으고 흐름을 읽는 힘",
};

const elementBlindSpots: Record<ElementType, string> = {
  wood: "시작을 미루거나 관계 확장을 과하게 경계하는 점",
  fire: "표현 타이밍을 놓치거나 분위기를 차갑게 만드는 점",
  earth: "안정감을 확인하지 못하면 결정을 계속 미루는 점",
  metal: "기준이 약해지면 자를 것과 남길 것을 헷갈리는 점",
  water: "정보가 부족할 때 감정이나 분위기에 끌려가는 점",
};

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function clean(text: string | undefined, fallback: string) {
  const normalized = text?.replace(/\s+/g, " ").trim();
  return normalized && normalized.length > 0 ? normalized : fallback;
}

function firstElement(list: ElementType[] | undefined, fallback: ElementType) {
  return list && list.length > 0 ? list[0] : fallback;
}

export function inferDecisionCategory(question: string, category?: DecisionCategory): DecisionCategory {
  if (category && category !== "general") return category;

  if (includesAny(question, ["연애", "사랑", "상대", "관계", "이별", "재회", "고백", "결혼", "썸", "연락"])) {
    return "love";
  }

  if (includesAny(question, ["돈", "투자", "주식", "코인", "매수", "매도", "부동산", "대출", "사업", "수익"])) {
    return "money";
  }

  if (includesAny(question, ["이직", "퇴사", "커리어", "회사", "직장", "창업", "면접", "일", "프로젝트", "제안"])) {
    return "career";
  }

  return "general";
}

function buildDecisionProfile(analysis: SajuAnalysis, category: DecisionCategory): DecisionProfile {
  const dominant = firstElement(analysis.element_profile?.dominant, "earth");
  const weak = firstElement(
    analysis.element_profile?.missing?.length ? analysis.element_profile.missing : analysis.element_profile?.weak,
    "water",
  );

  const categoryInsight: Record<DecisionCategory, string> = {
    love: clean(analysis.detailed_reading?.relationship ?? analysis.relationship_style, "관계에서는 말보다 반복 행동과 신뢰 누적을 봐야 합니다."),
    money: clean(analysis.detailed_reading?.money ?? analysis.money_style, "돈 판단에서는 수익보다 손실 한도와 회수 가능성을 먼저 봐야 합니다."),
    career: clean(analysis.detailed_reading?.work_style, "커리어에서는 회사 이름보다 역할, 권한, 보상의 구조를 먼저 봐야 합니다."),
    general: clean(analysis.pain_point ?? analysis.summary, "지금 선택은 감정보다 기준을 세우는 쪽이 핵심입니다."),
  };

  return {
    characterType: clean(analysis.viral_character?.character_type ?? analysis.type_name, "기준형 의사결정 타입"),
    decisionStyle: clean(analysis.viral_character?.decision_style, analysis.day_master_profile?.strategy ?? analysis.summary),
    dominantElementType: dominant,
    weakElementType: weak,
    dominantElement: `${elementLabels[dominant]} 기운`,
    weakElement: `${elementLabels[weak]} 기운`,
    blindSpot: elementBlindSpots[weak],
    strength: clean(analysis.day_master_profile?.strength, elementStrengths[dominant]),
    risk: clean(analysis.day_master_profile?.risk, "기준이 흐려질 때 같은 고민을 오래 반복하는 점"),
    strategy: clean(analysis.day_master_profile?.strategy, "결정 전에 조건을 숫자와 행동 기준으로 바꾸는 전략"),
    categoryInsight: categoryInsight[category],
  };
}

function elementDecisionCue(element: ElementType, category: DecisionCategory) {
  const cues: Record<ElementType, Record<DecisionCategory, string>> = {
    wood: {
      love: "관계를 키울 명분과 성장 가능성",
      money: "작게 시작해 키울 수 있는 구조",
      career: "새 역할에서 확장될 권한",
      general: "지금 선택이 다음 선택을 열어주는지",
    },
    fire: {
      love: "감정을 숨기지 않고 확인할 표현 타이밍",
      money: "속도에 취하지 않는 실행 온도",
      career: "성과를 드러낼 무대와 속도",
      general: "바로 움직일 추진력이 실제 결과로 이어지는지",
    },
    earth: {
      love: "관계가 일상에서 버틸 수 있는 안정감",
      money: "현금 흐름과 회복 가능한 손실 범위",
      career: "보상, 루틴, 생활 기반의 안정성",
      general: "선택 후 흔들리지 않을 기반",
    },
    metal: {
      love: "애매한 관계를 정리할 기준",
      money: "손절, 익절, 금액 제한 같은 통제선",
      career: "역할 범위와 책임 경계",
      general: "남길 것과 자를 것을 구분하는 기준",
    },
    water: {
      love: "상대의 반복 패턴을 읽는 시간",
      money: "정보, 유동성, 빠져나올 길",
      career: "시장 흐름과 다음 이동 루트",
      general: "정보가 충분히 모였는지",
    },
  };

  return cues[element][category];
}

function extractExplicitChoices(question: string) {
  const separators = [" vs ", " VS ", " Vs ", " 아니면 ", " 혹은 ", " 또는 ", " / "];
  for (const separator of separators) {
    if (!question.includes(separator)) continue;
    const parts = question
      .split(separator)
      .map((part) => part.replace(/[?？！.!]/g, "").trim())
      .filter((part) => part.length >= 2);

    if (parts.length >= 2) return parts.slice(0, 3);
  }

  return null;
}

function buildDefaultChoices(question: string, category: DecisionCategory) {
  const explicit = extractExplicitChoices(question);
  if (explicit) return explicit;

  if (category === "love") {
    if (includesAny(question, ["이별", "헤어", "끝내", "정리"])) return ["관계를 정리한다", "거리를 두고 확인한다"];
    if (includesAny(question, ["재회", "다시", "연락"])) return ["다시 연결한다", "연락을 멈추고 회복한다"];
    if (includesAny(question, ["고백", "표현", "말할"])) return ["솔직하게 표현한다", "상대의 행동을 더 본다"];
    return ["관계를 유지하며 확인한다", "감정 투입을 줄이고 본다"];
  }

  if (category === "money") {
    if (includesAny(question, ["매도", "팔", "정리"])) return ["일부 정리한다", "기준을 두고 더 보유한다"];
    if (includesAny(question, ["대출", "부동산", "계약"])) return ["레버리지를 쓴다", "현금 방어를 우선한다"];
    return ["작게 진입한다", "기준까지 기다린다"];
  }

  if (category === "career") {
    if (includesAny(question, ["이직", "퇴사", "옮", "이동"])) return ["이동한다", "현재 판에서 조건을 바꾼다"];
    if (includesAny(question, ["창업", "사업"])) return ["작게 시작한다", "준비 기간을 더 둔다"];
    if (includesAny(question, ["면접", "제안", "오퍼"])) return ["제안을 받는다", "조건을 재협상한다"];
    return ["역할을 넓힌다", "지금 구조를 정리한다"];
  }

  if (includesAny(question, ["할까 말까", "해야 할까", "해도 될까"])) return ["작게 실행한다", "조건을 더 확인한다"];
  return ["지금 실행한다", "기준을 더 세운다"];
}

function inferUrgency(question: string): Scenario["urgency"] {
  if (includesAny(question, ["오늘", "지금", "당장", "이번주", "이번 주"])) return "now";
  if (includesAny(question, ["이번달", "이번 달", "3개월", "한달", "한 달", "곧"])) return "soon";
  return "later";
}

function inferRiskTheme(question: string, category: DecisionCategory) {
  if (includesAny(question, ["돈", "투자", "대출", "손실", "월급", "연봉"])) return "금전 손실과 회수 가능성";
  if (includesAny(question, ["상대", "연락", "이별", "결혼", "관계"])) return "감정 소모와 신뢰 회복 가능성";
  if (includesAny(question, ["퇴사", "이직", "회사", "면접", "평판"])) return "역할 변화와 경력 리스크";
  if (category === "money") return "수익 욕심과 손실 통제";
  if (category === "love") return "감정 확신과 행동 검증";
  if (category === "career") return "이동 욕구와 조건 검증";
  return "기회비용과 후회 가능성";
}

function inferIntent(question: string, category: DecisionCategory) {
  if (category === "love") {
    if (includesAny(question, ["이별", "헤어", "정리", "끝내"])) return "관계를 끝낼지 남길지 판단하는 문제";
    if (includesAny(question, ["재회", "다시", "연락"])) return "다시 연결해도 되는지 검증하는 문제";
    if (includesAny(question, ["고백", "표현", "말할"])) return "감정을 드러낼 타이밍을 정하는 문제";
    if (includesAny(question, ["결혼", "동거"])) return "감정이 생활 구조를 버틸 수 있는지 보는 문제";
    return "감정과 현실의 온도를 맞추는 관계 판단";
  }

  if (category === "money") {
    if (includesAny(question, ["매수", "진입", "살까"])) return "들어갈 가격보다 빠져나올 기준을 정하는 문제";
    if (includesAny(question, ["매도", "팔", "정리"])) return "욕심보다 회수 타이밍을 정하는 문제";
    if (includesAny(question, ["대출", "부동산", "계약"])) return "레버리지와 현금 방어를 비교하는 문제";
    if (includesAny(question, ["사업", "창업", "수익"])) return "확장 욕심과 손실 통제를 동시에 보는 문제";
    return "수익 가능성과 방어선을 같이 계산하는 돈 판단";
  }

  if (category === "career") {
    if (includesAny(question, ["이직", "퇴사", "옮", "이동"])) return "환경을 바꿀지 조건을 바꿀지 결정하는 문제";
    if (includesAny(question, ["제안", "오퍼", "면접"])) return "기회 자체보다 조건의 질을 검증하는 문제";
    if (includesAny(question, ["창업", "사업"])) return "직장 밖 판을 감당할 준비도를 보는 문제";
    if (includesAny(question, ["버티", "힘들", "번아웃"])) return "버티는 비용과 이동 리스크를 비교하는 문제";
    return "역할, 보상, 성장성을 다시 맞추는 커리어 판단";
  }

  if (includesAny(question, ["할까 말까", "해야 할까", "해도 될까"])) return "실행과 보류 사이에서 기준을 정하는 문제";
  return "감정적 확신을 행동 기준으로 바꾸는 문제";
}

function inferStake(question: string, category: DecisionCategory) {
  if (includesAny(question, ["오늘", "당장", "이번주", "이번 주"])) return "타이밍";
  if (includesAny(question, ["돈", "투자", "대출", "계약", "연봉", "월급"])) return "금액";
  if (includesAny(question, ["상대", "연락", "이별", "결혼", "고백"])) return "상대의 반복 행동";
  if (includesAny(question, ["회사", "퇴사", "이직", "직장", "면접"])) return "역할과 보상";
  if (category === "love") return "신뢰 회복 가능성";
  if (category === "money") return "손실 한도";
  if (category === "career") return "새 판의 조건";
  return "되돌릴 수 있는 범위";
}

function inferTension(question: string, category: DecisionCategory) {
  if (includesAny(question, ["불안", "걱정", "무섭", "후회"])) return "불안이 판단 속도를 흐리는 상태";
  if (includesAny(question, ["답답", "지침", "힘들", "버티"])) return "버티는 힘과 탈출 욕구가 동시에 올라온 상태";
  if (includesAny(question, ["확신", "기회", "좋아", "끌려"])) return "기회감은 있지만 검증 기준이 더 필요한 상태";
  if (category === "love") return "감정은 움직였지만 상대의 반복 행동을 더 봐야 하는 상태";
  if (category === "money") return "수익 가능성과 손실 한도가 동시에 걸린 상태";
  if (category === "career") return "환경을 바꾸고 싶은 마음과 조건 확인이 부딪히는 상태";
  return "마음은 기울었지만 판단 기준이 아직 덜 정리된 상태";
}

function buildScenario(question: string, category: DecisionCategory): Scenario {
  return {
    category,
    question,
    choices: buildDefaultChoices(question, category),
    urgency: inferUrgency(question),
    intent: inferIntent(question, category),
    stake: inferStake(question, category),
    riskTheme: inferRiskTheme(question, category),
    tension: inferTension(question, category),
  };
}

function urgencyText(urgency: Scenario["urgency"]) {
  if (urgency === "now") return "지금은 속도보다 확인 순서가 중요합니다.";
  if (urgency === "soon") return "가까운 시한이 있으니 결정을 미루기보다 조건을 좁혀야 합니다.";
  return "당장 결론보다 기준을 세워 다음 기회에도 재사용하는 편이 낫습니다.";
}

function choiceTone(label: string) {
  if (includesAny(label, ["이동", "실행", "진입", "시작", "받", "표현", "연결", "쓴다"])) return "active";
  if (includesAny(label, ["기다", "확인", "유지", "보유", "준비", "본다", "거리"])) return "check";
  if (includesAny(label, ["정리", "멈추", "줄", "방어"])) return "defense";
  return "balance";
}

function buildChoice(
  label: string,
  index: number,
  profile: DecisionProfile,
  scenario: Scenario,
): DecisionChoice {
  const tone = choiceTone(label);
  const order = index === 0 ? "첫 번째 선택" : "두 번째 선택";
  const supportCue = elementDecisionCue(profile.weakElementType, scenario.category);
  const strengthCue = elementDecisionCue(profile.dominantElementType, scenario.category);

  const flowByCategory: Record<DecisionCategory, Record<string, string>> = {
    love: {
      active: `${order}은 감정을 숨기지 않고 상대의 실제 반응을 보는 선택입니다. 다만 말의 온도보다 약속 이행, 연락 패턴, 태도 변화가 따라오는지 봐야 합니다.`,
      check: `${order}은 관계를 멈추는 선택이 아니라 상대의 반복 행동을 검증하는 선택입니다. 기다림이 아니라 관찰 기준을 세우는 쪽이어야 합니다.`,
      defense: `${order}은 감정 소모를 줄이고 나를 먼저 회복시키는 흐름입니다. 단, 자존심 때문에 닫는 것인지 실제 신뢰가 무너진 것인지는 구분해야 합니다.`,
      balance: `${order}은 감정과 현실의 비율을 다시 맞추는 선택입니다. 지금은 좋아하는 마음보다 이 관계가 생활에서 버틸 수 있는지가 핵심입니다.`,
    },
    money: {
      active: `${order}은 기회를 놓치지 않기 위해 작게 검증하는 선택입니다. 진입보다 중요한 것은 손실 한도, 회수 시점, 추가 투입 금지선입니다.`,
      check: `${order}은 겁이 많아서 늦추는 선택이 아니라 손실 가능 금액을 계산하는 선택입니다. 기준가와 무효 조건이 생기면 기다림도 전략이 됩니다.`,
      defense: `${order}은 현금과 회복력을 지키는 선택입니다. 수익을 포기하는 것이 아니라 다시 들어갈 체력을 남기는 판단입니다.`,
      balance: `${order}은 수익 욕심과 방어선을 동시에 보는 선택입니다. 지금은 맞히는 것보다 틀렸을 때 작게 끝내는 구조가 중요합니다.`,
    },
    career: {
      active: `${order}은 현재 판을 벗어나 새 역할과 보상을 확인하는 선택입니다. 이동 자체보다 새 판에서 권한과 책임이 선명한지가 승부처입니다.`,
      check: `${order}은 머무르는 선택이 아니라 현재 판의 조건을 다시 협상하는 선택입니다. 역할, 보상, 업무 범위 중 하나라도 바뀌어야 의미가 있습니다.`,
      defense: `${order}은 경력 손상을 줄이고 다음 이동을 준비하는 흐름입니다. 단, 버티는 동안 배울 것과 얻을 것이 남아 있어야 합니다.`,
      balance: `${order}은 환경 교체보다 일의 구조를 다시 보는 선택입니다. 지금은 회사 이름보다 실제로 맡을 판이 중요합니다.`,
    },
    general: {
      active: `${order}은 판을 움직여 실제 반응을 빨리 확인하는 흐름입니다. ${profile.dominantElement}의 강점은 살지만, ${scenario.riskTheme}을 기준으로 고정하지 않으면 속도가 리스크가 됩니다.`,
      check: `${order}은 결론을 늦추는 선택이 아니라 조건을 더 선명하게 만드는 흐름입니다. ${profile.weakElement}의 빈틈을 보완하지만, 확인만 반복하면 타이밍을 잃을 수 있습니다.`,
      defense: `${order}은 손실과 감정 소모를 먼저 줄이는 흐름입니다. 지금 흔들리는 에너지를 회복하는 데 유리하지만, 너무 빨리 닫으면 가능성까지 같이 잘릴 수 있습니다.`,
      balance: `${order}은 선택의 방향보다 기준을 다시 세우는 흐름입니다. 지금은 맞고 틀림보다 어떤 조건에서 움직일지가 핵심입니다.`,
    },
  };

  const prosByCategory: Record<DecisionCategory, Record<string, string>> = {
    love: {
      active: `상대가 말이 아니라 행동으로 답하는지 빨리 볼 수 있습니다.`,
      check: `감정에 끌려가는 시간을 줄이고 신뢰를 검증할 수 있습니다.`,
      defense: `소모된 자존감과 생활 리듬을 먼저 회복할 수 있습니다.`,
      balance: `관계의 온도와 현실 조건을 같이 볼 수 있습니다.`,
    },
    money: {
      active: `작은 금액으로 시장 반응을 확인하고 기회감을 살릴 수 있습니다.`,
      check: `손실 한도와 무효 기준이 생겨 충동 매매를 줄입니다.`,
      defense: `현금을 지켜 다음 기회에 다시 움직일 체력을 남깁니다.`,
      balance: `수익 기대와 리스크 관리를 한 장에 놓고 볼 수 있습니다.`,
    },
    career: {
      active: `새 역할, 보상, 성장 가능성을 실제 제안으로 확인할 수 있습니다.`,
      check: `현재 판에서 얻을 수 있는 것을 뽑아낸 뒤 움직일 수 있습니다.`,
      defense: `평판과 수입 공백 리스크를 줄이면서 다음 카드를 준비합니다.`,
      balance: `이동 욕구와 현실 조건을 분리해 볼 수 있습니다.`,
    },
    general: {
      active: `${profile.strength}을 바로 쓰면서 실제 데이터를 얻을 수 있습니다.`,
      check: `판단 기준이 정리되어 같은 고민을 반복할 확률이 줄어듭니다.`,
      defense: `불필요한 손실과 소모를 줄이고 다음 선택을 위한 여유를 확보합니다.`,
      balance: `감정과 현실을 동시에 놓고 볼 수 있어 결정 후 후회가 줄어듭니다.`,
    },
  };

  const consByCategory: Record<DecisionCategory, Record<string, string>> = {
    love: {
      active: `상대 반응이 약한데도 의미를 과하게 부여하면 더 지칩니다.`,
      check: `관찰만 오래 하면 관계의 주도권을 계속 넘겨줄 수 있습니다.`,
      defense: `가능성이 남은 관계까지 자존심으로 닫을 수 있습니다.`,
      balance: `마음을 계산하려 들면 표현 타이밍이 늦어질 수 있습니다.`,
    },
    money: {
      active: `손실 기준 없이 들어가면 판단이 투자에서 도박으로 바뀝니다.`,
      check: `완벽한 타이밍만 기다리면 실제 기회를 놓칠 수 있습니다.`,
      defense: `과하게 방어하면 수익 기회를 전부 남의 것으로 볼 수 있습니다.`,
      balance: `기준을 복잡하게 만들면 실행력이 떨어집니다.`,
    },
    career: {
      active: `조건 확인 없이 이동하면 같은 답답함을 다른 회사에서 반복할 수 있습니다.`,
      check: `협상만 하다가 이동 타이밍과 시장 감각을 잃을 수 있습니다.`,
      defense: `버티는 시간이 길어지면 에너지와 자신감이 먼저 닳습니다.`,
      balance: `너무 많은 조건을 비교하면 결정이 계속 미뤄질 수 있습니다.`,
    },
    general: {
      active: `${profile.risk}이 커지면 후속 대응이 늦어질 수 있습니다.`,
      check: `검증이라는 이름으로 시간을 끌면 선택권이 줄어듭니다.`,
      defense: `안전을 택하는 동안 관계, 기회, 수익 중 하나는 약해질 수 있습니다.`,
      balance: `기준을 너무 많이 세우면 결정 자체가 무거워집니다.`,
    },
  };

  const firstActionByCategory: Record<DecisionCategory, string> = {
    love: tone === "active" ? "상대에게 원하는 행동 하나만 구체적으로 말하세요." : "연락 빈도보다 상대의 반복 행동 3가지를 적어보세요.",
    money: tone === "active" ? "진입 금액, 손실 한도, 회수 시점을 먼저 써놓고 움직이세요." : "오늘은 가격보다 손실 가능 금액부터 계산하세요.",
    career: tone === "active" ? "새 판에서 맡을 역할, 보상, 성장 조건을 문장으로 확인하세요." : "현재 회사에서 바꿀 수 있는 조건 2개를 먼저 협상해보세요.",
    general: tone === "active" ? "48시간 안에 되돌릴 수 있는 작은 실행 하나를 정하세요." : "결정 조건 3개와 포기할 조건 1개를 적으세요.",
  };

  return {
    label,
    expected_flow: `${flowByCategory[scenario.category][tone]} 이 명식은 ${strengthCue}을 살리되, ${supportCue}을 보완해야 결정 후 흔들림이 줄어듭니다.`,
    pros: prosByCategory[scenario.category][tone],
    cons: consByCategory[scenario.category][tone],
    when_to_choose:
      tone === "active"
        ? `${scenario.stake}에 대한 기준과 다음 행동이 이미 정해져 있을 때 맞습니다.`
        : `${scenario.stake}가 아직 흐리거나 확인할 증거가 부족할 때 맞습니다.`,
    first_action: firstActionByCategory[scenario.category],
    watch_signal:
      tone === "active"
        ? `${scenario.stake}를 확인하지 못했는데 마음만 급해지면 기준 없이 움직인 신호입니다.`
        : `확인할수록 ${scenario.stake}의 기준이 선명해지지 않고 항목만 늘어나면 회피로 바뀐 신호입니다.`,
  };
}

function buildRecommendedAction(profile: DecisionProfile, scenario: Scenario) {
  const categoryAction: Record<DecisionCategory, string> = {
    love: "오늘 결론을 요구하기보다, 상대가 반복해서 보여주는 행동 하나를 기준으로 잡으세요. 말이 아니라 일정, 연락, 약속 이행처럼 확인 가능한 행동이어야 합니다.",
    money: "지금은 수익률보다 손실 한도를 먼저 정하세요. 들어간다면 전체 금액이 아니라 잃어도 회복 가능한 금액으로만 테스트하는 쪽이 맞습니다.",
    career: "이동 여부보다 이동 후 역할을 먼저 확인하세요. 직함보다 실제 권한, 보상, 배울 수 있는 범위가 기준입니다.",
    general: "결론을 한 번에 내리지 말고 되돌릴 수 있는 작은 행동으로 반응을 보세요. 이 사주는 기준이 생기면 오래 밀 수 있으니 첫 기준이 중요합니다.",
  };

  return `${categoryAction[scenario.category]} ${urgencyText(scenario.urgency)} ${profile.strategy}`;
}

function buildRiskWarning(profile: DecisionProfile, scenario: Scenario) {
  const categoryWarning: Record<DecisionCategory, string> = {
    love: "관계 판단에서 가장 위험한 것은 상대의 말과 행동이 다른데도 내가 해석으로 메우는 것입니다.",
    money: "돈 판단에서 가장 위험한 것은 손실 한도 없이 확신만 키우는 것입니다.",
    career: "커리어 판단에서 가장 위험한 것은 회사 이름이나 감정 피로만 보고 실제 역할 조건을 놓치는 것입니다.",
    general: "선택 판단에서 가장 위험한 것은 기준을 정하기 전에 마음의 불안을 결론처럼 믿는 것입니다.",
  };

  return `${categoryWarning[scenario.category]} 지금은 ${scenario.riskTheme}을 흐린 채 감정으로 보정하면 안 됩니다. 특히 ${profile.blindSpot}이 올라오면, 맞는 선택도 늦어지거나 과하게 커질 수 있습니다.`;
}

function buildOneLineGuide(scenario: Scenario) {
  if (scenario.category === "love") return "말보다 반복 행동을 봐라";
  if (scenario.category === "money") return "수익보다 손실 기준이 먼저다";
  if (scenario.category === "career") return "이동보다 맡을 판을 봐라";
  return "확신보다 기준으로 움직여라";
}

export function buildDecisionCoachResult(
  analysis: SajuAnalysis,
  question: string,
  categoryInput?: DecisionCategory,
): DecisionCoachResult {
  const category = inferDecisionCategory(question, categoryInput);
  const scenario = buildScenario(question, category);
  const profile = buildDecisionProfile(analysis, category);
  const choices = scenario.choices.map((label, index) => buildChoice(label, index, profile, scenario));

  return {
    decision_basis: `${profile.characterType} / 강점: ${profile.dominantElement} / 보완점: ${profile.weakElement}`,
    situation:
      `지금 질문은 "${scenario.question}"입니다. 이건 ${scenario.intent}이고, 핵심 변수는 ${scenario.stake}입니다. 현재 흐름은 ${scenario.tension}입니다. ` +
      `${profile.categoryInsight} ${profile.decisionStyle}`,
    choices,
    recommended_action: buildRecommendedAction(profile, scenario),
    risk_warning: buildRiskWarning(profile, scenario),
    avoid_action:
      "지금 가장 피해야 할 행동은 불안해서 기준을 바꾸는 것입니다. 결정을 바꾸더라도 기준까지 같이 바꾸면 다음 선택도 같은 자리로 돌아옵니다.",
    one_line_guide: buildOneLineGuide(scenario),
    closing_message:
      "다음 선택이 바뀌면 다시 물어봐라\n같은 사주라도 상황이 바뀌면 답은 달라진다",
  };
}
