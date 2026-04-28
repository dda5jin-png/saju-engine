import { NextResponse } from "next/server";
import { adminErrorResponse, requireAdmin } from "@/lib/adminGuard";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const snap = await getAdminDb()
      .collection("usageLogs")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const logs = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    const { message, status } = adminErrorResponse(error);
    return NextResponse.json({ success: false, message }, { status });
  }
}
