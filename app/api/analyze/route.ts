import { NextResponse } from 'next/server';
import { analyzeSaju } from '@/lib/sajuEngine';
import { getDb } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { randomUUID } from 'crypto';
import { SajuAnalysis, SajuInput } from '@/types/saju';

function isValidInput(body: Partial<SajuInput>): body is SajuInput {
  return (
    typeof body.birthDate === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(body.birthDate) &&
    (body.birthTime === undefined || body.birthTime === '' || /^\d{2}:\d{2}$/.test(body.birthTime)) &&
    (body.gender === 'male' || body.gender === 'female')
  );
}

async function persistAnalysis(input: SajuInput, analysis: SajuAnalysis) {
  const writePromise = addDoc(collection(getDb(), "results"), {
    ...analysis,
    input,
    createdAt: serverTimestamp(),
  }).then((docRef) => docRef.id);

  writePromise.catch((error) => {
    console.error('Firestore write failed:', error);
  });

  return Promise.race([
    writePromise,
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 4500);
    }),
  ]);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SajuInput>;

    if (!isValidInput(body)) {
      return NextResponse.json({ error: 'Invalid birth data' }, { status: 400 });
    }
    
    // 1. 사주 분석 수행
    const analysis = analyzeSaju(body);

    // 2. Firestore에 결과 저장
    const persistedId = await persistAnalysis(body, analysis);

    if (!persistedId) {
      return NextResponse.json({
        id: `local_${randomUUID()}`,
        analysis,
        persisted: false,
      });
    }

    return NextResponse.json({ id: persistedId, persisted: true });
  } catch (error) {
    console.error('API Analyze Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
