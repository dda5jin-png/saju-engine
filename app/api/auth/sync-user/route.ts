import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { verifyBearerToken } from "@/lib/serverAuth";
import { getTodayKey } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    const decoded = await verifyBearerToken(req);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "인증 토큰을 확인할 수 없습니다." },
        { status: 401 },
      );
    }

    const now = new Date();
    const userRef = getAdminDb().collection("users").doc(decoded.uid);
    const snap = await userRef.get();

    if (!snap.exists) {
      await userRef.set({
        uid: decoded.uid,
        email: decoded.email || null,
        displayName: decoded.name || null,
        role: "user",
        plan: "free",
        premiumActive: false,
        premiumStartedAt: null,
        premiumExpiresAt: null,
        paidDecisionCredits: 0,
        freeDecisionCountToday: 0,
        freeDecisionDate: getTodayKey(),
        totalDecisionCount: 0,
        totalPaymentAmount: 0,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      });
    } else {
      await userRef.set(
        {
          email: decoded.email || null,
          displayName: decoded.name || null,
          lastLoginAt: now,
          updatedAt: now,
        },
        { merge: true },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sync user error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? `회원 정보 동기화 실패: ${error.message}`
            : "회원 정보 동기화 중 알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
