import { NextResponse } from "next/server";
import { verifyBearerToken } from "@/lib/serverAuth";
import { getUserSubscription } from "@/lib/subscription";

export async function GET(req: Request) {
  try {
    const decoded = await verifyBearerToken(req);

    if (!decoded) {
      return NextResponse.json({
        premiumActive: false,
        plan: "free",
        premiumExpiresAt: null,
        paidDecisionCredits: 0,
      });
    }

    const subscription = await getUserSubscription(decoded.uid);

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Subscription lookup error:", error);

    return NextResponse.json({
      premiumActive: false,
      plan: "free",
      premiumExpiresAt: null,
      paidDecisionCredits: 0,
    });
  }
}
