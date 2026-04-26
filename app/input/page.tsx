import SajuInputForm from '@/components/ui/SajuInputForm';
import CharacterGuide from '@/components/ui/CharacterGuide';

export default function InputPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-6 md:pt-20">
      <div className="w-full max-w-md space-y-12">
        <header className="flex flex-col items-center gap-4">
          <CharacterGuide size={60} />
          <div className="text-center">
            <h2 className="text-2xl font-bold">구조 해석 시작</h2>
            <p className="text-gray-500 mt-1">당신의 탄생 데이터를 입력해 주세요.</p>
          </div>
        </header>

        <SajuInputForm />

        <footer className="pt-12 text-center">
          <p className="text-gray-600 text-xs leading-relaxed max-w-[240px] mx-auto">
            제공된 데이터는 구조 분석을 위해서만 사용되며 별도로 외부에 노출되지 않습니다.
          </p>
        </footer>
      </div>
    </main>
  );
}
