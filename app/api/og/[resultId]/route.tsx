import { ImageResponse } from 'next/og';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ resultId: string }> }
) {
  try {
    const { resultId } = await params;
    const docRef = doc(db, "results", resultId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return new Response('Not Found', { status: 404 });
    }

    const data = docSnap.data();

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
            backgroundColor: '#000',
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #333',
              borderRadius: '40px',
              padding: '60px',
              width: '90%',
              height: '90%',
              background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
            }}
          >
            <div style={{ fontSize: '24px', color: '#6366f1', marginBottom: '20px', fontWeight: 'bold' }}>
              사주 구조 분석 리포트
            </div>
            <div
              style={{
                fontSize: '60px',
                fontWeight: '900',
                color: 'white',
                textAlign: 'center',
                marginBottom: '20px',
                letterSpacing: '-2px',
              }}
            >
              {data.type_name}
            </div>
            <div
              style={{
                fontSize: '28px',
                color: '#94a3b8',
                textAlign: 'center',
                maxWidth: '80%',
              }}
            >
              "{data.summary.split('.')[0]}"
            </div>
            <div
              style={{
                marginTop: '40px',
                display: 'flex',
                alignItems: 'center',
                color: '#6366f1',
              }}
            >
              <div style={{ fontSize: '20px', letterSpacing: '4px' }}>ANALYSIS ENTITY</div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
