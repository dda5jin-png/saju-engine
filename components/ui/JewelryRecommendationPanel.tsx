'use client';

import { Gem, Sparkles } from 'lucide-react';
import { ElementType, JewelryRecommendation, SajuAnalysis } from '@/types/saju';

interface Props {
  analysis: SajuAnalysis;
}

const elementLabels: Record<ElementType, string> = {
  wood: '목',
  fire: '화',
  earth: '토',
  metal: '금',
  water: '수',
};

const elementOrder: ElementType[] = ['wood', 'fire', 'earth', 'metal', 'water'];

const jewelryMatching: Record<ElementType, {
  meaning: string;
  gems: string[];
  metals: string[];
  shapes: string[];
  jewelry: string;
  tone: string;
}> = {
  wood: {
    meaning: '성장, 확장, 시작',
    gems: ['에메랄드', '페리도트'],
    metals: ['화이트골드', '옐로우골드'],
    shapes: ['길쭉한 형태'],
    jewelry: '그린 스톤 펜던트',
    tone: '그린, 새싹색, 브러시드 골드',
  },
  fire: {
    meaning: '추진력, 행동력, 표현',
    gems: ['루비', '가넷'],
    metals: ['옐로우골드', '핑크골드'],
    shapes: ['날카롭고 역동적인 컷'],
    jewelry: '레드 스톤 링',
    tone: '레드, 핑크, 로즈골드',
  },
  earth: {
    meaning: '안정, 재물, 기반',
    gems: ['시트린', '타이거아이'],
    metals: ['순금', '옐로우골드'],
    shapes: ['둥근 형태'],
    jewelry: '골드 브레이슬릿',
    tone: '브라운, 옐로우, 순금',
  },
  metal: {
    meaning: '결단력, 통제, 구조',
    gems: ['다이아몬드', '화이트 사파이어'],
    metals: ['화이트골드', '플래티넘'],
    shapes: ['각진 컷'],
    jewelry: '화이트 메탈 링',
    tone: '화이트, 실버, 플래티넘',
  },
  water: {
    meaning: '흐름, 지혜, 관계',
    gems: ['아쿠아마린', '블루 사파이어'],
    metals: ['화이트골드', '실버'],
    shapes: ['물방울형'],
    jewelry: '블루 스톤 네크리스',
    tone: '블루, 블랙, 화이트 메탈',
  },
};

function classifyElementStates(analysis: SajuAnalysis) {
  const distribution = analysis.element_distribution;
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  const lowCut = total >= 8 ? 1 : 0;
  const highCut = total >= 8 ? 3 : 2;

  return elementOrder.reduce(
    (states, element) => {
      const count = distribution[element];
      states[element] = count <= lowCut ? '부족' : count >= highCut ? '과다' : '적정';
      return states;
    },
    {} as Record<ElementType, '부족' | '적정' | '과다'>,
  );
}

function getClientSupportElement(analysis: SajuAnalysis) {
  const distribution = analysis.element_distribution;
  const weakest = [...elementOrder].sort((a, b) => distribution[a] - distribution[b])[0];
  return analysis.element_profile?.missing?.[0] ?? analysis.element_profile?.weak?.[0] ?? weakest ?? 'water';
}

function getClientAvoidElement(analysis: SajuAnalysis, supportElement: ElementType) {
  const distribution = analysis.element_distribution;
  return (
    analysis.element_profile?.dominant?.find((element) => element !== supportElement) ??
    [...elementOrder].sort((a, b) => distribution[b] - distribution[a])[0] ??
    supportElement
  );
}

function buildClientJewelryReport(analysis: SajuAnalysis): JewelryRecommendation {
  const supportElement = getClientSupportElement(analysis);
  const avoidElement = getClientAvoidElement(analysis, supportElement);
  const match = jewelryMatching[supportElement];
  const options = match.gems.map((gemstone, index) => ({
    gemstone,
    reason:
      index === 0
        ? `${elementLabels[supportElement]}은 ${match.meaning}의 에너지입니다. 현재 구조에서 이 기운을 보완해야 하므로 ${gemstone}이 가장 직접적인 상징이 됩니다.`
        : `${gemstone}은 같은 ${elementLabels[supportElement]} 계열을 일상적으로 쓰기 좋은 대안입니다. 부담이 적어 매일 착용하기 좋습니다.`,
    metal: match.metals[index % match.metals.length],
    shape: match.shapes[0],
  }));

  return {
    support_element: supportElement,
    element_label: elementLabels[supportElement],
    gemstone: options.map((option) => option.gemstone).join(' 또는 '),
    jewelry: match.jewelry,
    tone: match.tone,
    reason: `${elementLabels[supportElement]} 기운을 보완하는 착용 전략입니다.`,
    styling_tip: `${options[0].metal} ${options[0].gemstone}를 작은 포인트로 쓰는 편이 가장 단정합니다.`,
    element_states: classifyElementStates(analysis),
    needed_element: supportElement,
    avoid_element: avoidElement,
    needed_element_label: elementLabels[supportElement],
    avoid_element_label: elementLabels[avoidElement],
    recommendations: options,
    practical_strategy: {
      love: `${elementLabels[supportElement]} 기운을 보완하는 보석은 관계에서 부족한 태도를 의식하게 만드는 장치입니다.`,
      money: `계약·결제·투자처럼 숫자를 다루는 날에는 손에 보이는 반지나 팔찌가 가장 실용적입니다.`,
      business: `업무 확장 상황에서는 과한 장식보다 매일 반복 착용 가능한 디자인이 신뢰감을 만듭니다.`,
      relationship: `목걸이는 인상을 부드럽게, 팔찌는 행동의 리듬을 안정시키는 쪽으로 쓰세요.`,
    },
    wearing_guide: {
      ring: `${options[0].metal} ${options[0].gemstone} 반지는 결정을 내려야 하는 날에 가장 적합합니다.`,
      necklace: `${options[1]?.gemstone ?? options[0].gemstone} 목걸이는 대화, 연애, 인간관계처럼 인상이 중요한 상황에 맞습니다.`,
      bracelet: `${match.metals[match.metals.length - 1]} 팔찌는 돈, 일정, 업무처럼 반복 관리가 필요한 날에 좋습니다.`,
    },
    scenario_summary: `중요한 결정이나 도전 상황에서는 ${options[0].metal} ${options[0].gemstone} 반지를 착용하는 것이 가장 효과적입니다.`,
  };
}

const fallbackJewelry = (analysis: SajuAnalysis): JewelryRecommendation => {
  const supportElement = analysis.element_profile?.missing?.[0] ?? analysis.element_profile?.weak?.[0] ?? 'water';

  return {
    support_element: supportElement,
    element_label: elementLabels[supportElement],
    gemstone: '아쿠아마린 또는 블루 토파즈',
    jewelry: '블루 스톤 네크리스',
    tone: '아이스 블루, 딥 네이비, 화이트 메탈',
    reason: '오행 보완을 시각적 상징으로 옮긴 추천입니다. 효능을 단정하기보다, 부족한 기운을 기억하게 만드는 스타일 장치로 보세요.',
    styling_tip: '작고 선명한 포인트 하나가 전체 인상을 가장 깔끔하게 정리합니다.',
  };
};

function statusClass(status?: string) {
  if (status === '부족') return 'border-sky-200/25 bg-sky-200/10 text-sky-50';
  if (status === '과다') return 'border-amber-200/25 bg-amber-200/10 text-amber-50';
  return 'border-white/10 bg-white/[0.045] text-white/62';
}

export default function JewelryRecommendationPanel({ analysis }: Props) {
  const jewelry =
    analysis.jewelry_recommendation?.recommendations && analysis.jewelry_recommendation.recommendations.length >= 2
      ? analysis.jewelry_recommendation
      : buildClientJewelryReport(analysis) ?? fallbackJewelry(analysis);
  const recommendations = jewelry.recommendations ?? [
    {
      gemstone: jewelry.gemstone,
      reason: jewelry.reason,
      metal: jewelry.tone,
      shape: jewelry.jewelry,
    },
  ];

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04)_48%,rgba(250,204,21,0.08))] p-5 shadow-2xl md:p-6">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-yellow-100/30 bg-yellow-100/12 text-yellow-50">
            <Gem size={23} />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-black text-white/72">
                <Sparkles size={13} />
                PERSONAL JEWELRY REPORT
              </span>
              <span className="rounded-full bg-yellow-100/12 px-3 py-1 text-[11px] font-extrabold text-yellow-50">
                {jewelry.needed_element_label ?? jewelry.element_label} 보완
              </span>
            </div>
            <h2 className="text-xl font-black leading-tight text-white md:text-2xl">
              나에게 맞는 보석과 주얼리
            </h2>
            <p className="break-keep text-sm leading-6 text-white/58">
              사주 원문을 다시 설명하지 않고, 부족한 오행을 착용 전략으로 바꾼 큐레이션입니다.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-black text-white/88">오행 분석</h3>
          <div className="grid grid-cols-5 gap-2">
            {elementOrder.map((element) => {
              const status = jewelry.element_states?.[element] ?? '적정';
              return (
                <div key={element} className={`rounded-2xl border px-2 py-3 text-center ${statusClass(status)}`}>
                  <p className="text-[11px] font-black">{elementLabels[element]}</p>
                  <p className="mt-1 text-xs font-extrabold">{status}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200/20 bg-emerald-200/10 p-4">
            <p className="text-[11px] font-black text-emerald-50/70">용신</p>
            <p className="mt-2 text-lg font-black text-white">
              {jewelry.needed_element_label ?? jewelry.element_label}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/62">가장 의식적으로 보완해야 할 에너지입니다.</p>
          </div>
          <div className="rounded-2xl border border-red-200/15 bg-red-200/8 p-4">
            <p className="text-[11px] font-black text-red-50/70">기신</p>
            <p className="mt-2 text-lg font-black text-white">
              {jewelry.avoid_element_label ?? '과다 기운'}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/62">이미 강하거나 과해질 수 있어 더 키우지 않는 편이 좋습니다.</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-black text-white/88">맞춤 보석 추천</h3>
          <div className="grid gap-3">
            {recommendations.slice(0, 3).map((item) => (
              <article key={item.gemstone} className="rounded-3xl border border-white/10 bg-black/24 p-5">
                <h4 className="text-lg font-black text-white">{item.gemstone}</h4>
                <dl className="mt-4 space-y-3 text-sm leading-6 text-white/64">
                  <div>
                    <dt className="font-extrabold text-white/84">이유</dt>
                    <dd className="break-keep">{item.reason}</dd>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="font-extrabold text-white/84">추천 금속</dt>
                      <dd>{item.metal}</dd>
                    </div>
                    <div>
                      <dt className="font-extrabold text-white/84">추천 형태</dt>
                      <dd>{item.shape}</dd>
                    </div>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>

        {jewelry.practical_strategy && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-white/88">실전 활용 전략</h3>
            <div className="grid gap-2 text-sm leading-6 text-white/64 sm:grid-cols-2">
              <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 break-keep">
                <b className="text-white/88">연애:</b> {jewelry.practical_strategy.love}
              </p>
              <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 break-keep">
                <b className="text-white/88">재물:</b> {jewelry.practical_strategy.money}
              </p>
              <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 break-keep">
                <b className="text-white/88">사업:</b> {jewelry.practical_strategy.business}
              </p>
              <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 break-keep">
                <b className="text-white/88">인간관계:</b> {jewelry.practical_strategy.relationship}
              </p>
            </div>
          </div>
        )}

        {jewelry.wearing_guide && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-white/88">착용 가이드</h3>
            <div className="space-y-2 text-sm leading-6 text-white/64">
              <p className="rounded-2xl border border-white/10 bg-black/22 p-4 break-keep">
                <b className="text-white/88">반지:</b> {jewelry.wearing_guide.ring}
              </p>
              <p className="rounded-2xl border border-white/10 bg-black/22 p-4 break-keep">
                <b className="text-white/88">목걸이:</b> {jewelry.wearing_guide.necklace}
              </p>
              <p className="rounded-2xl border border-white/10 bg-black/22 p-4 break-keep">
                <b className="text-white/88">팔찌:</b> {jewelry.wearing_guide.bracelet}
              </p>
            </div>
          </div>
        )}

        <div className="rounded-3xl bg-white p-5 text-center text-black">
          <p className="text-[11px] font-black text-black/42">WEARING SCENARIO</p>
          <p className="mt-2 break-keep text-lg font-black leading-7">
            {jewelry.scenario_summary ?? jewelry.styling_tip}
          </p>
        </div>

        <p className="break-keep text-xs font-bold leading-5 text-white/38">
          보석 추천은 명리학적 상징과 스타일 큐레이션을 결합한 참고 정보이며, 의학적·재정적 효능을 보장하지 않습니다.
        </p>
      </div>
    </section>
  );
}
