import { NextResponse } from "next/server";
import { Webhook } from "@portone/server-sdk";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { applyVerifiedPayment, markPaymentRefunded } from "@/lib/paymentFulfillment";
import { getPaymentInfo } from "@/lib/portone";

type PortOneWebhookBody = {
  type?: string;
  data?: {
    paymentId?: string;
    storeId?: string;
    cancellationId?: string;
  };
  paymentId?: string;
  merchant_uid?: string;
  imp_uid?: string;
  status?: string;
};

function parseFallbackWebhook(payload: string): PortOneWebhookBody {
  try {
    return JSON.parse(payload) as PortOneWebhookBody;
  } catch {
    return {};
  }
}

async function parseWebhook(req: Request, payload: string) {
  const webhookSecret = process.env.PORTONE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return parseFallbackWebhook(payload);
  }

  const headers = {
    "webhook-id": req.headers.get("webhook-id") || "",
    "webhook-signature": req.headers.get("webhook-signature") || "",
    "webhook-timestamp": req.headers.get("webhook-timestamp") || "",
  };

  try {
    return (await Webhook.verify(webhookSecret, payload, headers)) as PortOneWebhookBody;
  } catch (error) {
    await getAdminDb().collection("webhookLogs").add({
      source: "portone",
      error: "WEBHOOK_VERIFY_FAILED",
      message: error instanceof Error ? error.message : String(error),
      receivedAt: new Date(),
    });
    throw error;
  }
}

export async function POST(req: Request) {
  const receivedAt = new Date();

  try {
    const payload = await req.text();
    const body = await parseWebhook(req, payload);
    const paymentId = body.data?.paymentId || body.paymentId || body.merchant_uid;
    const rawStatus = body.status || body.type || null;

    if (!paymentId) {
      await getAdminDb().collection("webhookLogs").add({
        source: "portone",
        rawStatus,
        error: "PAYMENT_ID_MISSING",
        receivedAt,
      });
      return NextResponse.json({ received: true });
    }

    const payment = await getPaymentInfo(paymentId);
    const db = getAdminDb();
    const orderSnap = await db.collection("paymentOrders").doc(paymentId).get();

    if (!orderSnap.exists) {
      await db.collection("webhookLogs").add({
        source: "portone",
        paymentId,
        status: rawStatus,
        paymentStatus: payment.status,
        error: "ORDER_NOT_FOUND",
        receivedAt,
      });

      return NextResponse.json({ received: true });
    }

    const order = orderSnap.data()!;

    await db.collection("paymentOrders").doc(paymentId).set(
      {
        paymentId,
        impUid: payment.transactionId,
        portoneStatus: payment.status,
        webhookReceivedAt: receivedAt,
        webhookRawStatus: rawStatus,
        updatedAt: new Date(),
      },
      { merge: true },
    );

    if (payment.status === "PAID") {
      await applyVerifiedPayment({
        merchantUid: paymentId,
        impUid: payment.transactionId,
        payment,
      });
    }

    if (payment.status === "CANCELLED" || payment.status === "PARTIAL_CANCELLED") {
      await markPaymentRefunded({
        merchantUid: paymentId,
        impUid: payment.transactionId,
        reason: `PORTONE_WEBHOOK_${payment.status}`,
      });
    }

    await db.collection("webhookLogs").add({
      source: "portone",
      uid: order.uid,
      paymentId,
      impUid: payment.transactionId,
      status: rawStatus,
      paymentStatus: payment.status,
      receivedAt,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PortOne webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
