import type { Metadata } from 'next';
import { getPublicSiteUrl, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';
import ResultClientPage from './ResultClientPage';

type Props = {
  params: Promise<{ resultId: string }>;
};

function getBaseUrl() {
  return getPublicSiteUrl();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { resultId } = await params;
  const baseUrl = getBaseUrl();
  const resultUrl = `${baseUrl}/result/${resultId}`;
  const imageUrl = `${baseUrl}/api/og/${resultId}`;
  const title = 'ORABIT 에너지 분석 리포트';
  const description = SITE_DESCRIPTION;

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
      siteName: SITE_NAME,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'ORABIT 에너지 분석 공유 미리보기',
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
