export const PRODUCTS = {
  decision_single: {
    id: "decision_single",
    name: "오늘의 선택 가이드 1회권",
    amount: 1900,
    plan: "credits",
    credits: 1,
  },
  decision_pack_3: {
    id: "decision_pack_3",
    name: "오늘의 선택 가이드 3회권",
    amount: 5500,
    plan: "credits",
    credits: 3,
  },
  decision_pack_5: {
    id: "decision_pack_5",
    name: "오늘의 선택 가이드 5회권",
    amount: 9000,
    plan: "credits",
    credits: 5,
  },
} as const;

export type ProductId = keyof typeof PRODUCTS;
