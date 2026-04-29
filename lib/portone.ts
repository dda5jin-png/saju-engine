import { PaymentClient } from "@portone/server-sdk";

export type PortOnePaymentInfo = {
  paymentId: string;
  transactionId: string | null;
  amount: number;
  status: string;
  pgProvider?: string | null;
  payMethod?: string | null;
  receiptUrl?: string | null;
  cardName?: string | null;
};

function getPortOnePaymentClient() {
  const secret = process.env.PORTONE_API_SECRET;
  const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;

  if (!secret) {
    throw new Error("Missing PORTONE_API_SECRET");
  }

  return PaymentClient({ secret, storeId });
}

function getPaymentMethodLabel(method: unknown) {
  if (!method || typeof method !== "object") return null;

  const typed = method as { type?: unknown; card?: { name?: unknown }; easyPay?: { provider?: unknown } };
  const type = typeof typed.type === "string" ? typed.type : null;
  const cardName = typeof typed.card?.name === "string" ? typed.card.name : null;
  const easyPay = typeof typed.easyPay?.provider === "string" ? typed.easyPay.provider : null;

  return cardName || easyPay || type;
}

export async function getPaymentInfo(paymentId: string): Promise<PortOnePaymentInfo> {
  const payment = await getPortOnePaymentClient().getPayment({ paymentId });
  const amount = "amount" in payment && payment.amount ? payment.amount.paid || payment.amount.total : 0;
  const channel = "channel" in payment ? payment.channel : null;
  const method = "method" in payment ? payment.method : null;

  return {
    paymentId: "id" in payment && typeof payment.id === "string" ? payment.id : paymentId,
    transactionId:
      "transactionId" in payment && typeof payment.transactionId === "string"
        ? payment.transactionId
        : null,
    amount,
    status: typeof payment.status === "string" ? payment.status : "UNKNOWN",
    pgProvider: channel?.pgProvider || null,
    payMethod: getPaymentMethodLabel(method),
    receiptUrl:
      "receiptUrl" in payment && typeof payment.receiptUrl === "string" ? payment.receiptUrl : null,
    cardName: getPaymentMethodLabel(method),
  };
}
