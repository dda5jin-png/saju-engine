'use client';

import { Clock3 } from 'lucide-react';
import { ElementDistribution, ElementProfile, ElementType } from '@/types/saju';

interface Props {
  distribution: ElementDistribution;
  profile?: ElementProfile;
  confidenceNote?: string;
  timeKnown: boolean;
}

const ELEMENT_META: Record<ElementType, { label: string; tone: string; bar: string }> = {
  wood: {
    label: '목(木)',
    tone: 'result-element-wood',
    bar: 'result-element-wood',
  },
  fire: {
    label: '화(火)',
    tone: 'result-element-fire',
    bar: 'result-element-fire',
  },
  earth: {
    label: '토(土)',
    tone: 'result-element-earth',
    bar: 'result-element-earth',
  },
  metal: {
    label: '금(金)',
    tone: 'result-element-metal',
    bar: 'result-element-metal',
  },
  water: {
    label: '수(水)',
    tone: 'result-element-water',
    bar: 'result-element-water',
  },
};

const ELEMENT_ORDER: ElementType[] = ['wood', 'fire', 'earth', 'metal', 'water'];

function fallbackProfile(distribution: ElementDistribution, timeKnown: boolean): ElementProfile {
  const entries = ELEMENT_ORDER.map((type) => ({ type, count: distribution[type] }));
  const totalCount = entries.reduce((sum, entry) => sum + entry.count, 0);
  const max = Math.max(...entries.map((entry) => entry.count));
  const min = Math.min(...entries.map((entry) => entry.count));
  const dominant = entries.filter((entry) => entry.count === max && entry.count > 0).map((entry) => entry.type);
  const weak = entries.filter((entry) => entry.count === min).map((entry) => entry.type);
  const missing = entries.filter((entry) => entry.count === 0).map((entry) => entry.type);

  return {
    dominant,
    weak,
    missing,
    balance_score: 70,
    total_count: totalCount,
    summary: timeKnown ? '8글자 기준 오행 분포입니다.' : '시간 미상으로 6글자 기준 오행 분포입니다.',
    recommendation: '강하게 드러나는 기운은 활용하고, 상대적으로 적게 드러나는 기운은 생활 루틴에서 부드럽게 보완하는 흐름이 좋습니다.',
  };
}

export default function ElementBalancePanel({
  distribution,
  profile,
  confidenceNote,
  timeKnown,
}: Props) {
  const resolvedProfile = profile ?? fallbackProfile(distribution, timeKnown);
  const maxCount = Math.max(1, ...ELEMENT_ORDER.map((type) => distribution[type]));

  return (
    <section id="element-balance" className="scroll-mt-24 relative overflow-hidden rounded-[2rem] border border-[color:var(--result-border-strong)] bg-[var(--result-surface)] p-5 shadow-2xl md:p-7">
      <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-start">
        <div className="space-y-5 md:sticky md:top-24">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--result-info-text)]">02 · 수치 근거</p>
              <h2 className="mt-1 text-2xl font-black text-[var(--result-text)]">오행 분포</h2>
            </div>
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-[color:var(--result-info-border)] bg-[var(--result-info-soft)]">
              <span className="text-2xl font-black text-[var(--result-info-text)]">{resolvedProfile.balance_score}</span>
              <span className="text-[10px] font-bold text-[color:var(--result-muted)]">균형점</span>
            </div>
          </div>

          <p className="break-keep text-sm font-medium leading-6 text-[color:var(--result-muted)]">
            {resolvedProfile.summary}
          </p>

          <div className="rounded-2xl border border-[color:var(--result-border)] bg-[var(--result-soft)] p-4">
            <p className="break-keep text-xs font-bold leading-5 text-[color:var(--result-faint)]">
              숫자는 좋고 나쁨의 점수가 아니라, 입력된 사주 글자에서 각 오행이 얼마나 드러나는지 보여주는 분포입니다.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {ELEMENT_ORDER.map((type) => {
            const meta = ELEMENT_META[type];
            const count = distribution[type];
            const width = `${Math.max(8, (count / maxCount) * 100)}%`;

            return (
              <div key={type} className="grid grid-cols-[4.5rem_1fr_1.5rem] items-center gap-3">
                <div className={`result-element rounded-full border px-3 py-1 text-center text-sm font-black ${meta.tone}`}>
                  {meta.label}
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[var(--result-soft)]">
                  <div className={`result-element-bar h-full rounded-full ${meta.bar}`} style={{ width }} />
                </div>
                <span className="text-right font-mono text-sm font-bold text-[var(--result-text)]">{count}</span>
              </div>
            );
          })}

          <div className="rounded-2xl border border-[color:var(--result-border)] bg-[var(--result-card)] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[color:var(--result-faint)]">
              <Clock3 size={14} />
              분석 기준
            </div>
            <p className="break-keep text-sm font-medium leading-6 text-[color:var(--result-muted)]">
              {confidenceNote ??
                (timeKnown
                  ? '태어난 시간이 입력되어 시주까지 포함한 분석입니다.'
                  : '태어난 시간이 없어 시주는 추정하지 않았습니다.')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
