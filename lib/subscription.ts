import { getAdminDb } from "@/lib/firebaseAdmin";

type UserSubscription = {
  premiumActive?: boolean;
  premiumExpiresAt?: { toDate?: () => Date } | Date | null;
};

export function toDate(value: unknown) {
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toDate" in value) {
    const maybeTimestamp = value as { toDate?: () => Date };
    return maybeTimestamp.toDate?.() ?? null;
  }
  return null;
}

export function isPremiumUser(user: UserSubscription | undefined) {
  const expiresAt = toDate(user?.premiumExpiresAt);

  return Boolean(
    user?.premiumActive === true &&
      expiresAt instanceof Date &&
      expiresAt.getTime() > Date.now(),
  );
}

export async function getUserSubscription(uid: string) {
  const userSnap = await getAdminDb().collection("users").doc(uid).get();
  if (!userSnap.exists) {
    return {
      premiumActive: false,
      plan: "free",
      premiumExpiresAt: null,
      decisionCoachUsed: 0,
    };
  }

  const user = userSnap.data() ?? {};
  const expiresAt = toDate(user.premiumExpiresAt);
  const premiumActive = isPremiumUser(user);

  return {
    premiumActive,
    plan: premiumActive ? user.plan ?? "premium" : "free",
    premiumExpiresAt: expiresAt,
    decisionCoachUsed: Number(user.decisionCoachUsed ?? 0),
  };
}
