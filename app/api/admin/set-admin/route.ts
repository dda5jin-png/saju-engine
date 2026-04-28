import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { verifyBearerToken } from "@/lib/serverAuth";

export async function POST(req: Request) {
  try {
    const ownerEmail = process.env.ADMIN_OWNER_EMAIL;
    const decoded = await verifyBearerToken(req);

    if (!decoded || !ownerEmail || decoded.email !== ownerEmail) {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const { targetUid } = (await req.json()) as { targetUid?: string };

    if (!targetUid) {
      return NextResponse.json({ success: false, message: "targetUid가 필요합니다." }, { status: 400 });
    }

    await getAdminAuth().setCustomUserClaims(targetUid, { admin: true });

    await getAdminDb().collection("users").doc(targetUid).set(
      {
        role: "admin",
        updatedAt: new Date(),
      },
      { merge: true },
    );

    await getAdminDb().collection("adminLogs").add({
      action: "SET_ADMIN",
      targetUid,
      adminUid: decoded.uid,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set admin error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
