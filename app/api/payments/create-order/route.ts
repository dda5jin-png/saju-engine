import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { PRODUCTS, ProductId } from "@/lib/products";
import { verifyBearerToken } from "@/lib/serverAuth";

export async function POST(req: Request) {
  try {
    const decoded = await verifyBearerToken(req);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const { productId } = (await req.json()) as { productId?: ProductId };
    const product = productId ? PRODUCTS[productId] : null;

    if (!product) {
      return NextResponse.json(
        { success: false, message: "존재하지 않는 상품입니다." },
        { status: 400 },
      );
    }

    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
    const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

    if (!storeId || !channelKey) {
      return NextResponse.json(
        { success: false, message: "포트원 V2 결제 설정이 부족합니다." },
        { status: 500 },
      );
    }

    const paymentId = `saju-${Date.now()}-${randomUUID()}`;

    await getAdminDb().collection("paymentOrders").doc(paymentId).set({
      merchantUid: paymentId,
      paymentId,
      uid: decoded.uid,
      productId: product.id,
      productName: product.name,
      amount: product.amount,
      status: "READY",
      impUid: null,
      pgProvider: null,
      payMethod: null,
      receiptUrl: null,
      createdAt: new Date(),
      paidAt: null,
      cancelledAt: null,
      verifiedAt: null,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      merchantUid: paymentId,
      paymentId,
      storeId,
      channelKey,
      amount: product.amount,
      name: product.name,
      buyerEmail: decoded.email || "",
      buyerName: decoded.name || "사용자",
    });
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      { success: false, message: "주문 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
