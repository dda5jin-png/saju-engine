import { SajuAnalysis, SajuResultCard } from '../types/saju';

export const generateResultCards = (analysis: SajuAnalysis): SajuResultCard[] => {
  return [
    {
      title: "나의 본질적 키워드",
      content: analysis.summary,
      tag: "정체성"
    },
    {
      title: "내가 몰랐던 내 모습",
      content: analysis.viral_sentences.self_realization,
      tag: "심층분석"
    },
    {
      title: "행동의 나침반",
      content: `당신은 ${analysis.personality_keywords.join(", ")} 성향을 바탕으로 행동합니다.`,
      tag: "행동패턴"
    },
    {
      title: "사람들 사이의 나",
      content: analysis.relationship_style,
      tag: "인간관계"
    },
    {
      title: "뼈아픈 한 마디",
      content: analysis.viral_sentences.painful_truth,
      tag: "팩트폭격"
    },
    {
      title: "앞으로의 흐름",
      content: `${analysis.money_style} ${analysis.timing_flow}`,
      tag: "미래가치"
    }
  ];
};
