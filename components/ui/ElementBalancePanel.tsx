'use client';

import { Activity, BadgeCheck, Clock3 } from 'lucide-react';
import { ElementDistribution, ElementProfile, ElementType } from '@/types/saju';
import { fiveElements } from '@/src/data/fiveElements';

interface Props {
  distribution: ElementDistribution;
  profile?: ElementProfile;
  confidenceNote?: string;
  timeKnown: boolean;
}

const ELEMENT_META: Record<ElementType, { label: string; tone: string; bar: string }> = {
  wood: {
    label: '목(木)',
    tone: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20',
    bar: 'bg-emerald-400',
  },
  fire: {
    label: '화(火)',
    tone: 'text-rose-300 bg-rose-500/10 border-rose-400/20',
    bar: 'bg-rose-400',
  },
  earth: {
    label: '토(土)',
    tone: 'text-yellow-200 bg-yellow-500/10 border-yellow-300/20',
    bar: 'bg-yellow-300',
  },
  metal: {
    label: '금(金)',
    tone: 'text-sky-200 bg-sky-500/10 border-sky-300/20',
    bar: 'bg-sky-300',
  },
  water: {
    label: '수(水)',
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
    recommendation: '강하게 드러나는 기운은 활용하고, 상대적으로 적게 드러나는 기운은 생활 루틴에서 부드럽게 보완하는 흐름이 좋습니다.',
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
              <h2 className="mt-1 text-2xl font-black text-white">오행 밸런스</h2>
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
                강하게 드러남
              </div>
              <p className="text-lg font-black text-white">{formatElementLabels(resolvedProfile.dominant)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-500">
                <BadgeCheck size={14} />
                보완 포인트
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
              <div key={type} className="grid grid-cols-[4.5rem_1fr_1.5rem] items-center gap-3">
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
            <p className="break-keep text-sm font-medium leading-relaxed text-gray-300">
              이 숫자는 사주 {timeKnown ? '8글자' : '6글자'}에 나타난 오행의 분포를 단순화한 참고 지표입니다. 숫자가 높다고 무조건 좋고, 낮다고 나쁜 것은 아닙니다. 전체 조합 안에서 어떤 기운이 강하게 드러나고, 어떤 기운을 보완하면 균형이 좋아지는지 함께 봅니다.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {ELEMENT_ORDER.map((type) => {
              const meta = fiveElements[type];
              const isSupport = (resolvedProfile.missing.length > 0 ? resolvedProfile.missing : resolvedProfile.weak).includes(type);
              const isStrong = resolvedProfile.dominant.includes(type);

              return (
                <div key={`${type}-meaning`} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-black text-white">{meta.display}</p>
                    {(isSupport || isStrong) && (
                      <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black text-gray-300">
                        {isSupport ? '보완 포인트' : '강하게 드러남'}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 break-keep text-xs font-medium leading-5 text-gray-400">
                    {meta.description}
                  </p>
                </div>
              );
            })}
          </div>

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
