import Link from 'next/link';
import CharacterGuide from '@/components/ui/CharacterGuide';
import HeaderAuthButton from '@/components/auth/HeaderAuthButton';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-12">
      <HeaderAuthButton />
      <div className="space-y-6">
        <CharacterGuide size={160} />
        
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight break-keep">
            당신의 사주는<br />성격 테스트가 아닙니다.<br />
            <span className="text-indigo-500">구조입니다.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-sm mx-auto">
            데이터로 증명하는 당신이라는 개체의 행동 알고리즘
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm pt-8">
        <Link 
          href="/input" 
          className="block w-full bg-white text-black font-bold py-5 rounded-2xl text-xl hover:bg-gray-100 transition-all active:scale-95"
        >
          내 구조 분석하기
        </Link>
        <p className="mt-3 text-xs font-semibold leading-5 text-white/45">
          비회원도 바로 체험할 수 있어요.<br />
          결과 저장과 프리미엄 질문은 로그인 후 이용됩니다.
        </p>
        <p className="mt-4 text-gray-500 text-sm">
          현재까지 12,402명의 구조가 해석되었습니다.
        </p>
      </div>
    </main>
  );
}
