'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getDb } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { SajuAnalysis, SajuResultCard } from '@/types/saju';
import { generateResultCards } from '@/lib/cardGenerator';
import ResultCard from '@/components/ui/ResultCard';
import ShareButton from '@/components/ui/ShareButton';
import CharacterGuide from '@/components/ui/CharacterGuide';
import ElementBalancePanel from '@/components/ui/ElementBalancePanel';
import AuthModal from '@/components/auth/AuthModal';
import PremiumGate from '@/components/premium/PremiumGate';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToAuthChanges } from '@/lib/auth';
import { User } from 'firebase/auth';

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
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

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

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-24 md:pt-20">
      <div className="max-w-2xl mx-auto space-y-12">
        {/* 상단 요약 */}
        <header className="text-center space-y-4">
          <div className="inline-block px-4 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-bold border border-indigo-500/30">
            분석 완료
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">{analysis.type_name}의 구조</h1>
          <p className="text-gray-300 text-lg md:text-xl font-medium leading-relaxed max-w-lg mx-auto">{analysis.summary}</p>
        </header>

        <ElementBalancePanel
          distribution={analysis.element_distribution}
          profile={analysis.element_profile}
          confidenceNote={analysis.confidence_note}
          timeKnown={Boolean(analysis.time_known)}
        />

        {/* 카드 리스트 */}
        <div className="space-y-6">
          {cards.slice(0, 3).map((card: SajuResultCard, i: number) => (
            <ResultCard key={i} card={card} index={i} />
          ))}

          <AnimatePresence>
            {!unlocked ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="relative pt-12"
              >
                {/* 잠긴 카드 블러 처리 */}
                <div className="absolute inset-x-0 -top-20 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10 flex flex-col items-center justify-end pb-12 px-4">
                  <div className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-700 w-full text-center space-y-6 shadow-2xl">
                    <div className="space-y-2">
                       <h3 className="text-xl font-bold">나머지 3장의 카드가 도착했습니다</h3>
                       <p className="text-gray-400 text-sm font-medium">당신의 관계, 돈, 그리고 절대적인 타이밍을 확인하세요.</p>
                    </div>
                    
                    <div className="space-y-4">
                      <button 
                        onClick={() => {
                          if (!user) setShowAuthModal(true);
                          else setUnlocked(true); // 실제로는 공유 트리거 연동
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                      >
                        {user ? '나머지 분석 결과 보기 (공유)' : '로그인하고 마저보기'}
                      </button>
                      
                      {user && (
                        <p className="text-gray-600 text-[10px]">공유 시 즉시 해제됩니다.</p>
                      )}
                    </div>
                  </div>
                </div>
                {/* 미리보기용 블러 효과 카드 */}
                <div className="space-y-6 opacity-20 filter blur-sm pointer-events-none">
                  {cards.slice(3).map((card: SajuResultCard, i: number) => (
                    <ResultCard key={i + 3} card={card} index={i + 3} />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {cards.slice(3).map((card: SajuResultCard, i: number) => (
                  <ResultCard key={i + 3} card={card} index={i + 3} />
                ))}
                
                {/* 프리미엄 결제 게이트 */}
                <PremiumGate analysisId={resultId as string} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={(u) => {
            setUser(u);
            // 로그인 성공 후 바로 언락하지 않고 공유 유도 (비즈니스 로직)
          }} 
        />

        <footer className="pt-20 text-center space-y-12">
          <div className="flex flex-col items-center gap-6">
            <ShareButton 
               url={`${typeof window !== 'undefined' ? window.location.origin : ''}/result/${resultId}`}
               title={`내 사주 구조는 [${analysis.type_name}] 입니다!`}
               description={analysis.summary}
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
      </div>
    </main>
  );
}
