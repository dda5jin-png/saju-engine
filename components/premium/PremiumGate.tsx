'use client';

import { motion } from 'framer-motion';
import { CreditCard, LockKeyhole, Repeat, ShieldCheck, Sparkles } from 'lucide-react';
import PortOnePaymentButton from '@/components/payments/PortOnePaymentButton';

export default function PremiumGate() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-[2rem] border border-white/10 bg-[#080b12] p-6 md:p-8"
    >
      <div className="space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-[11px] font-bold text-amber-100">
          <Sparkles size={14} />
          PREMIUM DECISION
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">이 분석은 더 깊게 들어갈수록 정확해진다</h2>
          <p className="text-sm leading-6 text-white/58">
            자동갱신 없이 필요한 만큼만 결제하세요. 결제한 횟수만큼 Decision Coach 정밀 분석을 사용할 수 있습니다.
          </p>
        </div>

        <div className="grid gap-3">
          {[
            { icon: <Repeat size={17} />, text: '추가 분석 보기' },
            { icon: <ShieldCheck size={17} />, text: '다른 선택지도 비교하기' },
            { icon: <LockKeyhole size={17} />, text: '연애 / 돈 / 커리어 전용 분석 열기' },
            { icon: <CreditCard size={17} />, text: '자동갱신 없는 횟수권 결제' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold text-white/72">
              <span className="text-amber-200">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>

        <div className="grid gap-3">
          <PortOnePaymentButton productId="decision_single" />
          <PortOnePaymentButton productId="decision_pack_3" variant="compact" />
          <PortOnePaymentButton productId="decision_pack_5" variant="compact" />
        </div>
      </div>
    </motion.div>
  );
}
