'use client';

import { Gem, Sparkles } from 'lucide-react';
import { ElementType, JewelryRecommendation, SajuAnalysis } from '@/types/saju';
import { fiveElements } from '@/src/data/fiveElements';
import { recommendJewelry } from '@/src/utils/recommendJewelry';

interface Props {
  analysis: SajuAnalysis;
}

type DictionaryJewelryOption = NonNullable<JewelryRecommendation['recommendations']>[number];

const elementOrder: ElementType[] = ['wood', 'fire', 'earth', 'metal', 'water'];

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

function buildDictionaryJewelryReport(analysis: SajuAnalysis): JewelryRecommendation {
  const supportElement = getClientSupportElement(analysis);
  const avoidElement = getClientAvoidElement(analysis, supportElement);
  const report = recommendJewelry(analysis.element_distribution, { supportElement, strongElement: avoidElement });
  const recommendations = report.summaryGems.map((gem: {
    name: string;
    displayElement: string;
    reason: string;
    keywords?: string[];
    situations?: string[];
    stylingTip?: string;
  }) => ({
    gemstone: gem.name,
    element: gem.displayElement,
    reason: gem.reason,
    metal: report.primaryMetal.name,
    shape: report.primaryForm.name,
    keywords: gem.keywords ?? [],
    situations: gem.situations ?? [],
    styling_tip: gem.stylingTip,
  }));
  const primary = recommendations[0];

  return {
    support_element: supportElement,
    element_label: report.supportElementInfo?.display ?? fiveElements.water.display,
    gemstone: recommendations.map((option: DictionaryJewelryOption) => option.gemstone).join(' 또는 '),
    jewelry: `${report.primaryMetal.name} ${report.primaryForm.name}`,
    tone: report.primaryMetal.name,
    reason: `${report.supportElementInfo?.display ?? '수(水)'}의 흐름을 상징과 스타일링 관점에서 보완하는 주얼리 제안입니다.`,
    styling_tip: primary?.styling_tip ?? `${report.primaryMetal.name} ${report.primaryGem.name}을 작은 포인트로 쓰면 차분하고 정돈된 인상을 만들기 좋습니다.`,
    element_states: report.elementStates as JewelryRecommendation['element_states'],
    needed_element: supportElement,
    avoid_element: avoidElement,
    needed_element_label: report.supportElementInfo?.display ?? fiveElements.water.display,
    avoid_element_label: report.strongElementInfo?.display ?? fiveElements.earth.display,
    recommendations,
    practical_strategy: {
      love: `${report.supportElementInfo?.display ?? '수(水)'}의 상징을 담은 보석은 관계에서 필요한 태도를 떠올리는 스타일링 장치로 활용할 수 있습니다.`,
      money: '계약·결제·투자처럼 숫자를 다루는 날에는 손에 보이는 반지나 팔찌가 실용적입니다.',
      business: '업무 확장 상황에서는 과한 장식보다 매일 반복 착용 가능한 디자인이 신뢰감을 만듭니다.',
      relationship: '목걸이는 인상을 부드럽게, 팔찌는 행동의 리듬을 차분하게 보이게 합니다.',
    },
    wearing_guide: {
      ring: `${report.primaryMetal.name} ${report.primaryGem.name} 반지는 결정, 계약, 미팅처럼 손의 움직임이 보이는 날에 잘 어울립니다.`,
      necklace: `${recommendations[1]?.gemstone ?? report.primaryGem.name} 목걸이는 얼굴 주변을 밝게 만들어 첫인상과 대화 상황에 어울립니다.`,
      bracelet: `${report.primaryMetal.name} 팔찌는 일상에서 가볍게 분위기를 바꾸고 싶을 때 추천할 수 있습니다.`,
    },
    scenario_summary: `중요한 결정을 앞둔 날에는 ${primary?.metal ?? report.primaryMetal.name} ${primary?.gemstone ?? report.primaryGem.name} 반지나 ${primary?.shape ?? report.primaryForm.name}처럼 맑고 절제된 조합이 잘 어울립니다.`,
  };
}

function normalizeJewelry(analysis: SajuAnalysis) {
  const dictionaryReport = buildDictionaryJewelryReport(analysis);
  const current = analysis.jewelry_recommendation;

  if (!current?.recommendations || current.recommendations.length < 2) {
    return dictionaryReport;
  }

  return {
    ...dictionaryReport,
    ...current,
    element_label: current.element_label?.includes('(') ? current.element_label : dictionaryReport.element_label,
    needed_element_label: current.needed_element_label?.includes('(') ? current.needed_element_label : dictionaryReport.needed_element_label,
    avoid_element_label: current.avoid_element_label?.includes('(') ? current.avoid_element_label : dictionaryReport.avoid_element_label,
    recommendations: dictionaryReport.recommendations,
    element_states: dictionaryReport.element_states,
    reason: dictionaryReport.reason,
    styling_tip: dictionaryReport.styling_tip,
    wearing_guide: dictionaryReport.wearing_guide,
    scenario_summary: dictionaryReport.scenario_summary,
  };
}

export default function JewelryRecommendationPanel({ analysis }: Props) {
  const jewelry = normalizeJewelry(analysis);
  const recommendations = jewelry.recommendations ?? [];

  return (
    <section id="jewelry-guide" className="scroll-mt-24 overflow-hidden rounded-[1.75rem] border border-[color:var(--result-border-strong)] bg-[var(--result-surface)] p-5 shadow-2xl md:p-6">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--result-gold-border)] bg-[var(--result-gold-soft)] text-[var(--result-gold-text)]">
            <Gem size={23} />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--result-border)] bg-[var(--result-card)] px-3 py-1 text-[11px] font-black text-[color:var(--result-muted)]">
                <Sparkles size={13} />
                04 · 착용 가이드
              </span>
              <span className="rounded-full border border-[color:var(--result-gold-border)] bg-[var(--result-gold-soft)] px-3 py-1 text-[11px] font-extrabold text-[var(--result-gold-text)]">
                {jewelry.needed_element_label ?? jewelry.element_label} 보완
              </span>
            </div>
            <h2 className="text-xl font-black leading-tight text-[var(--result-text)] md:text-2xl">
              보석과 주얼리 추천
            </h2>
            <p className="break-keep text-sm leading-6 text-[color:var(--result-muted)]">
              오행 해석을 실제 보석, 금속, 착용 형태로 연결한 스타일 큐레이션입니다.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-[color:var(--result-gold-border)] bg-[var(--result-gold-soft)] p-5">
          <p className="text-[11px] font-black tracking-[0.14em] text-[var(--result-gold-text)]">BEST 착용 아이템</p>
          <h3 className="mt-2 text-xl font-black text-[var(--result-text)]">{jewelry.jewelry}</h3>
          <p className="mt-4 break-keep text-sm font-bold leading-6 text-[color:var(--result-muted)]">
            {jewelry.styling_tip}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-black text-[var(--result-text)]">맞춤 보석 추천</h3>
          <div className="grid gap-3">
            {recommendations.slice(0, 3).map((item) => (
              <article key={item.gemstone} className="rounded-3xl border border-[color:var(--result-border)] bg-[var(--result-card)] p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-lg font-black text-[var(--result-text)]">{item.gemstone}</h4>
                  {item.element && <span className="text-xs font-bold text-[color:var(--result-faint)]">{item.element}</span>}
                </div>
                <dl className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--result-muted)]">
                  <div>
                    <dt className="font-extrabold text-[var(--result-text)]">추천 이유</dt>
                    <dd className="break-keep">{item.reason}</dd>
                  </div>
                  {item.situations && item.situations.length > 0 && (
                    <div>
                      <dt className="font-extrabold text-[var(--result-text)]">어울리는 상황</dt>
                      <dd>{item.situations.slice(0, 4).join(', ')}</dd>
                    </div>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="font-extrabold text-[var(--result-text)]">추천 금속</dt>
                      <dd>{item.metal}</dd>
                    </div>
                    <div>
                      <dt className="font-extrabold text-[var(--result-text)]">추천 형태</dt>
                      <dd>{item.shape}</dd>
                    </div>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>

        {jewelry.wearing_guide && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-[var(--result-text)]">착용 가이드</h3>
            <div className="space-y-2 text-sm leading-6 text-[color:var(--result-muted)]">
              <p className="break-keep rounded-2xl border border-[color:var(--result-border)] bg-[var(--result-card)] p-4">
                <b className="text-[var(--result-text)]">반지:</b> {jewelry.wearing_guide.ring}
              </p>
              <p className="break-keep rounded-2xl border border-[color:var(--result-border)] bg-[var(--result-card)] p-4">
                <b className="text-[var(--result-text)]">목걸이:</b> {jewelry.wearing_guide.necklace}
              </p>
              <p className="break-keep rounded-2xl border border-[color:var(--result-border)] bg-[var(--result-card)] p-4">
                <b className="text-[var(--result-text)]">팔찌:</b> {jewelry.wearing_guide.bracelet}
              </p>
            </div>
          </div>
        )}

        <p className="break-keep text-xs font-bold leading-5 text-[color:var(--result-faint)]">
          보석 추천은 명리학적 상징과 스타일 큐레이션을 결합한 참고 정보이며, 의학적·법률적·재정적 효능을 보장하지 않습니다.
        </p>
      </div>
    </section>
  );
}
