import { NextResponse } from "next/server";
import { adminErrorResponse, requireAdmin } from "@/lib/adminGuard";
import { getAdminDb, getAdminFieldValue } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const adminUser = await requireAdmin(req);
    const { targetUid, credits, reason } = (await req.json()) as {
      targetUid?: string;
      credits?: number;
      reason?: string;
    };

    const amount = Math.max(1, Math.min(100, Number(credits ?? 0)));

    if (!targetUid || !amount) {
      return NextResponse.json(
        { success: false, message: "targetUid와 credits가 필요합니다." },
        { status: 400 },
      );
    }

    const db = getAdminDb();
    const now = new Date();

    await db.runTransaction(async (tx) => {
      const userRef = db.collection("users").doc(targetUid);

      tx.set(
        userRef,
        {
          plan: "credits",
          premiumActive: true,
          paidDecisionCredits: getAdminFieldValue().increment(amount),
          updatedAt: now,
        },
        { merge: true },
      );

      tx.set(db.collection("adminLogs").doc(), {
        action: "GRANT_CREDITS",
        targetUid,
        credits: amount,
        reason: reason || null,
        adminUid: adminUser.uid,
        createdAt: now,
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { message, status } = adminErrorResponse(error);
    return NextResponse.json({ success: false, message }, { status });
  }
}
