import { ElementDistribution } from '@/types/saju';

export interface SajuRule {
  rule_id: string;
  condition: (e: ElementDistribution) => boolean;
  interpretation: {
    personality: string;
    strength: string;
    weakness: string;
    decision_style: string;
    relationship_style: string;
    money_style: string;
  };
  content: {
    one_line_identity: string;
    pain_point: string;
    share_sentence: string;
  };
}

export const sajuRules: SajuRule[] = [
  {
    rule_id: "WOOD_HIGH",
    condition: (e) => e.wood >= 4,
    interpretation: {
      personality: "확장 지향적이며 실행력이 빠른 구조",
      strength: "기회 포착 능력",
      weakness: "과도한 확장",
      decision_style: "빠른 판단, 낮은 정리력",
      relationship_style: "넓지만 얕은 관계",
      money_style: "성장형 투자 선호"
    },
    content: {
      one_line_identity: "당신은 끊임없이 기회를 넓히는 설계자입니다",
      pain_point: "벌려놓은 일은 많으나 수습할 에너지가 부족합니다.",
      share_sentence: "나는 시작은 1등인데 끝맺음은 꼴찌다"
    }
  },
  {
    rule_id: "METAL_LOW",
    condition: (e) => e.metal <= 1,
    interpretation: {
      personality: "결단 기준이 약한 구조",
      strength: "탁월한 유연함",
      weakness: "만성적인 결정 지연",
      decision_style: "타이밍이 항상 늦음",
      relationship_style: "모두에게 맞추려다 지치는 관계",
      money_style: "손절 타이밍을 놓치는 투자"
    },
    content: {
      one_line_identity: "당신은 항상 결정을 마지막까지 미루는 타입입니다",
      pain_point: "자신의 선택에 대한 확신이 늦어 기회를 놓칩니다.",
      share_sentence: "나는 고민만 하다가 버스를 놓친다"
    }
  },
  {
    rule_id: "FIRE_HIGH",
    condition: (e) => e.fire >= 4,
    interpretation: {
      personality: "에너지가 밖으로 분출되는 화끈한 구조",
      strength: "폭발적인 몰입력",
      weakness: "감정 조절의 어려움",
      decision_style: "직관적이고 즉흥적",
      relationship_style: "화끈하지만 쉽게 식는 관계",
      money_style: "충동적 지출과 화끈한 베팅"
    },
    content: {
      one_line_identity: "당신은 온몸으로 에너지를 내뿜는 태양 같은 사람입니다",
      pain_point: "감정이 앞서 논리적인 판단을 그르칠 때가 많습니다.",
      share_sentence: "내 기분이 곧 내 인생의 나침반이다"
    }
  },
  {
    rule_id: "WATER_HIGH",
    condition: (e) => e.water >= 4,
    interpretation: {
      personality: "생각의 깊이가 끝이 없는 깊은 바다 구조",
      strength: "치밀한 통찰력",
      weakness: "실행력 저하와 우울감",
      decision_style: "지나친 시뮬레이션",
      relationship_style: "속을 알 수 없는 신비주의",
      money_style: "장기적이고 정보 기반의 자산 관리"
    },
    content: {
      one_line_identity: "당신은 겉으론 고요하나 속으론 수만 번 시뮬레이션하는 전략가입니다",
      pain_point: "생각이 너무 많아 몸이 움직이기까지 시간이 너무 오래 걸립니다.",
      share_sentence: "나는 머릿속으로 이미 우주 정복까지 마쳤다"
    }
  }
];
