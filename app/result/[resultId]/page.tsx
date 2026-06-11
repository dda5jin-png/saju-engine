import type { Metadata } from 'next';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { getPublicSiteUrl, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';
import { SajuAnalysis } from '@/types/saju';
import ResultClientPage from './ResultClientPage';

type Props = {
  params: Promise<{ resultId: string }>;
};

function getBaseUrl() {
  return getPublicSiteUrl();
}

async function getPersistedAnalysis(resultId: string) {
  if (resultId.startsWith('local_')) return null;

  try {
    const snapshot = await Promise.race([
      getAdminDb().collection('results').doc(resultId).get(),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 4500);
      }),
    ]);

    if (!snapshot?.exists) return null;

    const analysis = snapshot.data();
    if (!analysis) return null;

    delete analysis.input;
    delete analysis.createdAt;

    return analysis as SajuAnalysis;
  } catch (error) {
    console.error(
      'Failed to load analysis result:',
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { resultId } = await params;
  const baseUrl = getBaseUrl();
  const resultUrl = `${baseUrl}/result/${resultId}`;
  const imageUrl = `${baseUrl}/api/og/${resultId}`;
  const title = 'ORABIT 사주 오행 보석 리포트';
  const description = SITE_DESCRIPTION;

  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
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
          alt: 'ORABIT 사주 오행 보석 리포트 공유 미리보기',
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
  const initialAnalysis = await getPersistedAnalysis(resultId);

  return (
    <ResultClientPage
      resultId={resultId}
      initialAnalysis={initialAnalysis}
    />
  );
}
