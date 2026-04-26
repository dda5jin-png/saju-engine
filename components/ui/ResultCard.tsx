'use client';

import { motion } from 'framer-motion';
import { SajuResultCard } from '@/types/saju';

interface Props {
  card: SajuResultCard;
  index: number;
  isLocked?: boolean;
}

export default function ResultCard({ card, index, isLocked = false }: Props) {
  // 카드별 고유 스타일 (인덱스에 따라 다른 그라데이션)
  const getCardStyle = (idx: number) => {
    if (idx === 4) { // 뼈아픈 진실 (팩트폭격)
      return {
        bg: "bg-gradient-to-br from-orange-600/20 to-red-600/20",
        border: "border-orange-500/30",
        text: "text-orange-400",
        glow: "group-hover:bg-orange-500/20"
      };
    }
    const styles = [
      { bg: "bg-gradient-to-br from-indigo-600/20 to-blue-600/20", border: "border-indigo-500/30", text: "text-indigo-400", glow: "group-hover:bg-indigo-500/20" },
      { bg: "bg-gradient-to-br from-purple-600/20 to-pink-600/20", border: "border-purple-500/30", text: "text-purple-400", glow: "group-hover:bg-purple-500/20" },
      { bg: "bg-gradient-to-br from-emerald-600/20 to-teal-600/20", border: "border-emerald-500/30", text: "text-emerald-400", glow: "group-hover:bg-emerald-500/20" },
      { bg: "bg-gradient-to-br from-amber-600/20 to-yellow-600/20", border: "border-amber-500/30", text: "text-amber-400", glow: "group-hover:bg-amber-500/20" },
    ];
    return styles[idx % styles.length];
  };

  const style = getCardStyle(index);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className={`relative w-full ${style.bg} backdrop-blur-xl rounded-[2.5rem] p-10 border ${style.border} shadow-2xl overflow-hidden group min-h-[300px] flex flex-col justify-between`}
    >
      {/* 프리미엄 장식 요소 */}
      <div className={`absolute -right-10 -top-10 w-40 h-40 ${style.glow} rounded-full blur-[60px] transition-all duration-700`} />
      <div className="absolute left-0 top-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="relative space-y-6">
        <div className="flex justify-between items-start">
          {card.tag && (
            <span className={`inline-block px-4 py-1.5 rounded-full ${style.bg} ${style.text} text-[10px] font-black tracking-[0.2em] uppercase border ${style.border}`}>
              {card.tag}
            </span>
          )}
          <span className="text-white/20 font-mono text-sm leading-none">0{index + 1}</span>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white/50 tracking-tight">{card.title}</h3>
          <p className="text-3xl md:text-4xl font-extrabold text-white leading-[1.15] break-keep">
            {isLocked ? "••••••••••••••••••••" : card.content}
          </p>
        </div>
      </div>

      <div className="relative mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-white/40">
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-700" />
          ))}
          <span className="ml-4 text-xs self-center">3,492명이 공감함</span>
        </div>
        <div className="text-xs font-medium uppercase tracking-widest group-hover:text-white transition-colors cursor-pointer">
          Tap to Share
        </div>
      </div>

      {isLocked && (
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="Ref-L123-L145 M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-white font-bold text-lg mb-2">공유하고 결과 마저보기</p>
          <p className="text-white/60 text-sm">이 카드는 친구들에게 공유하면<br/>즉시 잠금이 해제됩니다.</p>
        </div>
      )}
    </motion.div>
  );
}
