import { SajuAnalysis, SajuResultCard } from '../types/saju';

export const generateResultCards = (analysis: SajuAnalysis): SajuResultCard[] => {
  const dayMasterProfile = analysis.day_master_profile ?? {
    core: analysis.summary,
    strength: analysis.personality_keywords.join(", ") || "자기 구조를 읽는 힘",
    risk: "과한 패턴이 반복될 수 있음",
    strategy: "반복되는 선택 패턴을 관찰하면 균형을 잡기 쉽습니다.",
  };
  const elementProfile = analysis.element_profile ?? {
    balance_score: 70,
    summary: "오행 분포를 기준으로 구조를 해석했습니다.",
    recommendation: "강한 기운은 활용하고 부족한 기운은 생활 루틴에서 보완하는 흐름이 좋습니다.",
  };
  const confidenceNote =
    analysis.confidence_note ??
    (analysis.time_known
      ? "태어난 시간이 입력되어 시주까지 포함한 분석입니다."
      : "태어난 시간이 없어 시주는 추정하지 않았습니다.");

  return [
    {
      title: "나의 본질적 키워드",
      content: `${analysis.type_name}: ${dayMasterProfile.core}`,
      tag: "정체성"
    },
    {
      title: "오행 밸런스",
      content: `${elementProfile.balance_score}점. ${elementProfile.summary}`,
      tag: "구조분석"
    },
    {
      title: "행동의 나침반",
      content: `${dayMasterProfile.strength} 단, ${dayMasterProfile.risk}`,
      tag: "행동패턴"
    },
    {
      title: "사람들 사이의 나",
      content: `${analysis.relationship_style} ${dayMasterProfile.strategy}`,
      tag: "인간관계"
    },
    {
      title: "뼈아픈 한 마디",
      content: `${analysis.viral_sentences.painful_truth} ${elementProfile.recommendation}`,
      tag: "팩트폭격"
    },
    {
      title: "앞으로의 흐름",
      content: `${analysis.money_style} ${analysis.timing_flow} ${confidenceNote}`,
      tag: "미래가치"
    }
  ];
};
