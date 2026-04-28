'use client';

import { SajuResultCard } from '@/types/saju';

interface Props {
  cards: SajuResultCard[];
}

export default function IntegratedInsightPanel({ cards }: Props) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#0b0d12] p-6 md:p-8 shadow-2xl">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-6">
        <span className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold text-white/55">
          분석 요약
        </span>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white md:text-[1.7rem]">핵심 리포트</h2>
          <p className="text-sm leading-6 text-white/55">
            흩어진 카드 대신 한 번에 읽히도록 주요 해석을 항목별로 정리했습니다.
          </p>
        </div>
      </div>

      <div className="divide-y divide-white/10">
        {cards.map((card, index) => (
          <article key={`${card.title}-${index}`} className="grid gap-3 py-5 md:grid-cols-[116px_1fr] md:gap-6">
            <div className="flex items-center gap-3 md:block md:space-y-2">
              <span className="font-mono text-xs text-white/30">{String(index + 1).padStart(2, '0')}</span>
              <div className="space-y-1">
                {card.tag && (
                  <span className="text-[11px] font-bold text-cyan-200/80">
                    {card.tag}
                  </span>
                )}
                <h3 className="text-sm font-extrabold text-white/88">{card.title}</h3>
              </div>
            </div>

            <p className="text-[15px] leading-7 text-white/70 md:text-base md:leading-8 break-keep">
              {card.content}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
