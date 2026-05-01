import Link from 'next/link';
import CharacterGuide from '@/components/ui/CharacterGuide';
import HeaderAuthButton from '@/components/auth/HeaderAuthButton';
import BrightnessThemeShell from '@/components/ui/BrightnessThemeShell';
import { SITE_NAME } from '@/lib/site';

export default function LandingPage() {
  return (
    <BrightnessThemeShell className="min-h-screen">
      <main className="relative min-h-screen overflow-hidden px-6 py-8 text-[var(--result-text)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(214,180,106,0.18),transparent_34%),radial-gradient(circle_at_82%_72%,rgba(124,58,237,0.12),transparent_30%)]" />
        <HeaderAuthButton className="right-4 top-16 md:right-8 md:top-20" />

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-center gap-10 text-center">
          <section className="space-y-7">
            <div className="flex flex-col items-center gap-4">
              <CharacterGuide size={116} />
              <p className="text-sm font-black tracking-[0.42em] text-[#D6B46A]">{SITE_NAME}</p>
            </div>

            <div className="space-y-5">
              <h1 className="mx-auto max-w-3xl text-[2rem] font-black leading-[1.18] tracking-tight md:text-6xl break-keep">
                당신의 사주를<br />
                <span className="text-[#D6B46A]">에너지 구조</span>로<br className="sm:hidden" /> 해석합니다.
              </h1>
              <p className="mx-auto max-w-2xl text-base font-semibold leading-8 text-[#F8F4EA]/70 md:text-xl break-keep">
                보이지 않는 흐름을 분석하고, 나에게 맞는 색, 보석, 주얼리 선택으로 연결합니다.
              </p>
              <p className="mx-auto max-w-3xl text-sm leading-7 text-[#F8F4EA]/52 md:text-base break-keep">
                사주는 운명을 단정하는 도구가 아니라, 내 안의 에너지 균형을 이해하는 지도입니다.
                ORABIT은 오행 흐름을 분석해 부족한 기운, 과한 기운, 그리고 이를 보완할 수 있는 색상과 주얼리 조합을 제안합니다.
              </p>
            </div>

            <div className="mx-auto w-full max-w-sm pt-2">
              <Link
                href="/input"
                className="block w-full rounded-2xl bg-[#D6B46A] px-6 py-5 text-lg font-black text-[#0F172A] transition-all hover:bg-[#e4c477] active:scale-95"
              >
                ORABIT 분석 시작하기
              </Link>
              <p className="mt-3 text-xs font-semibold leading-5 text-[#F8F4EA]/48">
                비회원도 바로 체험할 수 있어요.<br />
                결과 저장과 프리미엄 질문은 로그인 후 이용됩니다.
              </p>
            </div>
          </section>

          <section className="grid gap-3 text-left md:grid-cols-4">
            {['사주 에너지 분석', '오행 균형', '보석 추천', '착용 가이드'].map((item, index) => (
              <div key={item} className="rounded-2xl border border-[#D6B46A]/25 bg-white/[0.035] p-4">
                <p className="text-xs font-black text-[#D6B46A]">0{index + 1}</p>
                <p className="mt-3 text-sm font-extrabold text-[#F8F4EA]">{item}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-3 text-left md:grid-cols-3">
            {[
              ['나의 부족한 에너지', '오행의 빈 곳을 찾아 필요한 흐름을 읽습니다.'],
              ['나에게 맞는 보석', '색상, 보석, 금속을 한 조합으로 제안합니다.'],
              ['오늘의 착용 가이드', '연애, 재물, 사업, 관계 상황별 착용법을 정리합니다.'],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-[#1F2937]/62 p-5">
                <p className="text-base font-black text-[#F8F4EA]">{title}</p>
                <p className="mt-3 text-sm leading-6 text-[#F8F4EA]/58 break-keep">{desc}</p>
              </div>
            ))}
          </section>

          <p className="text-center text-sm text-[#F8F4EA]/42">
            현재까지 12,402명의 에너지 구조가 분석되었습니다.
          </p>
        </div>
      </main>
    </BrightnessThemeShell>
  );
}
