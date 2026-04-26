'use client';

import { motion } from 'framer-motion';

export default function CharacterGuide({ size = 120, animate = true }: { size?: number, animate?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={animate ? {
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0],
        } : {}}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ width: size, height: size }}
        className="relative"
      >
        {/* 미니멀한 분석 엔티티 (기하학적 구조) */}
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <motion.circle
            cx="50" cy="50" r="45"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="4 4"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="text-gray-400 opacity-30"
          />
          <rect x="30" y="30" width="40" height="40" rx="2" className="fill-indigo-500/20 stroke-indigo-500" strokeWidth="2" />
          <path d="M40 45H60M40 55H55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white" />
          {/* 눈 - 분석 중인 느낌 */}
          <motion.circle
            cx="40" cy="38" r="1.5"
            fill="currentColor"
            className="text-indigo-400"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.circle
            cx="60" cy="38" r="1.5"
            fill="currentColor"
            className="text-indigo-400"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
          />
        </svg>
      </motion.div>
    </div>
  );
}
