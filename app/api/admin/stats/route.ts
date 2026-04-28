import { NextResponse } from "next/server";
import { adminErrorResponse, requireAdmin } from "@/lib/adminGuard";
import { getAdminDb } from "@/lib/firebaseAdmin";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const db = getAdminDb();
    const [usersSnap, paidSnap, todayUsersSnap, paymentsSnap, todayPaymentsSnap, failedPaymentsSnap, usageSnap] =
      await Promise.all([
        db.collection("users").count().get(),
        db.collection("users").where("premiumActive", "==", true).count().get(),
        db.collection("users").where("createdAt", ">=", startOfToday()).count().get(),
        db.collection("paymentOrders").where("status", "==", "PAID").get(),
        db.collection("paymentOrders").where("status", "==", "PAID").where("paidAt", ">=", startOfToday()).get(),
        db.collection("paymentOrders").where("status", "in", ["FAILED", "FAILED_VERIFY"]).limit(20).get(),
        db.collection("usageLogs").orderBy("createdAt", "desc").limit(10).get(),
      ]);

    const totalRevenue = paymentsSnap.docs.reduce((sum, doc) => sum + Number(doc.data().amount ?? 0), 0);
    const todayRevenue = todayPaymentsSnap.docs.reduce((sum, doc) => sum + Number(doc.data().amount ?? 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: usersSnap.data().count,
        premiumUsers: paidSnap.data().count,
        todayUsers: todayUsersSnap.data().count,
        todayRevenue,
        totalRevenue,
        failedPaymentCount: failedPaymentsSnap.size,
      },
      recentUsageLogs: usageSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    });
  } catch (error) {
    const { message, status } = adminErrorResponse(error);
    return NextResponse.json({ success: false, message }, { status });
  }
}
