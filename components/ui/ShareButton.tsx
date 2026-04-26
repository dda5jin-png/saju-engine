'use client';

import { useState } from 'react';
import { Share2, Link as LinkIcon, Check } from 'lucide-react';

interface Props {
  url?: string;
  title?: string;
  description?: string;
  className?: string;
}

export default function ShareButton({ url, title, description, className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = title || '내 사주 구조 분석 결과 확인하기';
  const shareText = description || '우리는 모두 각자만의 독특한 구조를 가지고 태어납니다.';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={handleShare}
        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg active:scale-95"
      >
        <Share2 size={20} />
        <span>결과 공유하기</span>
      </button>
      
      <button
        onClick={copyToClipboard}
        className="w-16 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all border border-slate-700 active:scale-95"
        title="링크 복사"
      >
        {copied ? <Check size={20} className="text-emerald-400" /> : <LinkIcon size={20} />}
      </button>
    </div>
  );
}
