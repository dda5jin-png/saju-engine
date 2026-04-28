"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { getClientAuth } from "@/lib/auth";
import { PRODUCTS, ProductId } from "@/lib/products";

declare global {
  interface Window {
    IMP?: {
      init: (merchantCode?: string) => void;
      request_pay: (
        request: {
          pg: string;
          pay_method: string;
          merchant_uid: string;
          name: string;
          amount: number;
          buyer_email: string;
          buyer_name: string;
        },
        callback: (response: {
          imp_uid?: string;
          merchant_uid?: string;
          error_msg?: string;
        }) => void,
      ) => void;
    };
  }
}

type Props = {
  productId: ProductId;
  variant?: "primary" | "compact";
  onPaid?: () => void;
};

export default function PortOnePaymentButton({ productId, variant = "primary", onPaid }: Props) {
  const [loading, setLoading] = useState(false);
  const product = PRODUCTS[productId];

  useEffect(() => {
    if (document.getElementById("portone-sdk")) return;

    const script = document.createElement("script");
    script.id = "portone-sdk";
    script.src = "https://cdn.iamport.kr/v1/iamport.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const requestPay = async () => {
    try {
      setLoading(true);

      const user = getClientAuth().currentUser;

      if (!user) {
        alert("로그인 후 결제할 수 있습니다.");
        return;
      }

      const impCode = process.env.NEXT_PUBLIC_PORTONE_IMP_CODE;

      if (!impCode) {
        alert("결제 가맹점 코드가 설정되지 않았습니다.");
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

      if (!window.IMP) {
        alert("결제 모듈을 불러오지 못했습니다.");
        return;
      }

      window.IMP.init(impCode);
      window.IMP.request_pay(
        {
          pg: "html5_inicis",
          pay_method: "card",
          merchant_uid: orderData.merchantUid,
          name: product.name,
          amount: product.amount,
          buyer_email: orderData.buyerEmail || user.email || "",
          buyer_name: orderData.buyerName || user.displayName || "사용자",
        },
        async (rsp) => {
          if (!rsp.imp_uid || !rsp.merchant_uid) {
            alert(rsp.error_msg || "결제가 완료되지 않았습니다.");
            setLoading(false);
            return;
          }

          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              impUid: rsp.imp_uid,
              merchantUid: rsp.merchant_uid,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            alert("결제가 완료되었습니다. 프리미엄 분석이 열렸습니다.");
            onPaid?.();
            window.location.reload();
          } else {
            alert(verifyData.message || "결제 검증 실패");
          }

          setLoading(false);
        },
      );
    } catch (error) {
      console.error("PortOne payment error:", error);
      alert("결제 중 오류가 발생했습니다.");
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
