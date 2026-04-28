'use client';

import { useState } from 'react';
import { toPng } from 'html-to-image';
import { Check, ImageDown, Link as LinkIcon, Loader2, Share2 } from 'lucide-react';

interface Props {
  url?: string;
  title?: string;
  description?: string;
  captureTargetId?: string;
  fileName?: string;
  className?: string;
}

export default function ShareButton({
  url,
  title,
  description,
  captureTargetId,
  fileName = 'saju-result.png',
  className = "",
}: Props) {
  const [copied, setCopied] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = title || '내 사주 구조 분석 결과 확인하기';
  const shareText = description || '우리는 모두 각자만의 독특한 구조를 가지고 태어납니다.';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const captureResultImage = async () => {
    if (!captureTargetId) return null;

    const node = document.getElementById(captureTargetId);
    if (!node) return null;

    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: Math.min(window.devicePixelRatio || 2, 2),
      backgroundColor: '#000000',
      filter: (element) => !element.hasAttribute('data-share-exclude'),
    });

    const blob = await (await fetch(dataUrl)).blob();
    return new File([blob], fileName, { type: 'image/png' });
  };

  const downloadImage = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(imageUrl);
  };

  const handleShare = async () => {
    setCapturing(true);

    try {
      const imageFile = await captureResultImage();
      const canShareImage = Boolean(
        imageFile &&
          navigator.canShare &&
          navigator.canShare({ files: [imageFile] }),
      );

      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
          ...(canShareImage && imageFile ? { files: [imageFile] } : {}),
        });
        return;
      }

      if (imageFile) {
        downloadImage(imageFile);
        return;
      }

      await copyToClipboard();
    } catch (err) {
      if ((err as DOMException).name !== 'AbortError') {
        console.error('Error sharing:', err);
        await copyToClipboard();
      }
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={handleShare}
        disabled={capturing}
        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:text-white/60 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg active:scale-95"
      >
        {capturing ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
        <span>{capturing ? '공유 이미지 생성 중' : '분석 링크 공유하기'}</span>
      </button>

      <button
        onClick={copyToClipboard}
        className="w-16 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all border border-slate-700 active:scale-95"
        title="링크 복사"
      >
        {copied ? <Check size={20} className="text-emerald-400" /> : <LinkIcon size={20} />}
      </button>

      {captureTargetId && (
        <button
          onClick={handleShare}
          disabled={capturing}
          className="w-16 flex items-center justify-center bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-white rounded-2xl transition-all border border-slate-700 active:scale-95"
          title="이미지 공유"
        >
          {capturing ? <Loader2 size={20} className="animate-spin" /> : <ImageDown size={20} />}
        </button>
      )}
    </div>
  );
}
