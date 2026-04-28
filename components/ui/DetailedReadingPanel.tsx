'use client';

import { BookOpenCheck, CircleHelp, Compass, Landmark, ShieldCheck, Users } from 'lucide-react';
import { DetailedReading, SajuAnalysis } from '@/types/saju';

interface Props {
  analysis: SajuAnalysis;
}

const fallbackReading = (analysis: SajuAnalysis): DetailedReading => ({
  basis: [
    `연주 ${analysis.pillars.year}`,
    `월주 ${analysis.pillars.month}`,
    `일주 ${analysis.pillars.day}`,
    `시주 ${analysis.pillars.hour}`,
    `일간 ${analysis.day_master}`,
  ],
  temperament: `${analysis.type_name}은 ${analysis.day_master_profile?.core ?? analysis.summary}을 중심으로 해석됩니다.`,
  work_style: analysis.day_master_profile?.strategy ?? analysis.summary,
  relationship: analysis.relationship_style,
  money: analysis.money_style,
  timing: analysis.timing_flow,
  balance_practice: analysis.element_profile?.recommendation ?? '강한 기운과 약한 기운의 균형을 생활 루틴에서 맞추는 것이 좋습니다.',
  reliability_note: analysis.confidence_note ?? '입력된 생년월일시를 기준으로 한 구조 분석입니다.',
});

const sectionItems = [
  { key: 'temperament', label: '기질', icon: BookOpenCheck },
  { key: 'work_style', label: '일과 선택', icon: Compass },
  { key: 'relationship', label: '관계', icon: Users },
  { key: 'money', label: '돈의 흐름', icon: Landmark },
  { key: 'timing', label: '타이밍', icon: CircleHelp },
  { key: 'balance_practice', label: '보완 루틴', icon: ShieldCheck },
] as const;

export default function DetailedReadingPanel({ analysis }: Props) {
  const reading = analysis.detailed_reading ?? fallbackReading(analysis);
  const reliabilityNote = '역법 계산과 일간·오행 규칙을 바탕으로 한 참고 리포트입니다.';

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 md:p-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-bold text-cyan-200">
            DEEP READING
          </span>
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-white">상세 풀이</h2>
            <p className="text-sm md:text-base leading-relaxed text-white/62">
              일간, 네 기둥, 오행 강약을 나눠 읽고 생활에서 바로 확인할 수 있는 방식으로 정리했습니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-left md:min-w-64">
          {reading.basis.map((item) => (
            <span
              key={item}
              className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs font-semibold text-white/70"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {sectionItems.map(({ key, label, icon: Icon }) => (
          <article key={key} className="grid gap-3 border-t border-white/10 pt-5 md:grid-cols-[140px_1fr]">
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <Icon size={17} className="text-cyan-300" />
              {label}
            </div>
            <p className="text-[15px] leading-7 text-white/72 break-keep">
              {reading[key]}
            </p>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-center gap-2 text-sm font-extrabold text-white/85">
          <ShieldCheck size={17} />
          해석 기준
        </div>
        <p className="mt-3 text-sm leading-6 text-white/58 break-keep">
          {reliabilityNote}
        </p>
      </div>
    </section>
  );
}
