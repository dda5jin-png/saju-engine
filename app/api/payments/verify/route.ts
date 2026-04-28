import { NextResponse } from "next/server";
import { applyVerifiedPayment } from "@/lib/paymentFulfillment";
import { getPaymentInfo, getPortOneAccessToken } from "@/lib/portone";
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

    const accessToken = await getPortOneAccessToken();
    const payment = await getPaymentInfo(impUid, accessToken);
    const result = await applyVerifiedPayment({ merchantUid, impUid, payment });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "결제 검증에 실패했습니다.", reason: result.reason },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: result.alreadyProcessed ? "이미 처리된 결제입니다." : "결제가 완료되었습니다.",
      credits: result.product?.credits ?? 0,
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return NextResponse.json(
      { success: false, message: "결제 검증 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
