'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { SajuAnalysis, SajuResultCard } from '@/types/saju';
import { generateResultCards } from '@/lib/cardGenerator';
import ResultCard from '@/components/ui/ResultCard';
import ShareButton from '@/components/ui/ShareButton';
import CharacterGuide from '@/components/ui/CharacterGuide';
import AuthModal from '@/components/auth/AuthModal';
import PremiumGate from '@/components/premium/PremiumGate';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToAuthChanges } from '@/lib/auth';
import { User } from 'firebase/auth';

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
      const docRef = doc(db, "results", resultId as string);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setAnalysis(docSnap.data() as SajuAnalysis);
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
          <h1 className="text-4xl font-black">{analysis.type_name}의 구조</h1>
          <p className="text-gray-400 text-lg leading-relaxed">{analysis.summary}</p>
        </header>

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

        <footer className="pt-20 text-center space-y-8">
          <div className="flex flex-col items-center gap-4">
            <ShareButton 
               url={`${typeof window !== 'undefined' ? window.location.origin : ''}/result/${resultId}`}
               title={`내 사주 구조는 [${analysis.type_name}] 입니다!`}
               description={analysis.summary}
            />
            <p className="text-gray-500 text-xs flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              현재 1,482명이 자신의 구조를 분석 중입니다
            </p>
          </div>
          
          <div className="pt-10 border-t border-white/5">
            <button 
              onClick={() => window.location.href = '/'}
              className="text-gray-400 hover:text-white transition-colors underline underline-offset-8 text-sm font-medium"
            >
              새로운 데이터로 분석하기
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
