import { NextResponse } from "next/server";
import { adminErrorResponse, requireAdmin } from "@/lib/adminGuard";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim().toLowerCase();
    const snap = await getAdminDb()
      .collection("users")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    let users = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (q) {
      users = users.filter((user) => {
        const email = String((user as { email?: string }).email ?? "").toLowerCase();
        const displayName = String((user as { displayName?: string }).displayName ?? "").toLowerCase();
        return docMatches(user.id, q) || email.includes(q) || displayName.includes(q);
      });
    }

    return NextResponse.json({ success: true, users });
  } catch (error) {
    const { message, status } = adminErrorResponse(error);
    return NextResponse.json({ success: false, message }, { status });
  }
}

function docMatches(id: string, q: string) {
  return id.toLowerCase().includes(q);
}
