'use client';

import { Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { SajuAnalysis, ElementType } from '@/types/saju';
import { recommendJewelry } from '@/src/utils/recommendJewelry';

interface Props {
  analysis: SajuAnalysis;
}

const dayMasterCopy: Record<string, { display: string; title: string; subtitle: string }> = {
  '甲': {
    display: '갑목(甲木)',
    title: '당신은 방향을 세우고 판을 키우는 개척형입니다.',
    subtitle: '큰 줄기를 먼저 보고, 가능성이 보이면 주변까지 움직이게 만드는 사람입니다.',
  },
  '乙': {
    display: '을목(乙木)',
    title: '당신은 막힌 길에서도 틈을 찾는 유연형입니다.',
    subtitle: '상황을 섬세하게 읽고, 부드럽지만 쉽게 꺾이지 않는 방식으로 길을 만듭니다.',
  },
  '丙': {
    display: '병화(丙火)',
    title: '당신은 분위기를 밝히고 속도를 만드는 발산형입니다.',
    subtitle: '생각과 감정이 비교적 빠르게 밖으로 드러나며, 침체된 장면을 움직이는 힘이 있습니다.',
  },
  '丁': {
    display: '정화(丁火)',
    title: '당신은 조용히 오래 집중하는 섬세형입니다.',
    subtitle: '작은 단서와 사람의 마음을 오래 살피고, 필요한 순간에 정확히 불을 켜는 사람입니다.',
  },
  '戊': {
    display: '무토(戊土)',
    title: '당신은 흔들릴수록 중심을 세우는 안정형입니다.',
    subtitle: '복잡한 상황에서도 기준점을 만들고, 주변이 기대는 현실적인 중심이 되기 쉽습니다.',
  },
  '己': {
    display: '기토(己土)',
    title: '당신은 흩어진 일을 현실로 묶는 운영형입니다.',
    subtitle: '사람과 일을 받아내고, 가능한 것부터 차근히 정리해 결과로 바꾸는 사람입니다.',
  },
  '庚': {
    display: '경금(庚金)',
    title: '당신은 기준이 선명한 결단형입니다.',
    subtitle: '복잡한 상황에서 남길 것과 덜어낼 것을 빠르게 구분하는 사람입니다.',
  },
  '辛': {
    display: '신금(辛金)',
    title: '당신은 작은 차이로 완성도를 높이는 정밀형입니다.',
    subtitle: '대충 넘기기보다 어긋난 부분을 발견하고, 결과의 마지막 질감을 다듬는 사람입니다.',
  },
  '壬': {
    display: '임수(壬水)',
    title: '당신은 큰 흐름을 읽는 전략형입니다.',
    subtitle: '눈앞의 사건보다 그 뒤의 구조를 보고, 정보가 모이면 전체 방향을 먼저 잡습니다.',
  },
  '癸': {
    display: '계수(癸水)',
    title: '당신은 작은 신호를 먼저 읽는 감지형입니다.',
    subtitle: '남들이 넘긴 낌새를 포착하고, 조용히 해법을 찾아가는 사람입니다.',
  },
};

function getSupportElement(analysis: SajuAnalysis): ElementType {
  const entries = Object.entries(analysis.element_distribution) as [ElementType, number][];
  const weakest = entries.sort((a, b) => a[1] - b[1])[0]?.[0] ?? 'water';
  return analysis.element_profile?.missing?.[0] ?? analysis.element_profile?.weak?.[0] ?? weakest;
}

export default function PersonalSummaryPanel({ analysis }: Props) {
  const supportElement = getSupportElement(analysis);
  const jewelry = useMemo(
    () => recommendJewelry(analysis.element_distribution, { supportElement }),
    [analysis.element_distribution, supportElement],
  );
  const dayMaster = dayMasterCopy[analysis.day_master] ?? {
    display: `${analysis.day_master} 일간`,
    title: analysis.summary,
    subtitle: analysis.day_master_profile?.strategy ?? analysis.summary,
  };
  const support = jewelry.supportElementInfo;
  const topGemNames = (jewelry.summaryGems as Array<{ name: string }>)
    .slice(0, 2)
    .map((gem) => gem.name)
    .join(', ');
  const keywords = analysis.personality_keywords?.slice(0, 3).join(' / ') || jewelry.strongElementInfo?.keywords?.join(' / ');

  return (
    <section id="result-summary" className="scroll-mt-24 overflow-hidden rounded-[2rem] border border-[color:var(--result-gold-border)] bg-[linear-gradient(145deg,var(--result-gold-soft),var(--result-surface-strong)_44%,var(--result-info-soft))] p-5 shadow-2xl md:p-7">
      <div className="space-y-6">
        <div className="space-y-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--result-gold-border)] bg-[var(--result-gold-soft)] px-4 py-1.5 text-[11px] font-black tracking-[0.14em] text-[var(--result-gold-text)]">
            <Sparkles size={14} />
            01 · 핵심 요약
          </span>
          <div className="space-y-3">
            <p className="text-sm font-extrabold text-[color:var(--result-faint)]">{dayMaster.display}</p>
            <h1 className="break-keep text-3xl font-black leading-tight text-[var(--result-text)] md:text-4xl">
              {dayMaster.title}
            </h1>
            <p className="mx-auto max-w-xl break-keep text-base font-medium leading-8 text-[color:var(--result-muted)]">
              {dayMaster.subtitle} 다만 {support?.display ?? '수(水)'}의 {support?.keywords?.join(', ') ?? '흐름'}을 보완하면 균형이 더 좋아질 수 있습니다.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryItem label="핵심 기질" value={keywords} />
          <SummaryItem label="보완 방향" value={`${support?.display ?? '수(水)'} · ${support?.keywords?.slice(0, 2).join(', ') ?? '유연함, 감정 조절'}`} />
          <SummaryItem label="오늘의 주얼리" value={`${jewelry.primaryMetal.name} ${jewelry.primaryForm.name} · ${topGemNames}`} />
        </div>

        <p className="text-center text-xs font-bold leading-5 text-[color:var(--result-faint)]">
          아래에서 오행 수치, 상세 해석, 실제 착용법을 순서대로 확인할 수 있습니다.
        </p>
      </div>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--result-border)] bg-[var(--result-card)] p-4">
      <p className="text-[11px] font-black text-[color:var(--result-faint)]">{label}</p>
      <p className="mt-2 break-keep text-sm font-extrabold leading-6 text-[var(--result-text)]">{value || '균형을 함께 확인해 보세요'}</p>
    </div>
  );
}
