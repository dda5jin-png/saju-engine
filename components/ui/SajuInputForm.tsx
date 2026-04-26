'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SajuInput } from '@/types/saju';
import AnalysisLoading from './AnalysisLoading';
import { AnimatePresence } from 'framer-motion';

export default function SajuInputForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<SajuInput>({
    birthDate: '',
    birthTime: '',
    gender: 'male'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. API 호출과 동시에 최소 대기 시간 확보
      const [res] = await Promise.all([
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        }),
        new Promise(resolve => setTimeout(resolve, 3000)) // 의도적 지연 3초
      ]);
      
      const { id } = await res.json();
      router.push(`/result/${id}`);
    } catch (error) {
      console.error('Analysis failed', error);
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {loading && <AnalysisLoading />}
      </AnimatePresence>
      
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">생년월일</label>
          <input
            required
            type="date"
            value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">태어난 시간 (선택)</label>
          <input
            type="time"
            value={form.birthTime}
            onChange={(e) => setForm({ ...form, birthTime: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">성별</label>
          <div className="grid grid-cols-2 gap-4">
            {(['male', 'female'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setForm({ ...form, gender: g })}
                className={`py-3 rounded-xl border transition-all ${
                  form.gender === g 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-slate-900 border-slate-700 text-gray-400'
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
        disabled={loading || !form.birthDate}
        className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-all active:scale-[0.98]"
      >
        {loading ? '구조를 분석 중입니다...' : '내 사주 분석하기'}
      </button>
    </form>
    </>
  );
}
