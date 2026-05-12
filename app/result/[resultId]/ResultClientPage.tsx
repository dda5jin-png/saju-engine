'use client';

import { useEffect, useState } from 'react';
import { getDb } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { SajuAnalysis } from '@/types/saju';
import BrightnessThemeShell from '@/components/ui/BrightnessThemeShell';
import CharacterGuide from '@/components/ui/CharacterGuide';
import ElementBalancePanel from '@/components/ui/ElementBalancePanel';
import DetailedReadingPanel from '@/components/ui/DetailedReadingPanel';
import JewelryRecommendationPanel from '@/components/ui/JewelryRecommendationPanel';
import ViralCharacterPanel from '@/components/ui/ViralCharacterPanel';
import DecisionCoachPanel from '@/components/ui/DecisionCoachPanel';
import PersonalSummaryPanel from '@/components/ui/PersonalSummaryPanel';

interface Props {
  resultId: string;
}

async function getDocWithTimeout(docRef: ReturnType<typeof doc>) {
  return Promise.race([
    getDoc(docRef),
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 4500);
    }),
  ]);
}

export default function ResultClientPage({ resultId }: Props) {
  const [analysis, setAnalysis] = useState<SajuAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!resultId) return;

      const fallback = sessionStorage.getItem(`saju:analysis:${resultId}`);

      if (fallback) {
        setAnalysis(JSON.parse(fallback) as SajuAnalysis);
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(getDb(), 'results', resultId);
        const docSnap = await getDocWithTimeout(docRef);

        if (docSnap?.exists()) {
          setAnalysis(docSnap.data() as SajuAnalysis);
        }
      } catch (error) {
        console.error('Failed to load analysis result:', error);
      }

      setLoading(false);
    }
    fetchData();
  }, [resultId]);

  if (loading) {
    return (
      <BrightnessThemeShell className="min-h-screen">
        <div className="flex min-h-screen flex-col items-center justify-center space-y-4 text-[var(--result-text)]">
          <CharacterGuide size={80} />
          <p className="animate-pulse text-[color:var(--result-muted)]">ORABIT 리포트를 불러오는 중...</p>
        </div>
      </BrightnessThemeShell>
    );
  }

  if (!analysis) {
    return (
      <BrightnessThemeShell className="min-h-screen">
        <div className="flex min-h-screen items-center justify-center text-[var(--result-text)]">
          <p>존재하지 않는 분석 결과입니다.</p>
        </div>
      </BrightnessThemeShell>
    );
  }

  const resultUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/result/${resultId}`;

  return (
    <BrightnessThemeShell className="min-h-screen">
      <main className="min-h-screen p-5 pb-24 pt-24 md:pt-24">
        <div className="result-report-font max-w-2xl mx-auto space-y-8 pb-8">
          <PersonalSummaryPanel analysis={analysis} resultUrl={resultUrl} />

          <ElementBalancePanel
            distribution={analysis.element_distribution}
            profile={analysis.element_profile}
            confidenceNote={analysis.confidence_note}
            timeKnown={Boolean(analysis.time_known)}
          />

          <DetailedReadingPanel analysis={analysis} />

          <JewelryRecommendationPanel analysis={analysis} />

          <ViralCharacterPanel
            analysis={analysis}
            resultUrl={resultUrl}
            resultId={resultId}
          />

          <DecisionCoachPanel resultId={resultId} />

          <section className="rounded-[1.5rem] border border-[color:var(--result-border)] bg-[var(--result-surface)] p-5 text-xs font-medium leading-6 text-[color:var(--result-faint)]">
            <p className="break-keep">
              ORABIT의 리포트는 사주명리학의 오행 구조를 바탕으로 한 참고용 콘텐츠입니다. 개인의 운명이나 미래를 단정하지 않으며, 자신의 성향과 선택 방향을 돌아보는 데 도움을 주기 위한 해석입니다.
            </p>
            <p className="mt-3 break-keep">
              보석/주얼리 추천은 명리학적 상징과 스타일링 관점의 제안이며, 의학적, 법률적, 재정적 효능을 보장하지 않습니다.
            </p>
          </section>
        </div>

        <footer data-share-exclude className="max-w-2xl mx-auto pt-20 text-center space-y-12">
          <div className="pt-10 border-t border-[color:var(--result-border)]">
            <button
              onClick={() => window.location.href = '/'}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-[var(--result-text)] transition-all duration-200 bg-[var(--result-surface)] border border-[color:var(--result-border)] rounded-2xl hover:brightness-95 active:scale-95"
            >
              <span className="relative flex items-center gap-2">
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                새로운 데이터로 다시 분석하기
              </span>
            </button>
          </div>
        </footer>
      </main>
    </BrightnessThemeShell>
  );
}
