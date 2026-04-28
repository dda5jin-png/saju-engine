import {
  DecisionCategory,
  DecisionChoice,
  DecisionCoachResult,
  SajuAnalysis,
} from "@/types/saju";

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

export function inferDecisionCategory(question: string, category?: DecisionCategory): DecisionCategory {
  if (category && category !== "general") return category;

  if (includesAny(question, ["연애", "사랑", "상대", "관계", "이별", "재회", "고백", "결혼"])) {
    return "love";
  }

  if (includesAny(question, ["돈", "투자", "주식", "코인", "매수", "매도", "부동산", "대출"])) {
    return "money";
  }

  if (includesAny(question, ["이직", "퇴사", "커리어", "회사", "직장", "창업", "면접", "일"])) {
    return "career";
  }

  return "general";
}

function getCharacterType(analysis: SajuAnalysis) {
  return analysis.viral_character?.character_type ?? analysis.type_name;
}

function getDecisionBase(analysis: SajuAnalysis) {
  return analysis.viral_character?.decision_style ?? analysis.detailed_reading?.work_style ?? analysis.summary;
}

function buildChoices(category: DecisionCategory): DecisionChoice[] {
  if (category === "love") {
    return [
      {
        label: "유지하며 확인한다",
        expected_flow: "감정은 남겨두되, 상대의 행동이 실제로 바뀌는지 2주 정도 관찰하는 흐름입니다.",
        pros: "성급한 종료를 피하고 관계의 실제 가능성을 확인할 수 있습니다.",
        cons: "기대가 커지면 같은 실망을 한 번 더 반복할 수 있습니다.",
      },
      {
        label: "거리를 두고 판단한다",
        expected_flow: "연락 빈도와 감정 투입을 낮춰 내 기준이 흐려지는지부터 확인합니다.",
        pros: "상대보다 내 감정 회복과 현실 판단이 먼저 살아납니다.",
        cons: "상대가 소극적인 타입이면 관계가 더 멀어질 수 있습니다.",
      },
    ];
  }

  if (category === "money") {
    return [
      {
        label: "공격적으로 들어간다",
        expected_flow: "기회가 맞다고 판단되면 빠르게 포지션을 잡지만, 손실 기준 없이는 흔들릴 수 있습니다.",
        pros: "상승 구간을 놓치지 않고 경험치를 빨리 얻을 수 있습니다.",
        cons: "감정이 앞서면 손절이 늦어지고, 추가 매수로 리스크가 커질 수 있습니다.",
      },
      {
        label: "방어적으로 관찰한다",
        expected_flow: "현금을 남기고 조건이 더 명확해질 때까지 진입 규모를 줄입니다.",
        pros: "큰 손실을 피하고 다음 기회를 볼 여유가 생깁니다.",
        cons: "좋은 타이밍을 놓쳤다는 불안이 생길 수 있습니다.",
      },
    ];
  }

  if (category === "career") {
    return [
      {
        label: "이동한다",
        expected_flow: "현재의 답답함을 끊고 새 환경에서 역할과 보상을 다시 설계합니다.",
        pros: "정체감을 깨고 더 맞는 판을 찾을 가능성이 생깁니다.",
        cons: "준비 없이 움직이면 같은 패턴을 다른 회사에서 반복할 수 있습니다.",
      },
      {
        label: "유지하며 조건을 바꾼다",
        expected_flow: "퇴사보다 먼저 업무 범위, 보상, 팀 내 역할을 조정해봅니다.",
        pros: "리스크를 줄이면서 현재 판에서 얻을 수 있는 것을 더 뽑아낼 수 있습니다.",
        cons: "조정이 실패하면 시간만 늦어질 수 있습니다.",
      },
    ];
  }

  return [
    {
      label: "지금 실행한다",
      expected_flow: "완벽한 확신보다 작은 행동으로 상황의 반응을 먼저 확인합니다.",
      pros: "생각이 길어지는 패턴을 끊고 실제 데이터를 얻습니다.",
      cons: "기준 없이 움직이면 후회가 남을 수 있습니다.",
    },
    {
      label: "조건을 더 확인한다",
      expected_flow: "핵심 변수 2~3개를 더 확인한 뒤 결정합니다.",
      pros: "불필요한 리스크를 줄이고 결정의 근거가 선명해집니다.",
      cons: "확인만 반복하면 타이밍을 놓칠 수 있습니다.",
    },
  ];
}

export function buildDecisionCoachResult(
  analysis: SajuAnalysis,
  question: string,
  categoryInput?: DecisionCategory,
): DecisionCoachResult {
  const category = inferDecisionCategory(question, categoryInput);
  const characterType = getCharacterType(analysis);
  const decisionBase = getDecisionBase(analysis);
  const choices = buildChoices(category);

  const categoryGuide: Record<DecisionCategory, string> = {
    love: "관계는 감정만으로 밀면 흐려지고, 현실만 보면 차가워집니다. 지금은 상대의 말보다 반복 행동을 기준으로 봐야 합니다.",
    money: "돈 판단은 확신보다 기준이 먼저입니다. 진입가, 손실 한도, 보유 기간이 없으면 좋은 감도 흔들립니다.",
    career: "커리어 판단은 이동 자체보다 이동 후 맡을 역할이 중요합니다. 판을 바꾸기 전에 내가 얻을 조건을 먼저 써야 합니다.",
    general: "지금 질문은 선택의 옳고 그름보다 실행 기준이 핵심입니다. 이 사주는 확신이 생기면 오래 밀지만, 기준이 흐리면 시작이 늦어집니다.",
  };

  return {
    situation: `${characterType} 기준으로 보면, 지금 질문은 "${question}"에 대한 감정 반응보다 선택 기준을 세우는 문제입니다. ${categoryGuide[category]} ${decisionBase}`,
    choices,
    recommended_action:
      "오늘 바로 결론을 내리기보다, 선택지별로 잃을 것과 얻을 것을 숫자나 행동 기준으로 적으세요. 그 다음 48시간 안에 가장 작은 행동 하나를 실행하는 쪽이 맞습니다.",
    risk_warning:
      "가장 큰 리스크는 마음이 흔들릴 때 기준을 바꾸는 것입니다. 기준이 바뀌면 같은 선택도 전혀 다른 결과가 됩니다.",
    one_line_guide: "확신이 아니라 기준으로 움직여라.",
    closing_message:
      "다음 선택이 바뀌면 다시 물어봐라\n같은 사주라도 상황이 바뀌면 답은 달라진다",
  };
}
