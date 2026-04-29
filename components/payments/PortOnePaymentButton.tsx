"use client";

import { useState } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { ArrowRight, Loader2 } from "lucide-react";
import { getClientAuth } from "@/lib/auth";
import { PRODUCTS, ProductId } from "@/lib/products";

type Props = {
  productId: ProductId;
  variant?: "primary" | "compact";
  onPaid?: () => void;
};

export default function PortOnePaymentButton({ productId, variant = "primary", onPaid }: Props) {
  const [loading, setLoading] = useState(false);
  const product = PRODUCTS[productId];

  const requestPay = async () => {
    try {
      setLoading(true);

      const user = getClientAuth().currentUser;

      if (!user) {
        alert("로그인 후 결제할 수 있습니다.");
        return;
      }

      const idToken = await user.getIdToken();
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ productId }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert(orderData.message || "주문 생성 실패");
        return;
      }

      if (!orderData.storeId || !orderData.channelKey || !orderData.paymentId) {
        alert("포트원 V2 결제 설정이 부족합니다.");
        return;
      }

      const payment = await PortOne.requestPayment({
        storeId: orderData.storeId,
        channelKey: orderData.channelKey,
        paymentId: orderData.paymentId,
        orderName: product.name,
        totalAmount: product.amount,
        currency: "KRW",
        payMethod: "CARD",
        customer: {
          customerId: user.uid,
          email: orderData.buyerEmail || user.email || undefined,
          fullName: orderData.buyerName || user.displayName || "사용자",
        },
        productType: "DIGITAL",
        redirectUrl: `${window.location.origin}/premium`,
        noticeUrls: [`${window.location.origin}/api/webhooks/portone`],
      } as Parameters<typeof PortOne.requestPayment>[0]);

      if (!payment) {
        alert("결제 결과 확인을 위해 잠시 후 새로고침해 주세요.");
        return;
      }

      if (payment.code) {
        alert(payment.message || "결제가 완료되지 않았습니다.");
        return;
      }

      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          paymentId: payment.paymentId || orderData.paymentId,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        alert(`결제가 완료되었습니다. 분석권 ${verifyData.credits || product.credits}회가 충전되었습니다.`);
        onPaid?.();
        window.location.reload();
      } else {
        alert(verifyData.message || "결제 검증 실패");
      }
    } catch (error) {
      console.error("PortOne payment error:", error);
      alert("결제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const compact = variant === "compact";

  return (
    <button
      onClick={requestPay}
      disabled={loading}
      className={
        compact
          ? "flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-black transition active:scale-95 disabled:opacity-50"
          : "group flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-white px-5 py-4 text-base font-black text-black shadow-lg transition hover:bg-gray-100 active:scale-95 disabled:opacity-50"
      }
    >
      {loading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
      {loading ? "결제 준비 중..." : `${product.name} ${product.amount.toLocaleString()}원`}
    </button>
  );
}
