'use client';

import { Activity, BadgeCheck, Clock3 } from 'lucide-react';
import { ElementDistribution, ElementProfile, ElementType } from '@/types/saju';

interface Props {
  distribution: ElementDistribution;
  profile?: ElementProfile;
  confidenceNote?: string;
  timeKnown: boolean;
}

const ELEMENT_META: Record<ElementType, { label: string; tone: string; bar: string }> = {
  wood: {
    label: '목',
    tone: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20',
    bar: 'bg-emerald-400',
  },
  fire: {
    label: '화',
    tone: 'text-rose-300 bg-rose-500/10 border-rose-400/20',
    bar: 'bg-rose-400',
  },
  earth: {
    label: '토',
    tone: 'text-yellow-200 bg-yellow-500/10 border-yellow-300/20',
    bar: 'bg-yellow-300',
  },
  metal: {
    label: '금',
    tone: 'text-sky-200 bg-sky-500/10 border-sky-300/20',
    bar: 'bg-sky-300',
  },
  water: {
    label: '수',
    tone: 'text-cyan-200 bg-cyan-500/10 border-cyan-300/20',
    bar: 'bg-cyan-300',
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
    recommendation: '강한 기운은 활용하고, 부족한 기운은 생활 루틴에서 보완하는 흐름이 좋습니다.',
  };
}

function formatElementLabels(types: ElementType[]) {
  if (types.length === 0) return '없음';
  return types.map((type) => ELEMENT_META[type].label).join(', ');
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
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl backdrop-blur-xl md:p-7">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="grid gap-6 md:grid-cols-[0.85fr_1.15fr] md:items-start">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-gray-500">Element Balance</p>
              <h2 className="mt-1 text-2xl font-black text-white">오행 구조</h2>
            </div>
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/30">
              <span className="text-2xl font-black text-white">{resolvedProfile.balance_score}</span>
              <span className="text-[10px] font-bold text-gray-500">점</span>
            </div>
          </div>

          <p className="break-keep text-sm font-medium leading-relaxed text-gray-300">
            {resolvedProfile.summary}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-500">
                <Activity size={14} />
                강한 기운
              </div>
              <p className="text-lg font-black text-white">{formatElementLabels(resolvedProfile.dominant)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-500">
                <BadgeCheck size={14} />
                보완 기운
              </div>
              <p className="text-lg font-black text-white">
                {formatElementLabels(resolvedProfile.missing.length > 0 ? resolvedProfile.missing : resolvedProfile.weak)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {ELEMENT_ORDER.map((type) => {
            const meta = ELEMENT_META[type];
            const count = distribution[type];
            const width = `${Math.max(8, (count / maxCount) * 100)}%`;

            return (
              <div key={type} className="grid grid-cols-[3.5rem_1fr_1.5rem] items-center gap-3">
                <div className={`rounded-full border px-3 py-1 text-center text-sm font-black ${meta.tone}`}>
                  {meta.label}
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full ${meta.bar}`} style={{ width }} />
                </div>
                <span className="text-right font-mono text-sm font-bold text-gray-300">{count}</span>
              </div>
            );
          })}

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-500">
              <Clock3 size={14} />
              분석 기준
            </div>
            <p className="break-keep text-sm font-medium leading-relaxed text-gray-300">
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
