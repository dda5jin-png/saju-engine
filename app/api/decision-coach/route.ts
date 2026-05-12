import { NextResponse } from "next/server";
import { getAdminDb, getAdminFieldValue } from "@/lib/firebaseAdmin";
import { buildDecisionCoachResult, inferDecisionCategory } from "@/lib/decisionCoach";
import { verifyBearerToken } from "@/lib/serverAuth";
import {
  canUseFreeDecision,
  getPaidDecisionCredits,
  getTodayKey,
  hasActivePeriodAccess,
} from "@/lib/subscription";
import { DecisionCategory, SajuAnalysis } from "@/types/saju";

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
        { success: false, message: "오늘의 선택 가이드는 로그인 후 사용할 수 있습니다." },
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
    const fieldValue = getAdminFieldValue();
    const userRef = db.collection("users").doc(decoded.uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { success: false, message: "회원 정보가 없습니다. 다시 로그인해주세요." },
        { status: 404 },
      );
    }

    const user = userSnap.data() ?? {};
    const periodAccess = hasActivePeriodAccess(user);
    const credits = getPaidDecisionCredits(user);
    const freeAllowed = canUseFreeDecision(user);
    const today = getTodayKey();

    if (!periodAccess && credits <= 0 && !freeAllowed) {
      return NextResponse.json(
        {
          success: false,
          paywall: true,
          message: "오늘 무료 분석 1회를 모두 사용했습니다.",
          deepMessage: "이 분석은 더 깊게 들어갈수록 정확해진다",
          cta: "프리미엄 분석 열기",
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
    const usedFreeCredit = !periodAccess && freeAllowed;
    const usedPaidCredit = !periodAccess && !usedFreeCredit && credits > 0;

    await db.runTransaction(async (tx) => {
      const updateData: Record<string, unknown> = {
        totalDecisionCount: fieldValue.increment(1),
        updatedAt: new Date(),
      };

      if (usedPaidCredit) {
        updateData.paidDecisionCredits = fieldValue.increment(-1);
      } else if (user.freeDecisionDate !== today) {
        updateData.freeDecisionDate = today;
        updateData.freeDecisionCountToday = 1;
      } else {
        updateData.freeDecisionCountToday = fieldValue.increment(1);
      }

      tx.set(userRef, updateData, { merge: true });

      tx.set(db.collection("usageLogs").doc(), {
        uid: decoded.uid,
        mode: inferredCategory === "general" ? "decision" : inferredCategory,
        isPremiumAtUse: periodAccess || usedPaidCredit,
        usedPaidCredit,
        question: question.trim(),
        resultId,
        createdAt: new Date(),
      });

      tx.set(userRef.collection("decisionCoachLogs").doc(), {
        resultId,
        question: question.trim(),
        category: inferredCategory,
        isPremiumAtUse: periodAccess || usedPaidCredit,
        usedPaidCredit,
        decision,
        createdAt: new Date(),
      });
    });

    const freeUsedAfter =
      user.freeDecisionDate === today ? Number(user.freeDecisionCountToday ?? 0) + (usedPaidCredit ? 0 : 1) : 1;

    return NextResponse.json({
      success: true,
      category: inferredCategory,
      decision,
      premiumActive: periodAccess || usedPaidCredit,
      paidDecisionCredits: usedPaidCredit ? Math.max(0, credits - 1) : credits,
      remainingFreeUses: periodAccess || usedPaidCredit ? null : Math.max(0, 1 - freeUsedAfter),
    });
  } catch (error) {
    console.error("Decision coach error:", error);

    return NextResponse.json(
      { success: false, message: "오늘의 선택 가이드 실행 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
