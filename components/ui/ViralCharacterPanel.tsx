'use client';

import { useMemo, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Link as LinkIcon, Loader2, MessageCircle } from 'lucide-react';
import { SajuAnalysis, ViralCharacterMode } from '@/types/saju';
import { SITE_DOMAIN, SITE_NAME } from '@/lib/site';
import { recommendJewelry } from '@/src/utils/recommendJewelry';

interface Props {
  analysis: SajuAnalysis;
  resultUrl: string;
  resultId: string;
}

const fallbackViral = (analysis: SajuAnalysis): ViralCharacterMode => ({
  character_type: `${analysis.type_name} 캐릭터`,
  character_definition:
    '넌 아무 생각 없이 움직이는 타입은 아니다.\n\n상황을 보고, 조건을 맞추고, 확신이 생겼을 때 움직인다.',
  decision_style:
    '빠른 선택보다 틀리지 않는 선택을 선호한다.\n\n그래서 느려 보일 수 있지만, 한번 확신이 들면 오래 밀고 간다.',
  similar_character:
    '전략가형 캐릭터에 가깝다. 앞에서 무작정 싸우기보다 판을 읽고 구조를 짠 다음 들어가는 사람이다.',
  outsider_quotes: [
    '얘는 아무 생각 없이 움직이는 애는 절대 아님.',
    '근데 너무 계산하다가 기회 놓칠 때 있음.',
    '그래도 한번 확신 들면 진짜 무섭게 밀어붙임.',
  ],
  one_liner: '확신 없으면 절대 안 움직이는 타입',
  share_lines: [
    '확신 없으면 절대 안 움직이는 타입',
    '기회보다 확률을 먼저 계산하는 사람',
    '준비 끝나면 크게 움직이는 스타일',
  ],
});

export default function ViralCharacterPanel({ analysis, resultUrl, resultId }: Props) {
  const viral = useMemo(() => analysis.viral_character ?? fallbackViral(analysis), [analysis]);
  const jewelry = useMemo(() => recommendJewelry(analysis.element_distribution), [analysis.element_distribution]);
  const shareLines = useMemo(() => {
    const lines = viral.share_lines.length > 0 ? viral.share_lines : [viral.one_liner];
    return lines.map((line) => (
      line
        .replace('애매하면 자르고 가는 사람', '애매함을 정리하고 필요한 것만 남기는 사람')
        .replace('칼같아서 무서움', '기준이 선명해서 단호해 보임')
        .replace('빡빡하다는', '기준이 높다는')
    ));
  }, [viral.share_lines, viral.one_liner]);
  const [selectedLine, setSelectedLine] = useState(shareLines[0]);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const shareCardId = `share-card-${resultId}`;

  const showNotice = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 2600);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(resultUrl);
      showNotice('링크가 복사되었습니다');
    } catch (error) {
      console.error('Failed to copy result link:', error);
      showNotice('링크 복사에 실패했습니다');
    }
  };

  const makeCardFile = async () => {
    const node = document.getElementById(shareCardId);
    if (!node) return null;

    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: Math.min(window.devicePixelRatio || 2, 2),
      backgroundColor: '#f8fafc',
    });
    const blob = await (await fetch(dataUrl)).blob();
    return new File([blob], `orabit-character-${resultId}.png`, { type: 'image/png' });
  };

  const saveImage = async () => {
    setSaving(true);
    try {
      const file = await makeCardFile();
      if (!file) return;

      const imageUrl = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(imageUrl);
      showNotice('캐릭터 카드 이미지가 저장되었습니다');
    } catch (error) {
      console.error('Failed to save share card:', error);
      showNotice('이미지 저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const shareToKakao = async () => {
    const shareText = `${selectedLine}\n${viral.character_type}\n${resultUrl}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${SITE_NAME} INSIGHT - ${viral.character_type}`,
          text: shareText,
          url: resultUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareText);
      showNotice('공유 문구가 복사되었습니다. 카카오톡에 붙여넣어 주세요');
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') {
        console.error('Failed to share:', error);
        showNotice('공유를 준비하지 못했습니다');
      }
    }
  };

  return (
    <section className="space-y-6" data-share-exclude>
      <div className="rounded-[2rem] border border-[color:var(--result-border)] bg-[var(--result-surface-strong)] p-6 shadow-2xl md:p-8">
        <div className="space-y-3 border-b border-[color:var(--result-border)] pb-6">
          <span className="inline-flex rounded-full border border-fuchsia-300/25 bg-fuchsia-300/10 px-3 py-1 text-[11px] font-bold text-fuchsia-700">
            SHARE CHARACTER CARD
          </span>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[var(--result-text)]">공유용 캐릭터 카드</h2>
            <p className="text-sm leading-6 text-[color:var(--result-muted)]">
              사주 용어를 줄이고 친구에게 바로 공유하기 좋은 문장으로 정리했습니다.
            </p>
          </div>
        </div>

        <div className="divide-y divide-[color:var(--result-border)]">
          <ViralBlock title="캐릭터 정의" content={viral.character_definition} />
          <ViralBlock title="의사결정 방식" content={viral.decision_style} />
          <ViralBlock title="닮은 캐릭터" content={viral.similar_character} />
          <article className="py-5">
            <h3 className="text-sm font-extrabold text-[var(--result-text)]">주변 사람이 보는 너</h3>
            <div className="mt-3 space-y-2">
              {viral.outsider_quotes.map((quote) => (
                <p key={quote} className="rounded-2xl border border-[color:var(--result-border)] bg-[var(--result-soft)] px-4 py-3 text-[15px] leading-6 text-[color:var(--result-muted)]">
                  &ldquo;{quote}&rdquo;
                </p>
              ))}
            </div>
          </article>
          <article className="py-5">
            <h3 className="text-sm font-extrabold text-[var(--result-text)]">공유용 한줄 문장</h3>
            <div className="mt-3 grid gap-2">
              {shareLines.map((line, index) => (
                <button
                  key={line}
                  onClick={() => setSelectedLine(line)}
                  className={`rounded-2xl border px-4 py-3 text-left text-[15px] font-bold leading-6 transition ${
                    selectedLine === line
                      ? 'border-emerald-300/60 bg-emerald-300/12 text-emerald-700'
                      : 'border-[color:var(--result-border)] bg-[var(--result-soft)] text-[color:var(--result-muted)] hover:brightness-95'
                  }`}
                >
                  {index + 1}) {line}
                </button>
              ))}
            </div>
          </article>
        </div>
      </div>

      <div className="space-y-4">
        <div
          id={shareCardId}
          className="aspect-square rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_20%_18%,rgba(20,184,166,0.16),transparent_30%),radial-gradient(circle_at_82%_78%,rgba(245,158,11,0.16),transparent_34%),linear-gradient(145deg,#ffffff,#f4f8fb_48%,#eef7f5)] p-7 shadow-2xl flex flex-col justify-between overflow-hidden text-slate-950"
        >
          <div className="flex items-center justify-between text-[11px] font-black tracking-[0.14em] text-slate-500">
            <span>{SITE_NAME} INSIGHT</span>
            <span>{String(new Date().getFullYear())}</span>
          </div>
          <div className="space-y-5 text-center">
            <p className="mx-auto max-w-[15rem] text-[2rem] font-black leading-[1.22] text-slate-950 md:max-w-[18rem] md:text-[2.6rem] break-keep">
              {selectedLine}
            </p>
            <div className="mx-auto h-px w-16 bg-slate-300" />
          </div>
          <div className="text-center">
            <p className="text-sm font-extrabold text-slate-700">{viral.character_type}</p>
            <p className="mt-2 text-xs font-bold text-slate-500">추천 보석: {jewelry.primaryGem.name}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">보완 포인트: {jewelry.supportElementInfo?.keywords?.slice(0, 2).join('과 ')}</p>
            <p className="mt-3 text-[11px] font-semibold text-slate-400">{SITE_DOMAIN}</p>
          </div>
        </div>

        {notice && (
          <div role="status" aria-live="polite" className="rounded-2xl border border-emerald-400/30 bg-emerald-400/12 px-5 py-4 text-center text-sm font-extrabold text-emerald-700">
            {notice}
          </div>
        )}

        <div id="share-card-actions" className="grid grid-cols-3 gap-2">
          <button
            onClick={saveImage}
            disabled={saving}
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl bg-[var(--result-text)] text-xs font-extrabold text-[var(--result-accent-contrast)] transition active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            카드 이미지 저장
          </button>
          <button
            onClick={copyLink}
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl border border-[color:var(--result-border)] bg-[var(--result-surface)] text-xs font-extrabold text-[var(--result-text)] transition active:scale-95"
          >
            <LinkIcon size={18} />
            결과 링크 복사
          </button>
          <button
            onClick={shareToKakao}
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl bg-[#fee500] text-xs font-extrabold text-black transition active:scale-95 shadow-[0_0_24px_rgba(254,229,0,0.18)]"
          >
            <MessageCircle size={18} />
            카카오톡 공유
          </button>
        </div>
      </div>
    </section>
  );
}

function ViralBlock({ title, content }: { title: string; content: string }) {
  return (
    <article className="py-5">
      <h3 className="text-sm font-extrabold text-[var(--result-text)]">{title}</h3>
      <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-[color:var(--result-muted)] break-keep">
        {content}
      </p>
    </article>
  );
}
