'use client';

import { useState } from 'react';
import { toPng } from 'html-to-image';
import { Check, ImageDown, Link as LinkIcon, Loader2 } from 'lucide-react';

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
  fileName = 'orabit-result.png',
  className = "",
}: Props) {
  const [copied, setCopied] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [notice, setNotice] = useState('');

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = title || 'ORABIT 사주 오행 보석 리포트 확인하기';
  const shareText = description || '사주의 오행 흐름을 색, 보석, 주얼리 선택으로 연결합니다.';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setNotice('링크가 생성되었습니다');
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setNotice(''), 2600);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      setNotice('링크 생성에 실패했습니다');
      setTimeout(() => setNotice(''), 2600);
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

  const handleGenerateLink = async () => {
    await copyToClipboard();
  };

  const handleImageShare = async () => {
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
        setNotice('공유 이미지가 생성되었습니다');
        setTimeout(() => setNotice(''), 2600);
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
    <div className={`relative w-full space-y-3 ${className}`}>
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-emerald-400/30 bg-emerald-400/12 px-5 py-4 text-center text-sm font-extrabold text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.16)]"
        >
          {notice}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleGenerateLink}
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          {copied ? <Check size={20} /> : <LinkIcon size={20} />}
          <span>{copied ? '링크 생성 완료' : '공유 링크 생성하기'}</span>
        </button>

        <button
          onClick={handleImageShare}
          disabled={capturing}
          className="w-16 flex items-center justify-center bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-white rounded-2xl transition-all border border-slate-700 active:scale-95"
          title="리포트 이미지 공유"
        >
          {capturing ? <Loader2 size={20} className="animate-spin" /> : <ImageDown size={20} />}
        </button>

      </div>

      <p className="text-center text-xs leading-5 text-white/45">
        링크를 생성하면 바로 클립보드에 복사됩니다.
      </p>
    </div>
  );
}
