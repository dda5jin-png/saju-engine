import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { buildDecisionCoachResult, inferDecisionCategory } from "@/lib/decisionCoach";
import { verifyBearerToken } from "@/lib/serverAuth";
import { getUserSubscription } from "@/lib/subscription";
import { DecisionCategory, SajuAnalysis } from "@/types/saju";

const FREE_DECISION_LIMIT = 1;

type RequestBody = {
  resultId?: string;
  question?: string;
  category?: DecisionCategory;
};

export async function POST(req: Request) {
  try {
    const decoded = await verifyBearerToken(req);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Decision Coach는 로그인 후 사용할 수 있습니다." },
        { status: 401 },
      );
    }

    const { resultId, question, category } = (await req.json()) as RequestBody;

    if (!resultId || !question || question.trim().length < 6) {
      return NextResponse.json(
        { success: false, message: "분석할 질문을 조금 더 구체적으로 입력해주세요." },
        { status: 400 },
      );
    }

    const db = getAdminDb();
    const userRef = db.collection("users").doc(decoded.uid);
    const subscription = await getUserSubscription(decoded.uid);

    if (!subscription.premiumActive && subscription.decisionCoachUsed >= FREE_DECISION_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          paywall: true,
          message: "이 분석은 더 깊게 들어갈수록 정확해진다",
          upsells: ["추가 분석 보기", "다른 선택지도 비교하기", "연애 / 돈 / 커리어 전용 분석 열기"],
        },
        { status: 402 },
      );
    }

    const resultSnap = await db.collection("results").doc(resultId).get();

    if (!resultSnap.exists) {
      return NextResponse.json(
        { success: false, message: "사주 결과를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const analysis = resultSnap.data() as SajuAnalysis;
    const inferredCategory = inferDecisionCategory(question, category);
    const decision = buildDecisionCoachResult(analysis, question.trim(), inferredCategory);

    await db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      const currentUsed = Number(userSnap.data()?.decisionCoachUsed ?? 0);

      tx.set(
        userRef,
        {
          uid: decoded.uid,
          email: decoded.email || null,
          decisionCoachUsed: subscription.premiumActive ? currentUsed : currentUsed + 1,
          updatedAt: new Date(),
        },
        { merge: true },
      );

      tx.set(userRef.collection("decisionCoachLogs").doc(), {
        resultId,
        question: question.trim(),
        category: inferredCategory,
        premiumActive: subscription.premiumActive,
        createdAt: new Date(),
      });
    });

    return NextResponse.json({
      success: true,
      category: inferredCategory,
      decision,
      remainingFreeUses: subscription.premiumActive
        ? null
        : Math.max(0, FREE_DECISION_LIMIT - subscription.decisionCoachUsed - 1),
      premiumActive: subscription.premiumActive,
    });
  } catch (error) {
    console.error("Decision coach error:", error);

    return NextResponse.json(
      { success: false, message: "Decision Coach 실행 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
