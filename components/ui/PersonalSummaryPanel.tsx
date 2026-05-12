'use client';

import { Download, Gem, Link as LinkIcon, RotateCcw, Share2, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SajuAnalysis, ElementType } from '@/types/saju';
import { recommendJewelry } from '@/src/utils/recommendJewelry';

interface Props {
  analysis: SajuAnalysis;
  resultUrl: string;
}

type SummaryGem = {
  id: string;
  name: string;
  displayElement: string;
  reason: string;
  situations: string[];
};

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

export default function PersonalSummaryPanel({ analysis, resultUrl }: Props) {
  const [notice, setNotice] = useState('');
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
  const strong = jewelry.strongElementInfo;
  const support = jewelry.supportElementInfo;
  const gems = jewelry.summaryGems.slice(0, 2);
  const topGemNames = (gems as SummaryGem[]).map((gem) => gem.name).join(', ');
  const keywords = analysis.personality_keywords?.slice(0, 3).join(' / ') || jewelry.strongElementInfo?.keywords?.join(' / ');

  const showNotice = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 2200);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(resultUrl);
      showNotice('결과 링크가 복사되었습니다');
    } catch {
      showNotice('링크 복사에 실패했습니다');
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#D6B46A]/30 bg-[linear-gradient(145deg,rgba(214,180,106,0.18),rgba(255,255,255,0.045)_42%,rgba(96,165,250,0.08))] p-5 shadow-2xl md:p-7">
      <div className="space-y-6">
        <div className="space-y-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D6B46A]/35 bg-[#D6B46A]/15 px-4 py-1.5 text-[11px] font-black tracking-[0.14em] text-[#B9892B]">
            <Sparkles size={14} />
            ORABIT PERSONAL JEWELRY REPORT
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

        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryItem label="핵심 기질" value={keywords} />
          <SummaryItem label="강하게 드러나는 기운" value={`${strong?.display ?? '토(土)'}: ${strong?.keywords?.join(', ') ?? '안정, 기준, 현실감'}`} />
          <SummaryItem label="보완 포인트" value={`${support?.display ?? '수(水)'}: ${support?.keywords?.join(', ') ?? '흐름, 유연함, 감정 조절'}`} />
          <SummaryItem label="추천 주얼리" value={`${jewelry.primaryMetal.name} ${jewelry.primaryForm.name}`} />
        </div>

        <div className="rounded-[1.5rem] border border-[#D6B46A]/30 bg-[#D6B46A]/12 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D6B46A]/20 text-[#A97622]">
              <Gem size={22} />
            </div>
            <div>
              <p className="text-xs font-black text-[#A97622]">추천 보석</p>
              <h2 className="mt-1 text-xl font-black text-[var(--result-text)]">{topGemNames}</h2>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {(gems as SummaryGem[]).map((gem, index) => (
              <article key={gem.id} className="rounded-2xl border border-[color:var(--result-border)] bg-[var(--result-card)] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#D6B46A]/15 px-2.5 py-1 text-[11px] font-black text-[#A97622]">
                    {index + 1}순위
                  </span>
                  <h3 className="font-black text-[var(--result-text)]">{gem.name}</h3>
                  <span className="text-xs font-bold text-[color:var(--result-faint)]">{gem.displayElement}</span>
                </div>
                <p className="mt-3 break-keep text-sm leading-6 text-[color:var(--result-muted)]">{gem.reason}</p>
                <p className="mt-2 text-xs font-bold leading-5 text-[color:var(--result-faint)]">
                  어울리는 상황: {gem.situations.slice(0, 4).join(', ')}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => document.getElementById('share-card-actions')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--result-text)] px-4 text-sm font-black text-[var(--result-accent-contrast)] active:scale-95"
          >
            <Download size={17} />
            내 리포트 저장하기
          </button>
          <button
            type="button"
            onClick={() => document.getElementById('share-card-actions')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[color:var(--result-border)] bg-[var(--result-surface)] px-4 text-sm font-black text-[var(--result-text)] active:scale-95"
          >
            <Share2 size={17} />
            친구에게 공유하기
          </button>
          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[color:var(--result-border)] bg-[var(--result-surface)] px-4 text-sm font-black text-[var(--result-text)] active:scale-95"
          >
            <RotateCcw size={17} />
            다시 분석하기
          </button>
        </div>

        <button
          type="button"
          onClick={copyLink}
          className="mx-auto flex items-center gap-2 text-xs font-bold text-[color:var(--result-faint)] underline-offset-4 hover:underline"
        >
          <LinkIcon size={14} />
          결과 링크 복사
        </button>
        {notice && (
          <p role="status" className="text-center text-sm font-bold text-emerald-700">
            {notice}
          </p>
        )}
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
