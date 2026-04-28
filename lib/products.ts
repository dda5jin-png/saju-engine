export const PRODUCTS = {
  premium_monthly: {
    id: "premium_monthly",
    name: "사주엔진 프리미엄 월 이용권",
    amount: 4900,
    plan: "premium",
    durationDays: 30,
  },
  premium_3months: {
    id: "premium_3months",
    name: "사주엔진 프리미엄 3개월 이용권",
    amount: 12900,
    plan: "premium",
    durationDays: 90,
  },
} as const;

export type ProductId = keyof typeof PRODUCTS;
