'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getDb } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { SajuAnalysis } from '@/types/saju';
import { generateResultCards } from '@/lib/cardGenerator';
import ShareButton from '@/components/ui/ShareButton';
import CharacterGuide from '@/components/ui/CharacterGuide';
import ElementBalancePanel from '@/components/ui/ElementBalancePanel';
import DetailedReadingPanel from '@/components/ui/DetailedReadingPanel';
import IntegratedInsightPanel from '@/components/ui/IntegratedInsightPanel';

async function getDocWithTimeout(docRef: ReturnType<typeof doc>) {
  return Promise.race([
    getDoc(docRef),
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 4500);
    }),
  ]);
}

export default function ResultPage() {
  const { resultId } = useParams();
  const [analysis, setAnalysis] = useState<SajuAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!resultId) return;

      const id = resultId as string;
      const fallback = sessionStorage.getItem(`saju:analysis:${id}`);

      if (fallback) {
        setAnalysis(JSON.parse(fallback) as SajuAnalysis);
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(getDb(), "results", id);
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

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
      <CharacterGuide size={80} />
      <p className="text-gray-400 animate-pulse">구조 해석을 불러오는 중...</p>
    </div>
  );

  if (!analysis) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p>존재하지 않는 분석 결과입니다.</p>
    </div>
  );

  const cards = generateResultCards(analysis);
  const shareCaptureId = 'result-share-capture';

  return (
    <main className="min-h-screen bg-black text-white p-5 pb-24 md:pt-16">
      <div id={shareCaptureId} className="result-report-font max-w-2xl mx-auto space-y-8 bg-black pb-8">
        {/* 상단 요약 */}
        <header className="text-center space-y-4 px-1">
          <div className="inline-block px-4 py-1 rounded-full bg-white/[0.04] text-white/62 text-xs font-bold border border-white/10">
            사주 구조 분석 리포트
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-b from-white to-white/72 bg-clip-text text-transparent">{analysis.type_name}의 구조</h1>
          <p className="text-white/62 text-base md:text-lg font-medium leading-8 max-w-lg mx-auto break-keep">{analysis.summary}</p>
        </header>

        <ElementBalancePanel
          distribution={analysis.element_distribution}
          profile={analysis.element_profile}
          confidenceNote={analysis.confidence_note}
          timeKnown={Boolean(analysis.time_known)}
        />

        <DetailedReadingPanel analysis={analysis} />

        <IntegratedInsightPanel cards={cards} />
      </div>

      <footer data-share-exclude className="max-w-2xl mx-auto pt-20 text-center space-y-12">
        <div className="flex flex-col items-center gap-6">
          <ShareButton
            url={`${typeof window !== 'undefined' ? window.location.origin : ''}/result/${resultId}`}
            title={`사주 구조 분석 리포트: ${analysis.type_name}`}
            description="일간, 오행 분포, 시주 입력 여부를 기준으로 정리한 개인 사주 구조 리포트입니다."
            captureTargetId={shareCaptureId}
            fileName={`saju-${resultId}.png`}
          />
          <p className="text-gray-500 text-xs flex items-center gap-2 font-medium tracking-tight">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            현재 2,841명이 자신의 구조를 실시간 분석 중입니다
          </p>
        </div>
        
        <div className="pt-10 border-t border-white/10">
          <button
            onClick={() => window.location.href = '/'}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 active:scale-95"
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
  );
}
