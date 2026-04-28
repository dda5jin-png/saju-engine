export const PRODUCTS = {
  decision_single: {
    id: "decision_single",
    name: "Decision Coach 정밀 분석 1회권",
    amount: 1900,
    plan: "credits",
    credits: 1,
  },
  decision_pack_3: {
    id: "decision_pack_3",
    name: "Decision Coach 정밀 분석 3회권",
    amount: 5500,
    plan: "credits",
    credits: 3,
  },
  decision_pack_5: {
    id: "decision_pack_5",
    name: "Decision Coach 정밀 분석 5회권",
    amount: 9000,
    plan: "credits",
    credits: 5,
  },
} as const;

export type ProductId = keyof typeof PRODUCTS;
