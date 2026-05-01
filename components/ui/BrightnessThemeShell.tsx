'use client';

import { ReactNode, useState } from 'react';
import { Moon, SunMedium } from 'lucide-react';

const STORAGE_KEY = 'orabit:brightness-mode';

type BrightnessMode = 'light' | 'dark';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function BrightnessThemeShell({ children, className = '' }: Props) {
  const [mode, setMode] = useState<BrightnessMode>(() => {
    if (typeof window === 'undefined') return 'light';

    const savedMode = window.localStorage.getItem(STORAGE_KEY);
    if (savedMode === 'dark' || savedMode === 'light') {
      return savedMode;
    }

    return 'light';
  });

  const darkMode = mode === 'dark';

  const toggleMode = () => {
    const nextMode: BrightnessMode = darkMode ? 'light' : 'dark';
    setMode(nextMode);
    window.localStorage.setItem(STORAGE_KEY, nextMode);
  };

  return (
    <div className={`result-theme ${darkMode ? 'result-theme-dark' : 'result-theme-light'} ${className}`}>
      <div data-share-exclude className="brightness-toggle-wrap z-[70]">
        <button
          type="button"
          aria-pressed={darkMode}
          aria-label="밝기 조정"
          onClick={toggleMode}
          className="brightness-toggle inline-flex items-center gap-1.5 rounded-full border px-2.5 py-2 text-[11px] font-black transition active:scale-95 sm:gap-2 sm:px-3 sm:text-xs"
        >
          {darkMode ? <SunMedium size={15} /> : <Moon size={15} />}
          <span>밝기 조정</span>
          <span className="brightness-toggle-state hidden sm:inline">{darkMode ? '밝게 보기' : '다크로 보기'}</span>
        </button>
      </div>
      {children}
    </div>
  );
}
