'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SajuInput } from '@/types/saju';
import AnalysisLoading from './AnalysisLoading';
import { AnimatePresence, motion } from 'framer-motion';
import { SajuAnalysis } from '@/types/saju';

interface AnalyzeResponse {
  id?: string;
  analysis?: SajuAnalysis;
  persisted?: boolean;
  error?: string;
}

function isValidBirthDateParts(parts: { year: string; month: string; day: string }) {
  if (parts.year.length !== 4 || parts.month.length !== 2 || parts.day.length !== 2) {
    return false;
  }

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export default function SajuInputForm() {
  const router = useRouter();
  const monthInputRef = useRef<HTMLInputElement>(null);
  const dayInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [form, setForm] = useState<SajuInput>({
    birthDate: '',
    birthTime: '',
    gender: 'male'
  });
  const [birthDateParts, setBirthDateParts] = useState({
    year: '',
    month: '',
    day: '',
  });

  const updateBirthDatePart = (
    part: keyof typeof birthDateParts,
    value: string,
    maxLength: number,
    nextInput?: React.RefObject<HTMLInputElement | null>,
  ) => {
    const numericValue = value.replace(/\D/g, '').slice(0, maxLength);
    const nextParts = { ...birthDateParts, [part]: numericValue };
    const birthDate =
      isValidBirthDateParts(nextParts)
        ? `${nextParts.year}-${nextParts.month}-${nextParts.day}`
        : '';

    setBirthDateParts(nextParts);
    setForm({ ...form, birthDate });

    if (numericValue.length === maxLength) {
      nextInput?.current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = (await res.json()) as AnalyzeResponse;
      
      if (!res.ok || !data.id) {
        throw new Error(data.error || '분석 실패');
      }

      if (data.analysis && data.persisted === false) {
        sessionStorage.setItem(`saju:analysis:${data.id}`, JSON.stringify(data.analysis));
      }

      // 의도적 지연 후 이동 (사용자에게 분석 중임을 인지시킴)
      setTimeout(() => {
        router.push(`/result/${data.id}`);
      }, 3000);
      
    } catch (error) {
      console.error('Analysis failed', error);
      setStatus('error');
      alert('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence>
        {status === 'loading' && <AnalysisLoading />}
      </AnimatePresence>
      
      <motion.form 
        onSubmit={handleSubmit} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-[2.5rem] space-y-8 border-white/10 shadow-2xl relative overflow-hidden"
      >
        {/* 장식용 빛 효과 */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D6B46A]/[0.18] blur-[64px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#1F2A44]/10 blur-[64px] rounded-full" />

        <div className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-bold text-[#9A6D22] uppercase tracking-widest mb-3 ml-1">
              생년월일
            </label>
            <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-3">
              <input
                required
                aria-label="출생 연도"
                type="text"
                inputMode="numeric"
                autoComplete="bday-year"
                placeholder="YYYY"
                value={birthDateParts.year}
                onChange={(e) => updateBirthDatePart('year', e.target.value, 4, monthInputRef)}
                className="min-w-0 bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-[#D6B46A]/45 focus:border-[#D6B46A]/45 focus:bg-white/10 outline-none transition-all text-lg"
              />
              <input
                required
                ref={monthInputRef}
                aria-label="출생 월"
                type="text"
                inputMode="numeric"
                autoComplete="bday-month"
                placeholder="MM"
                value={birthDateParts.month}
                onChange={(e) => updateBirthDatePart('month', e.target.value, 2, dayInputRef)}
                className="min-w-0 bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-[#D6B46A]/45 focus:border-[#D6B46A]/45 focus:bg-white/10 outline-none transition-all text-lg"
              />
              <input
                required
                ref={dayInputRef}
                aria-label="출생 일"
                type="text"
                inputMode="numeric"
                autoComplete="bday-day"
                placeholder="DD"
                value={birthDateParts.day}
                onChange={(e) => updateBirthDatePart('day', e.target.value, 2)}
                className="min-w-0 bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-[#D6B46A]/45 focus:border-[#D6B46A]/45 focus:bg-white/10 outline-none transition-all text-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#9A6D22] uppercase tracking-widest mb-3 ml-1">
              태어난 시간 (선택)
            </label>
            <input
              type="time"
              value={form.birthTime}
              onChange={(e) => setForm({ ...form, birthTime: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-[#D6B46A]/45 focus:border-[#D6B46A]/45 focus:bg-white/10 outline-none transition-all text-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#9A6D22] uppercase tracking-widest mb-3 ml-1">
              나의 성별
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['male', 'female'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm({ ...form, gender: g })}
                  className={`py-4 rounded-2xl border font-bold transition-all ${
                    form.gender === g 
                      ? 'bg-[#1F2A44] border-[#D6B46A]/55 text-[var(--result-accent-contrast)] shadow-lg shadow-[#1F2A44]/20 scale-[1.02]' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-[#D6B46A]/35 hover:bg-[#D6B46A]/10'
                  }`}
                >
                  {g === 'male' ? '남성' : '여성'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={status === 'loading' || !form.birthDate}
          className="w-full relative group"
        >
          <div className="absolute -inset-1 bg-[linear-gradient(135deg,rgba(214,180,106,0.42),rgba(31,42,68,0.28))] rounded-2xl blur opacity-45 group-hover:opacity-75 transition duration-700" />
          <div className="relative w-full bg-[linear-gradient(135deg,#1F2A44_0%,#263554_54%,#A77C2F_100%)] text-[var(--result-accent-contrast)] font-black py-5 rounded-2xl shadow-xl shadow-[#1F2A44]/20 flex items-center justify-center gap-3 transition-all active:scale-[0.97]">
            {status === 'loading' ? (
              <span className="animate-pulse">ORABIT 분석 가동 중...</span>
            ) : (
              <>
                <span className="text-lg">내 사주 보석 리포트 보기</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </div>
        </button>

        <p className="text-center text-[10px] text-gray-500 font-medium tracking-tight relative z-10 leading-relaxed">
          제공된 데이터는 리포트 생성을 위해서만<br /> 사용되며 별도로 외부에 노출되지 않습니다.
        </p>
      </motion.form>
    </div>
  );
}
