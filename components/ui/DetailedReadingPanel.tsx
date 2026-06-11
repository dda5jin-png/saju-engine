'use client';

import { BookOpenCheck, CircleHelp, Compass, Landmark, ListChecks, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
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
  coaching_sections: undefined,
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
  const [expanded, setExpanded] = useState(false);
  const reading = analysis.detailed_reading ?? fallbackReading(analysis);
  const coachingSections = reading.coaching_sections;
  const uniqueCoachingSections = coachingSections?.filter(
    (section) => ![
      '한 줄 요약',
      '강하게 쓰는 에너지',
      '강하게 드러나는 기운',
      '보완하면 좋아지는 부분',
    ].includes(section.title),
  );
  const reliabilityNote = '역법 계산과 일간·오행 규칙을 바탕으로 한 참고 리포트입니다.';
  const visibleCoachingSections = expanded ? uniqueCoachingSections : uniqueCoachingSections?.slice(0, 4);

  return (
    <section id="detailed-reading" className="scroll-mt-24 space-y-8 rounded-[2rem] border border-[color:var(--result-border-strong)] bg-[var(--result-surface)] p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--result-info-border)] bg-[var(--result-info-soft)] px-4 py-1.5 text-[11px] font-bold text-[var(--result-info-text)]">
            03 · 생활 해석
          </span>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[var(--result-text)] md:text-3xl">상세 풀이</h2>
            <p className="break-keep text-sm leading-relaxed text-[color:var(--result-muted)] md:text-base">
              기질을 일, 관계, 돈, 타이밍과 생활 습관으로 나누어 해석합니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-left md:min-w-64">
          {reading.basis.map((item) => (
            <span
              key={item}
              className="rounded-xl border border-[color:var(--result-border)] bg-[var(--result-soft)] px-3 py-2 text-xs font-semibold text-[color:var(--result-muted)]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {uniqueCoachingSections && uniqueCoachingSections.length > 0 ? (
        <div className="grid gap-4">
          {visibleCoachingSections?.map((section, index) => (
            <article key={section.title} className="grid gap-3 border-t border-[color:var(--result-border)] pt-5 md:grid-cols-[160px_1fr]">
              <div className="flex items-center gap-2 text-sm font-black text-[var(--result-text)]">
                <ListChecks size={17} className="text-[var(--result-info-text)]" />
                <span className="text-[var(--result-info-text)]">{String(index + 1).padStart(2, '0')}</span>
                {section.title.replace('강하게 쓰는 에너지', '강하게 드러나는 기운')}
              </div>
              <p className="whitespace-pre-line text-[15px] leading-7 text-[color:var(--result-muted)] break-keep">
                {section.content}
              </p>
            </article>
          ))}
          {uniqueCoachingSections.length > 4 && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="rounded-2xl border border-[color:var(--result-border-strong)] bg-[var(--result-soft)] px-5 py-4 text-sm font-black text-[var(--result-text)] transition active:scale-95"
            >
              {expanded ? '상세 풀이 접기' : '상세 풀이 더 보기'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {sectionItems.map(({ key, label, icon: Icon }) => (
            <article key={key} className="grid gap-3 border-t border-[color:var(--result-border)] pt-5 md:grid-cols-[140px_1fr]">
              <div className="flex items-center gap-2 text-sm font-black text-[var(--result-text)]">
                <Icon size={17} className="text-[var(--result-info-text)]" />
                {label}
              </div>
              <p className="text-[15px] leading-7 text-[color:var(--result-muted)] break-keep">
                {reading[key]}
              </p>
            </article>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-[color:var(--result-border)] bg-[var(--result-soft)] p-5">
        <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--result-text)]">
          <ShieldCheck size={17} />
          해석 기준
        </div>
        <p className="mt-3 text-sm leading-6 text-[color:var(--result-muted)] break-keep">
          {reliabilityNote}
        </p>
      </div>
    </section>
  );
}
