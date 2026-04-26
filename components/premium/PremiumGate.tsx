'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

declare global {
  interface Window {
    IMP: any;
  }
}

export default function PremiumGate({ analysisId }: { analysisId: string }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    if (!window.IMP) return;
    setLoading(true);

    const { IMP } = window;
    IMP.init('imp00000000'); // 포트원 테스트 가맹점 식별코드

    IMP.request_pay({
      pg: 'html5_inicis',
      pay_method: 'card',
      merchant_uid: `mid_${new Date().getTime()}`,
      name: '내 정밀 구조 분석 리포트 (PDF)',
      amount: 4900,
      buyer_email: 'user@example.com',
      buyer_name: '사용자',
    }, (rsp: any) => {
      if (rsp.success) {
        alert('결제가 완료되었습니다! 정밀 리포트로 이동합니다.');
        // 실제 운영 시 여기서 백엔드 검증 후 리다이렉트
      } else {
        alert(`결제 실패: ${rsp.error_msg}`);
      }
      setLoading(false);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="relative mt-24 p-1 rounded-[3rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-3xl overflow-hidden"
    >
      <div className="bg-slate-900 rounded-[2.9rem] p-10 md:p-14 space-y-10">
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold border border-white/20 uppercase tracking-widest">
            <Sparkles size={14} className="text-yellow-400" />
            Limited Offer
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            당신의 알고리즘을<br />완벽하게 해독하세요
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto">
            단기 운세가 아닌, 인생 전체를 관통하는<br />
            <span className="text-white font-bold">10페이지 분량의 정밀 구조 보고서</span>를 드립니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
          {[
            { icon: <Zap size={20} />, title: "행동 교정 가이드", desc: "고통을 피하고 성과를 내는 법" },
            { icon: <ShieldCheck size={20} />, title: "30년 대운 그래프", desc: "인생의 큰 흐름과 터닝포인트" }
          ].map((item, i) => (
            <div key={i} className="flex gap-4 p-6 rounded-3xl bg-white/5 border border-white/10">
              <div className="text-indigo-400 mt-1">{item.icon}</div>
              <div>
                <h4 className="text-white font-bold">{item.title}</h4>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 space-y-6">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="group relative w-full bg-white text-black font-black text-xl py-6 rounded-[2rem] hover:bg-gray-100 transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3"
          >
            {loading ? "연결 중..." : "정밀 리포트 4,900원에 받기"}
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </button>
          <p className="text-center text-gray-500 text-xs">
            한 번의 커피값으로 인생의 설계도를 손에 넣으세요
          </p>
        </div>
      </div>

      {/* 액센트 장식 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
    </motion.div>
  );
}
