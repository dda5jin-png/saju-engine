import { getAdminDb } from "@/lib/firebaseAdmin";

type UserAccess = {
  premiumActive?: boolean;
  premiumExpiresAt?: { toDate?: () => Date } | Date | null;
  paidDecisionCredits?: number;
  freeDecisionCountToday?: number;
  freeDecisionDate?: string | null;
};

export function toDate(value: unknown) {
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toDate" in value) {
    const maybeTimestamp = value as { toDate?: () => Date };
    return maybeTimestamp.toDate?.() ?? null;
  }
  return null;
}

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getPaidDecisionCredits(user: UserAccess | undefined) {
  return Math.max(0, Number(user?.paidDecisionCredits ?? 0));
}

export function hasActivePeriodAccess(user: UserAccess | undefined) {
  const expiresAt = toDate(user?.premiumExpiresAt);
  return Boolean(
    user?.premiumActive === true &&
      expiresAt instanceof Date &&
      expiresAt.getTime() > Date.now(),
  );
}

export function isPremiumUser(user: UserAccess | undefined) {
  return hasActivePeriodAccess(user) || getPaidDecisionCredits(user) > 0;
}

export function canUseFreeDecision(user: UserAccess | undefined) {
  const today = getTodayKey();
  if (user?.freeDecisionDate !== today) return true;
  return Number(user?.freeDecisionCountToday ?? 0) < 1;
}

export async function getUserSubscription(uid: string) {
  const userSnap = await getAdminDb().collection("users").doc(uid).get();
  if (!userSnap.exists) {
    return {
      premiumActive: false,
      plan: "free",
      premiumExpiresAt: null,
      paidDecisionCredits: 0,
      canUseFreeDecision: true,
      freeDecisionCountToday: 0,
      freeDecisionDate: getTodayKey(),
      totalDecisionCount: 0,
    };
  }

  const user = userSnap.data() ?? {};
  const expiresAt = toDate(user.premiumExpiresAt);
  const paidDecisionCredits = getPaidDecisionCredits(user);
  const premiumActive = isPremiumUser(user);

  return {
    premiumActive,
    plan: premiumActive ? user.plan ?? "credits" : "free",
    premiumExpiresAt: expiresAt,
    paidDecisionCredits,
    canUseFreeDecision: canUseFreeDecision(user),
    freeDecisionCountToday: Number(user.freeDecisionCountToday ?? 0),
    freeDecisionDate: user.freeDecisionDate ?? null,
    totalDecisionCount: Number(user.totalDecisionCount ?? 0),
  };
}
