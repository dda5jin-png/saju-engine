'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FirebaseError } from 'firebase/app';
import {
  createPersonalEmailAccount,
  signInWithGoogle,
  signInWithPersonalEmail,
} from '@/lib/auth';
import { Mail, X } from 'lucide-react';
import { useState } from 'react';
import { User } from 'firebase/auth';
import Image from 'next/image';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

function getAuthErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof FirebaseError)) return fallback;

  const messages: Record<string, string> = {
    'auth/unauthorized-domain':
      '현재 도메인이 Firebase 승인 도메인에 등록되지 않았습니다. Firebase Authentication 설정에서 orabit.info를 추가해주세요.',
    'auth/operation-not-allowed':
      'Firebase에서 해당 로그인 제공업체가 아직 활성화되지 않았습니다. Google 로그인 또는 이메일/비밀번호 제공업체를 사용 설정해주세요.',
    'auth/popup-closed-by-user': '로그인 창이 닫혔습니다. 다시 시도해주세요.',
    'auth/popup-blocked': '브라우저가 로그인 팝업을 차단했습니다. 팝업 허용 후 다시 시도해주세요.',
    'auth/account-exists-with-different-credential':
      '이미 다른 로그인 방식으로 가입된 이메일입니다. 기존 방식으로 로그인해주세요.',
    'auth/invalid-api-key':
      'Firebase API Key 설정이 올바르지 않습니다. Vercel 환경변수 NEXT_PUBLIC_FIREBASE_API_KEY를 확인해주세요.',
    'auth/invalid-email': '이메일 주소 형식이 올바르지 않습니다.',
    'auth/user-not-found': '가입되지 않은 이메일입니다. 회원가입으로 진행해주세요.',
    'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
    'auth/email-already-in-use': '이미 가입된 이메일입니다. 로그인으로 진행해주세요.',
    'auth/weak-password': '비밀번호는 6자 이상으로 입력해주세요.',
  };

  return messages[error.code] || `${fallback}\n오류 코드: ${error.code}`;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: Props) {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'email' | null>(null);
  const [emailMode, setEmailMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const completeLogin = async (user: User) => {
    const idToken = await user.getIdToken();
    const res = await fetch('/api/auth/sync-user', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      throw new Error(data?.message || '회원 정보 동기화에 실패했습니다.');
    }

    onSuccess(user);
    onClose();
  };

  const handleGoogleLogin = async () => {
    setLoadingProvider('google');
    try {
      const user = await signInWithGoogle();
      if (user) {
        await completeLogin(user);
      }
    } catch (error) {
      console.error('Google login failed:', error);
      alert(
        error instanceof Error && !(error instanceof FirebaseError)
          ? error.message
          : getAuthErrorMessage(error, 'Google 로그인에 실패했습니다. 다시 시도해주세요.'),
      );
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 6) {
      alert('비밀번호는 6자 이상으로 입력해주세요.');
      return;
    }

    setLoadingProvider('email');
    try {
      const user =
        emailMode === 'signin'
          ? await signInWithPersonalEmail(email.trim(), password)
          : await createPersonalEmailAccount(email.trim(), password);
      await completeLogin(user);
    } catch (error) {
      console.error('Email login failed:', error);
      alert(
        error instanceof Error && !(error instanceof FirebaseError)
          ? error.message
          : getAuthErrorMessage(
              error,
              emailMode === 'signin' ? '이메일 로그인에 실패했습니다.' : '이메일 회원가입에 실패했습니다.',
            ),
      );
    } finally {
      setLoadingProvider(null);
    }
  };

  const loading = loadingProvider !== null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="auth-modal fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-slate-950 border border-slate-800 rounded-[2rem] p-6 shadow-2xl overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute right-6 top-6 text-gray-500 hover:text-white transition-colors"
              aria-label="닫기"
            >
              <X size={24} />
            </button>

            <div className="relative space-y-5">
              <div className="space-y-2">
                <h3 className="pr-10 text-2xl font-black text-white tracking-tight">로그인 후 확인하기</h3>
                <p className="text-gray-400 text-sm leading-6">
                  당신만의 고유한 구조 데이터를<br />분실하지 않도록 안전하게 저장합니다.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex min-h-14 items-center justify-center gap-3 bg-white hover:bg-gray-100 text-black font-extrabold rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  <Image
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    width={20}
                    height={20}
                    alt=""
                    aria-hidden="true"
                  />
                  <span>{loadingProvider === 'google' ? 'Google 연결 중...' : 'Google로 계속하기'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[11px] font-bold text-white/35">개인 이메일</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
                  <button
                    type="button"
                    onClick={() => setEmailMode('signin')}
                    className={`rounded-xl py-2 text-xs font-extrabold transition ${
                      emailMode === 'signin' ? 'bg-white text-black' : 'text-white/50'
                    }`}
                  >
                    로그인
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailMode('signup')}
                    className={`rounded-xl py-2 text-xs font-extrabold transition ${
                      emailMode === 'signup' ? 'bg-white text-black' : 'text-white/50'
                    }`}
                  >
                    회원가입
                  </button>
                </div>

                <label className="block">
                  <span className="sr-only">이메일</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="이메일 주소"
                    autoComplete="email"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/28 focus:border-white/30"
                  />
                </label>

                <label className="block">
                  <span className="sr-only">비밀번호</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="비밀번호 6자 이상"
                    autoComplete={emailMode === 'signin' ? 'current-password' : 'new-password'}
                    required
                    minLength={6}
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/28 focus:border-white/30"
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.07] text-sm font-extrabold text-white transition hover:bg-white/[0.1] active:scale-95 disabled:opacity-50"
                >
                  <Mail size={17} />
                  {loadingProvider === 'email'
                    ? '처리 중...'
                    : emailMode === 'signin'
                      ? '이메일로 로그인'
                      : '이메일로 회원가입'}
                </button>
              </form>

              <div className="pt-2">
                <p className="text-center text-[10px] text-gray-600 leading-relaxed">
                  로그인하면 서비스 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
