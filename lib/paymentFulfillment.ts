import { getAdminDb, getAdminFieldValue } from "@/lib/firebaseAdmin";
import { PRODUCTS, ProductId } from "@/lib/products";
import { PortOnePaymentInfo } from "@/lib/portone";

export async function applyVerifiedPayment(params: {
  merchantUid: string;
  impUid: string;
  payment: PortOnePaymentInfo;
}) {
  const { merchantUid, impUid, payment } = params;
  const db = getAdminDb();
  const fieldValue = getAdminFieldValue();
  const orderRef = db.collection("paymentOrders").doc(merchantUid);
  const orderSnap = await orderRef.get();

  if (!orderSnap.exists) {
    return { success: false, reason: "ORDER_NOT_FOUND" as const };
  }

  const order = orderSnap.data()!;
  const product = PRODUCTS[order.productId as ProductId];

  if (!product) {
    return { success: false, reason: "PRODUCT_NOT_FOUND" as const };
  }

  const isValid =
    payment.merchant_uid === merchantUid &&
    payment.amount === product.amount &&
    payment.status === "paid";

  if (!isValid) {
    await orderRef.update({
      status: "FAILED_VERIFY",
      impUid,
      portoneStatus: payment.status,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: false, reason: "FAILED_VERIFY" as const };
  }

  if (order.status === "PAID") {
    return { success: true, alreadyProcessed: true, uid: order.uid, product };
  }

  const now = new Date();
  const userRef = db.collection("users").doc(order.uid);

  await db.runTransaction(async (tx) => {
    tx.update(orderRef, {
      status: "PAID",
      impUid,
      pgProvider: payment.pg_provider || null,
      payMethod: payment.pay_method || null,
      receiptUrl: payment.receipt_url || null,
      paidAt: now,
      verifiedAt: now,
      updatedAt: now,
      portonePayment: {
        pgProvider: payment.pg_provider || null,
        payMethod: payment.pay_method || null,
        receiptUrl: payment.receipt_url || null,
        cardName: payment.card_name || null,
      },
    });

    tx.set(
      userRef,
      {
        uid: order.uid,
        plan: "credits",
        premiumActive: true,
        premiumStartedAt: now,
        premiumExpiresAt: null,
        paidDecisionCredits: fieldValue.increment(product.credits),
        totalPaymentAmount: fieldValue.increment(product.amount),
        lastPaymentMerchantUid: merchantUid,
        updatedAt: now,
      },
      { merge: true },
    );

    tx.set(userRef.collection("payments").doc(merchantUid), {
      merchantUid,
      impUid,
      productId: product.id,
      productName: product.name,
      amount: product.amount,
      credits: product.credits,
      status: "PAID",
      paidAt: now,
      expiresAt: null,
      receiptUrl: payment.receipt_url || null,
    });
  });

  return { success: true, alreadyProcessed: false, uid: order.uid, product };
}

export async function markPaymentRefunded(params: {
  merchantUid: string;
  impUid?: string | null;
  reason?: string | null;
}) {
  const { merchantUid, impUid, reason } = params;
  const db = getAdminDb();
  const orderRef = db.collection("paymentOrders").doc(merchantUid);
  const orderSnap = await orderRef.get();

  if (!orderSnap.exists) {
    return { success: false, reason: "ORDER_NOT_FOUND" as const };
  }

  const order = orderSnap.data()!;
  const product = PRODUCTS[order.productId as ProductId];
  const now = new Date();

  await db.runTransaction(async (tx) => {
    tx.update(orderRef, {
      status: "REFUNDED",
      impUid: impUid || order.impUid || null,
      cancelledAt: now,
      updatedAt: now,
      refundReason: reason || null,
    });

    if (product) {
      const userRef = db.collection("users").doc(order.uid);
      tx.set(
        userRef,
        {
          paidDecisionCredits: getAdminFieldValue().increment(-product.credits),
          updatedAt: now,
        },
        { merge: true },
      );

      tx.set(
        userRef.collection("payments").doc(merchantUid),
        {
          status: "REFUNDED",
          refundedAt: now,
          refundReason: reason || null,
        },
        { merge: true },
      );
    }
  });

  return { success: true };
}
