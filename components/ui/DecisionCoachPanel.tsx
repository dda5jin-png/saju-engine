'use client';

import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { ArrowRight, BrainCircuit, Loader2, LockKeyhole } from 'lucide-react';
import { subscribeToAuthChanges } from '@/lib/auth';
import AuthModal from '@/components/auth/AuthModal';
import PremiumGate from '@/components/premium/PremiumGate';
import { DecisionCategory, DecisionCoachResult } from '@/types/saju';

type ApiResponse = {
  success: boolean;
  message?: string;
  paywall?: boolean;
  category?: DecisionCategory;
  decision?: DecisionCoachResult;
  remainingFreeUses?: number | null;
  premiumActive?: boolean;
};

interface Props {
  resultId: string;
}

const categories: { id: DecisionCategory; label: string }[] = [
  { id: 'general', label: '선택' },
  { id: 'love', label: '연애/관계' },
  { id: 'money', label: '돈/투자' },
  { id: 'career', label: '일/커리어' },
];

export default function DecisionCoachPanel({ resultId }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [category, setCategory] = useState<DecisionCategory>('general');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DecisionCoachResult | null>(null);
  const [message, setMessage] = useState('');
  const [paywall, setPaywall] = useState(false);
  const [remainingFreeUses, setRemainingFreeUses] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      setUser(nextUser);
    });
    return () => unsubscribe();
  }, []);

  const runDecisionCoach = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (question.trim().length < 6) {
      setMessage('상황을 조금 더 구체적으로 적어주세요.');
      return;
    }

    setLoading(true);
    setMessage('');
    setPaywall(false);

    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/decision-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          resultId,
          question,
          category,
        }),
      });

      const data = (await res.json()) as ApiResponse;

      if (data.paywall) {
        setPaywall(true);
        setMessage(data.message || '이 분석은 더 깊게 들어갈수록 정확해진다');
        return;
      }

      if (!data.success || !data.decision) {
        setMessage(data.message || 'Decision Coach 실행에 실패했습니다.');
        return;
      }

      setResult(data.decision);
      setRemainingFreeUses(typeof data.remainingFreeUses === 'number' ? data.remainingFreeUses : null);
    } catch (error) {
      console.error('Decision coach request failed:', error);
      setMessage('Decision Coach 실행 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-5 rounded-[2rem] border border-white/10 bg-[#080b12] p-6 md:p-8">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-[11px] font-bold text-emerald-100">
          <BrainCircuit size={14} />
          DECISION COACH MODE
        </span>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">지금 선택이 맞는지 확인해볼래?</h2>
          <p className="text-sm leading-6 text-white/58">
            같은 사주라도 상황이 바뀌면 답은 달라진다. 지금 고민을 적으면 선택지별 흐름과 리스크를 나눠드립니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {categories.map((item) => (
          <button
            key={item.id}
            onClick={() => setCategory(item.id)}
            className={`rounded-2xl px-3 py-3 text-xs font-extrabold transition ${
              category === item.id
                ? 'bg-emerald-400 text-black'
                : 'border border-white/10 bg-white/[0.035] text-white/58'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <textarea
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        rows={5}
        placeholder="예: 지금 이직을 해야 할까, 아니면 3개월 더 버티는 게 맞을까? / 연락을 다시 해볼까, 거리를 둘까?"
        className="w-full resize-none rounded-3xl border border-white/10 bg-black/35 p-5 text-[15px] leading-7 text-white outline-none placeholder:text-white/28 focus:border-emerald-300/60"
      />

      <button
        onClick={runDecisionCoach}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-4 font-black text-black transition active:scale-95 disabled:opacity-50"
      >
        {loading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
        {loading ? '상황 분석 중...' : 'Decision Coach 실행'}
      </button>

      {!user && (
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold text-white/58">
          <LockKeyhole size={16} />
          질문 분석은 로그인 후 무료 1회 사용할 수 있습니다.
        </div>
      )}

      {typeof remainingFreeUses === 'number' && (
        <p className="text-center text-xs font-bold text-white/42">
          무료 질문 {remainingFreeUses}회 남음
        </p>
      )}

      {message && (
        <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm font-extrabold text-amber-100">
          {message}
        </div>
      )}

      {result && <DecisionResultView result={result} />}

      {paywall && <PremiumGate />}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(nextUser) => setUser(nextUser)}
      />
    </section>
  );
}

function DecisionResultView({ result }: { result: DecisionCoachResult }) {
  return (
    <div className="space-y-5 border-t border-white/10 pt-6">
      {result.decision_basis && (
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-xs font-extrabold leading-5 text-emerald-50">
          {result.decision_basis}
        </div>
      )}

      <DecisionSection title="현재 상황 해석" content={result.situation} />

      <div className="space-y-3">
        <h3 className="text-sm font-black text-white/88">선택지 분석</h3>
        <div className="grid gap-3">
          {result.choices.map((choice, index) => (
            <article key={choice.label} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
              <h4 className="font-black text-white">
                {index + 1}. {choice.label}
              </h4>
              <dl className="mt-4 space-y-3 text-sm leading-6 text-white/64">
                <div>
                  <dt className="font-extrabold text-white/82">예상 흐름</dt>
                  <dd>{choice.expected_flow}</dd>
                </div>
                <div>
                  <dt className="font-extrabold text-white/82">장점</dt>
                  <dd>{choice.pros}</dd>
                </div>
                <div>
                  <dt className="font-extrabold text-white/82">단점</dt>
                  <dd>{choice.cons}</dd>
                </div>
                {choice.when_to_choose && (
                  <div>
                    <dt className="font-extrabold text-white/82">이 선택이 맞는 조건</dt>
                    <dd>{choice.when_to_choose}</dd>
                  </div>
                )}
                {choice.first_action && (
                  <div>
                    <dt className="font-extrabold text-white/82">첫 행동</dt>
                    <dd>{choice.first_action}</dd>
                  </div>
                )}
                {choice.watch_signal && (
                  <div>
                    <dt className="font-extrabold text-white/82">주의 신호</dt>
                    <dd>{choice.watch_signal}</dd>
                  </div>
                )}
              </dl>
            </article>
          ))}
        </div>
      </div>

      <DecisionSection title="추천 행동" content={result.recommended_action} />
      <DecisionSection title="리스크 경고" content={result.risk_warning} warning />
      {result.avoid_action && <DecisionSection title="피해야 할 행동" content={result.avoid_action} warning />}
      <div className="rounded-3xl bg-white p-5 text-center">
        <p className="text-xs font-black text-black/45">한줄 가이드</p>
        <p className="mt-2 text-xl font-black text-black">{result.one_line_guide}</p>
      </div>
      <p className="whitespace-pre-line text-center text-sm font-bold leading-6 text-white/50">
        {result.closing_message}
      </p>
    </div>
  );
}

function DecisionSection({ title, content, warning = false }: { title: string; content: string; warning?: boolean }) {
  return (
    <article className={`rounded-3xl border p-5 ${
      warning
        ? 'border-red-300/20 bg-red-300/10'
        : 'border-white/10 bg-white/[0.035]'
    }`}>
      <h3 className="text-sm font-black text-white/88">{title}</h3>
      <p className="mt-3 text-[15px] leading-7 text-white/66 break-keep">{content}</p>
    </article>
  );
}
