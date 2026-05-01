import { NextResponse } from "next/server";
import { getAdminDb, getAdminFieldValue } from "@/lib/firebaseAdmin";

const COUNTER_COLLECTION = "siteStats";
const COUNTER_DOCUMENT = "home";
const BASE_COUNT = 12402;

async function getCounterRef() {
  return getAdminDb().collection(COUNTER_COLLECTION).doc(COUNTER_DOCUMENT);
}

export async function GET() {
  try {
    const snapshot = await (await getCounterRef()).get();
    const count = Number(snapshot.data()?.visitorCount ?? BASE_COUNT);

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("Visit counter read failed:", error);
    return NextResponse.json({ success: false, count: BASE_COUNT }, { status: 200 });
  }
}

export async function POST() {
  try {
    const counterRef = await getCounterRef();
    const fieldValue = getAdminFieldValue();

    await counterRef.set(
      {
        visitorCount: fieldValue.increment(1),
        updatedAt: fieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    const snapshot = await counterRef.get();
    const count = Number(snapshot.data()?.visitorCount ?? BASE_COUNT + 1);

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("Visit counter increment failed:", error);
    return NextResponse.json({ success: false, count: BASE_COUNT + 1 }, { status: 200 });
  }
}
