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
          <header className="text-center space-y-4 px-1">
            <div className="inline-block px-4 py-1 rounded-full bg-[#D6B46A]/15 text-[#9A6D22] text-xs font-black tracking-[0.18em] border border-[#D6B46A]/35">
              ORABIT ENERGY REPORT
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--result-text)]">{analysis.type_name}의 에너지 구조</h1>
            <p className="text-base md:text-lg font-medium leading-8 max-w-lg mx-auto break-keep text-[color:var(--result-muted)]">{analysis.summary}</p>
          </header>

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
