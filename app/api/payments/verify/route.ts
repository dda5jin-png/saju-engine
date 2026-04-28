import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { PRODUCTS, ProductId } from "@/lib/products";
import { verifyBearerToken } from "@/lib/serverAuth";

type PortOnePayment = {
  merchant_uid: string;
  amount: number;
  status: string;
  pg_provider?: string;
  pay_method?: string;
  receipt_url?: string;
  card_name?: string;
};

async function getPortOneAccessToken() {
  if (!process.env.PORTONE_API_KEY || !process.env.PORTONE_API_SECRET) {
    throw new Error("Missing PortOne API credentials");
  }

  const res = await fetch("https://api.iamport.kr/users/getToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imp_key: process.env.PORTONE_API_KEY,
      imp_secret: process.env.PORTONE_API_SECRET,
    }),
  });

  const data = await res.json();

  if (data.code !== 0) {
    throw new Error(data.message || "포트원 토큰 발급 실패");
  }

  return data.response.access_token as string;
}

async function getPaymentInfo(impUid: string, accessToken: string): Promise<PortOnePayment> {
  const res = await fetch(`https://api.iamport.kr/payments/${impUid}`, {
    headers: {
      Authorization: accessToken,
    },
  });

  const data = await res.json();

  if (data.code !== 0) {
    throw new Error(data.message || "결제 정보 조회 실패");
  }

  return data.response as PortOnePayment;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export async function POST(req: Request) {
  try {
    const decoded = await verifyBearerToken(req);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const { impUid, merchantUid } = (await req.json()) as {
      impUid?: string;
      merchantUid?: string;
    };

    if (!impUid || !merchantUid) {
      return NextResponse.json(
        { success: false, message: "결제 정보가 부족합니다." },
        { status: 400 },
      );
    }

    const db = getAdminDb();
    const orderRef = db.collection("paymentOrders").doc(merchantUid);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json(
        { success: false, message: "주문 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const order = orderSnap.data()!;

    if (order.uid !== decoded.uid) {
      return NextResponse.json(
        { success: false, message: "주문 사용자 정보가 일치하지 않습니다." },
        { status: 403 },
      );
    }

    if (order.status === "PAID") {
      return NextResponse.json({
        success: true,
        message: "이미 처리된 결제입니다.",
      });
    }

    const accessToken = await getPortOneAccessToken();
    const payment = await getPaymentInfo(impUid, accessToken);
    const product = PRODUCTS[order.productId as ProductId];

    if (!product) {
      return NextResponse.json(
        { success: false, message: "상품 정보를 찾을 수 없습니다." },
        { status: 400 },
      );
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
      });

      return NextResponse.json(
        { success: false, message: "결제 검증에 실패했습니다." },
        { status: 400 },
      );
    }

    const now = new Date();
    const expiresAt = addDays(now, product.durationDays);

    await db.runTransaction(async (tx) => {
      tx.update(orderRef, {
        status: "PAID",
        impUid,
        paidAt: now,
        verifiedAt: now,
        portonePayment: {
          pgProvider: payment.pg_provider || null,
          payMethod: payment.pay_method || null,
          receiptUrl: payment.receipt_url || null,
          cardName: payment.card_name || null,
        },
      });

      const userRef = db.collection("users").doc(decoded.uid);

      tx.set(
        userRef,
        {
          uid: decoded.uid,
          email: decoded.email || null,
          plan: product.plan,
          premiumActive: true,
          premiumStartedAt: now,
          premiumExpiresAt: expiresAt,
          lastPaymentMerchantUid: merchantUid,
          updatedAt: now,
        },
        { merge: true },
      );

      tx.set(userRef.collection("payments").doc(merchantUid), {
        impUid,
        merchantUid,
        productId: product.id,
        productName: product.name,
        amount: product.amount,
        status: "PAID",
        paidAt: now,
        expiresAt,
      });
    });

    return NextResponse.json({
      success: true,
      message: "결제가 완료되었습니다.",
      premiumExpiresAt: expiresAt,
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return NextResponse.json(
      { success: false, message: "결제 검증 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
