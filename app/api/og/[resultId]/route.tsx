import { ImageResponse } from 'next/og';
import { getDb } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { SajuAnalysis } from '@/types/saju';

export const runtime = 'edge';

async function getAnalysisWithTimeout(resultId: string) {
  try {
    return await Promise.race([
      (async () => {
        const docRef = doc(getDb(), 'results', resultId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? (docSnap.data() as SajuAnalysis) : null;
      })(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200)),
    ]);
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resultId: string }> }
) {
  try {
    const { resultId } = await params;
    const data = await getAnalysisWithTimeout(resultId);
    const viral = data?.viral_character;
    const quote = viral?.one_liner || data?.viral_sentences?.self_realization || '사주 구조 분석 리포트';
    const characterType = viral?.character_type || data?.type_name || '진지한 해석과 공유 가능한 캐릭터 카드';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #08111f 0%, #102a34 48%, #f7f2e8 49%, #ffffff 100%)',
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid rgba(15, 23, 42, 0.18)',
              borderRadius: '44px',
              padding: '58px',
              width: '90%',
              height: '90%',
              background: 'linear-gradient(145deg, #ffffff 0%, #f7fbfc 56%, #eef8f4 100%)',
              boxShadow: '0 34px 80px rgba(0,0,0,0.24)',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#64748b',
                fontSize: '24px',
                fontWeight: 900,
                letterSpacing: '8px',
              }}
            >
              <span>SAJU INSIGHT</span>
              <span>{new Date().getFullYear()}</span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '28px',
                textAlign: 'center',
                maxWidth: '860px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  border: '1px solid rgba(20, 184, 166, 0.28)',
                  borderRadius: '999px',
                  background: 'rgba(20, 184, 166, 0.10)',
                  color: '#0f766e',
                  fontSize: '24px',
                  fontWeight: 900,
                  padding: '12px 24px',
                }}
              >
                사주 구조 분석 리포트
              </div>
              <div
                style={{
                  fontSize: quote.length > 18 ? '66px' : '76px',
                  lineHeight: 1.18,
                  fontWeight: 900,
                  color: '#0f172a',
                  textAlign: 'center',
                }}
              >
                {quote}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(15, 23, 42, 0.12)',
                paddingTop: '28px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '28px', color: '#334155', fontWeight: 900 }}>
                  {characterType}
                </div>
                <div style={{ fontSize: '20px', color: '#94a3b8', fontWeight: 700 }}>
                  saju-engine.vercel.app
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '88px',
                  height: '88px',
                  borderRadius: '28px',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '30px',
                  fontWeight: 900,
                }}
              >
                四
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            color: '#0f172a',
            padding: '60px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #cbd5e1',
              borderRadius: '44px',
              padding: '60px',
              width: '90%',
              height: '90%',
            }}
          >
            <div style={{ fontSize: '28px', color: '#0f766e', fontWeight: 900, letterSpacing: '6px' }}>
              SAJU INSIGHT
            </div>
            <div
              style={{
                marginTop: '36px',
                fontSize: '72px',
                fontWeight: '900',
                color: '#0f172a',
                textAlign: 'center',
                lineHeight: 1.15,
              }}
            >
              사주 구조 분석 리포트
            </div>
            <div
              style={{
                marginTop: '32px',
                fontSize: '28px',
                color: '#64748b',
                textAlign: 'center',
              }}
            >
              진지한 해석과 공유 가능한 캐릭터 카드
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        status: 200,
      }
    );
  }
}
