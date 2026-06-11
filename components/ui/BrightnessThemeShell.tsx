'use client';

import { ReactNode, useSyncExternalStore } from 'react';
import { Moon, SunMedium } from 'lucide-react';

const STORAGE_KEY = 'orabit:brightness-mode';
const CHANGE_EVENT = 'orabit:brightness-change';

type BrightnessMode = 'light' | 'dark';

interface Props {
  children: ReactNode;
  className?: string;
}

function getStoredMode(): BrightnessMode {
  const savedMode = window.localStorage.getItem(STORAGE_KEY);
  return savedMode === 'dark' ? 'dark' : 'light';
}

function getServerMode(): BrightnessMode {
  return 'light';
}

function subscribeToMode(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

export default function BrightnessThemeShell({ children, className = '' }: Props) {
  const mode = useSyncExternalStore(subscribeToMode, getStoredMode, getServerMode);

  const darkMode = mode === 'dark';

  const toggleMode = () => {
    const nextMode: BrightnessMode = darkMode ? 'light' : 'dark';
    window.localStorage.setItem(STORAGE_KEY, nextMode);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return (
    <div className={`result-theme ${darkMode ? 'result-theme-dark' : 'result-theme-light'} ${className}`}>
      <div data-share-exclude className="brightness-toggle-wrap z-[70]">
        <button
          type="button"
          aria-pressed={darkMode}
          aria-label="밝기 조정"
          onClick={toggleMode}
          className="brightness-toggle inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-black transition active:scale-95 sm:gap-2 sm:px-3.5 sm:text-xs"
        >
          {darkMode ? <SunMedium size={15} /> : <Moon size={15} />}
          <span>{darkMode ? '밝게' : '다크'}</span>
          <span className="brightness-toggle-state hidden sm:inline">보기</span>
        </button>
      </div>
      {children}
    </div>
  );
}
