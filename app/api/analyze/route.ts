import { NextResponse } from 'next/server';
import { analyzeSaju } from '@/lib/sajuEngine';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { SajuInput } from '@/types/saju';

export async function POST(request: Request) {
  try {
    const body: SajuInput = await request.json();
    
    // 1. 사주 분석 수행
    const analysis = analyzeSaju(body);

    // 2. Firestore에 결과 저장
    const docRef = await addDoc(collection(db, "results"), {
      ...analysis,
      input: body,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    console.error('API Analyze Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
