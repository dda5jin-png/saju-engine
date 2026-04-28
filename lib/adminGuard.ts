import { getAdminAuth } from "@/lib/firebaseAdmin";
import { getBearerToken } from "@/lib/serverAuth";

export async function requireAdmin(req: Request) {
  const token = getBearerToken(req);

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  const decoded = await getAdminAuth().verifyIdToken(token);

  if (decoded.admin !== true) {
    throw new Error("FORBIDDEN");
  }

  return decoded;
}

export function adminErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  return {
    message,
    status: message === "FORBIDDEN" ? 403 : 401,
  };
}
