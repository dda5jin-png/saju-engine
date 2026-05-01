import SajuInputForm from '@/components/ui/SajuInputForm';
import CharacterGuide from '@/components/ui/CharacterGuide';
import BrightnessThemeShell from '@/components/ui/BrightnessThemeShell';

export default function InputPage() {
  return (
    <BrightnessThemeShell className="min-h-screen">
      <main className="flex min-h-screen flex-col items-center p-6 pt-24 text-[var(--result-text)] md:pt-24">
        <div className="w-full max-w-md space-y-12">
          <header className="flex flex-col items-center gap-4">
            <CharacterGuide size={60} />
            <div className="text-center">
              <p className="text-xs font-black tracking-[0.32em] text-[#D6B46A]">ORABIT</p>
              <h2 className="mt-2 text-2xl font-bold">에너지 분석 시작</h2>
              <p className="mt-1 text-[color:var(--result-muted)]">탄생 데이터를 기반으로 오행 균형과 주얼리 가이드를 분석합니다.</p>
            </div>
          </header>

          <SajuInputForm />

          <footer className="pt-12 text-center">
            <p className="mx-auto max-w-[240px] text-xs leading-relaxed text-[color:var(--result-muted)]">
              제공된 데이터는 에너지 분석을 위해서만 사용되며 별도로 외부에 노출되지 않습니다.
            </p>
          </footer>
        </div>
      </main>
    </BrightnessThemeShell>
  );
}
