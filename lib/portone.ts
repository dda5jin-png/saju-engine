export type PortOnePaymentInfo = {
  merchant_uid: string;
  amount: number;
  status: string;
  pg_provider?: string;
  pay_method?: string;
  receipt_url?: string;
  card_name?: string;
  cancelled_at?: number;
};

export async function getPortOneAccessToken() {
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

export async function getPaymentInfo(impUid: string, accessToken: string): Promise<PortOnePaymentInfo> {
  const res = await fetch(`https://api.iamport.kr/payments/${impUid}`, {
    headers: {
      Authorization: accessToken,
    },
  });

  const data = await res.json();

  if (data.code !== 0) {
    throw new Error(data.message || "결제 정보 조회 실패");
  }

  return data.response as PortOnePaymentInfo;
}
