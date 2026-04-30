import SajuInputForm from '@/components/ui/SajuInputForm';
import CharacterGuide from '@/components/ui/CharacterGuide';

export default function InputPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] text-[#F8F4EA] flex flex-col items-center p-6 md:pt-20">
      <div className="w-full max-w-md space-y-12">
        <header className="flex flex-col items-center gap-4">
          <CharacterGuide size={60} />
          <div className="text-center">
            <p className="text-xs font-black tracking-[0.32em] text-[#D6B46A]">ORABIT</p>
            <h2 className="mt-2 text-2xl font-bold">에너지 분석 시작</h2>
            <p className="text-[#F8F4EA]/52 mt-1">탄생 데이터를 기반으로 오행 균형과 주얼리 가이드를 분석합니다.</p>
          </div>
        </header>

        <SajuInputForm />

        <footer className="pt-12 text-center">
          <p className="text-gray-600 text-xs leading-relaxed max-w-[240px] mx-auto">
            제공된 데이터는 에너지 분석을 위해서만 사용되며 별도로 외부에 노출되지 않습니다.
          </p>
        </footer>
      </div>
    </main>
  );
}
