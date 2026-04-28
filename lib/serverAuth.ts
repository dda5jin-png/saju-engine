import { getAdminAuth } from "@/lib/firebaseAdmin";

export function getBearerToken(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.replace("Bearer ", "");
}

export async function verifyBearerToken(req: Request) {
  const token = getBearerToken(req);
  if (!token) return null;
  return getAdminAuth().verifyIdToken(token);
}
