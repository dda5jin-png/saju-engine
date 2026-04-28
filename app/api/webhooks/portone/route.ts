import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { applyVerifiedPayment, markPaymentRefunded } from "@/lib/paymentFulfillment";
import { getPaymentInfo, getPortOneAccessToken } from "@/lib/portone";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const impUid = body.imp_uid as string | undefined;
    const merchantUid = body.merchant_uid as string | undefined;
    const status = body.status as string | undefined;

    if (!impUid || !merchantUid) {
      return NextResponse.json({ received: true });
    }

    const accessToken = await getPortOneAccessToken();
    const payment = await getPaymentInfo(impUid, accessToken);
    const db = getAdminDb();

    const orderSnap = await db.collection("paymentOrders").doc(merchantUid).get();

    if (!orderSnap.exists) {
      await db.collection("webhookLogs").add({
        source: "portone",
        impUid,
        merchantUid,
        status: status || null,
        paymentStatus: payment.status,
        error: "ORDER_NOT_FOUND",
        receivedAt: new Date(),
      });

      return NextResponse.json({ received: true });
    }

    const order = orderSnap.data()!;

    await db.collection("paymentOrders").doc(merchantUid).set(
      {
        impUid,
        portoneStatus: payment.status,
        webhookReceivedAt: new Date(),
        webhookRawStatus: status || null,
        updatedAt: new Date(),
      },
      { merge: true },
    );

    if (payment.status === "paid") {
      await applyVerifiedPayment({ merchantUid, impUid, payment });
    }

    if (payment.status === "cancelled") {
      await markPaymentRefunded({
        merchantUid,
        impUid,
        reason: "PORTONE_WEBHOOK_CANCELLED",
      });
    }

    await db.collection("webhookLogs").add({
      source: "portone",
      uid: order.uid,
      impUid,
      merchantUid,
      status: status || null,
      paymentStatus: payment.status,
      receivedAt: new Date(),
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PortOne webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
