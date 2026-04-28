import { NextResponse } from "next/server";
import { adminErrorResponse, requireAdmin } from "@/lib/adminGuard";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { markPaymentRefunded } from "@/lib/paymentFulfillment";

export async function POST(req: Request) {
  try {
    const adminUser = await requireAdmin(req);
    const { merchantUid, reason } = (await req.json()) as {
      merchantUid?: string;
      reason?: string;
    };

    if (!merchantUid) {
      return NextResponse.json({ success: false, message: "merchantUid가 필요합니다." }, { status: 400 });
    }

    const result = await markPaymentRefunded({
      merchantUid,
      reason: reason || "ADMIN_MARK_REFUNDED",
    });

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.reason }, { status: 400 });
    }

    await getAdminDb().collection("adminLogs").add({
      action: "MARK_REFUNDED",
      merchantUid,
      reason: reason || null,
      adminUid: adminUser.uid,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { message, status } = adminErrorResponse(error);
    return NextResponse.json({ success: false, message }, { status });
  }
}
