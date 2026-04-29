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

export default function JewelryRecommendationPanel({ analysis }: Props) {
  const jewelry = analysis.jewelry_recommendation ?? fallbackJewelry(analysis);

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.11),rgba(255,255,255,0.035)_46%,rgba(45,212,191,0.08))] p-5 shadow-2xl md:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/30 bg-cyan-200/12 text-cyan-100">
          <Gem size={23} />
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-black text-white/72">
                <Sparkles size={13} />
                PERSONAL JEWELRY
              </span>
              <span className="rounded-full bg-cyan-200/12 px-3 py-1 text-[11px] font-extrabold text-cyan-100">
                {jewelry.element_label} 보완
              </span>
            </div>
            <h2 className="text-xl font-black leading-tight text-white md:text-2xl">
              나에게 맞는 보석과 주얼리
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/22 p-4">
              <p className="text-[11px] font-black text-white/42">GEMSTONE</p>
              <p className="mt-2 text-lg font-black leading-snug text-white">{jewelry.gemstone}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/22 p-4">
              <p className="text-[11px] font-black text-white/42">JEWELRY</p>
              <p className="mt-2 text-lg font-black leading-snug text-white">{jewelry.jewelry}</p>
            </div>
          </div>

          <div className="space-y-3 text-[14px] leading-6 text-white/68">
            <p className="break-keep">{jewelry.reason}</p>
            <p className="break-keep text-white/55">
              추천 톤: {jewelry.tone}. {jewelry.styling_tip}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
