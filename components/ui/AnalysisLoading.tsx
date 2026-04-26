'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterGuide from './CharacterGuide';

const MOCK_STEPS = [
  "천체 데이터 정렬 중...",
  "만세력 좌표 계산 완료",
  "다섯 가지 분석 개체 매핑...",
  "행동 알고리즘 도출 중...",
  "당신의 구조를 문장으로 변환하는 중..."
];

export default function AnalysisLoading() {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev < MOCK_STEPS.length - 1 ? prev + 1 : prev));
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 1 : 100));
    }, 40);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6"
    >
      <div className="w-full max-w-xs space-y-12">
        <CharacterGuide size={120} />
        
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <AnimatePresence mode="wait">
              <motion.p
                key={stepIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-white font-medium tracking-tight h-6"
              >
                {MOCK_STEPS[stepIndex]}
              </motion.p>
            </AnimatePresence>
            <p className="text-gray-500 text-xs font-mono">{progress}%</p>
          </div>
          
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
