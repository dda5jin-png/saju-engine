import type { Metadata } from 'next';
import ResultClientPage from './ResultClientPage';

type Props = {
  params: Promise<{ resultId: string }>;
};

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://saju-engine.vercel.app';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { resultId } = await params;
  const baseUrl = getBaseUrl();
  const resultUrl = `${baseUrl}/result/${resultId}`;
  const imageUrl = `${baseUrl}/api/og/${resultId}`;
  const title = '사주 구조 분석 리포트';
  const description = '진지한 사주 해석과 공유 가능한 캐릭터 카드를 확인하세요.';

  return {
    title,
    description,
    alternates: {
      canonical: resultUrl,
    },
    openGraph: {
      title,
      description,
      url: resultUrl,
      siteName: 'SAJU INSIGHT',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: '사주 구조 분석 공유 미리보기',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ResultPage({ params }: Props) {
  const { resultId } = await params;
  return <ResultClientPage resultId={resultId} />;
}
