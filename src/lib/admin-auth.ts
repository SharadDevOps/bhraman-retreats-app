import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { isRoleAllowed } from "@/lib/cms-validation.mjs";

export const ADMIN_COOKIE = "bhraman_admin";
export type AdminRole = "CONTENT_EDITOR" | "BOOKING_MANAGER" | "SUPER_ADMIN";

function secret() {
  return process.env.ADMIN_SECRET ?? process.env.ADMIN_PASSWORD ?? "bhraman-dev-secret";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function makeToken(days = 7, role: AdminRole = "SUPER_ADMIN") {
  const exp = Date.now() + days * 86400_000;
  const payload = `${exp}.${role}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined) {
  if (!token) return false;
  const parts = token.split(".");
  const [expStr, role, sig] = parts.length === 3
    ? parts
    : [parts[0], "SUPER_ADMIN", parts[1]]; // Preserve existing signed admin sessions.
  const exp = Number(expStr);
  if (!exp || exp < Date.now() || !sig) return false;
  if (!isRoleAllowed(role, ["CONTENT_EDITOR", "BOOKING_MANAGER", "SUPER_ADMIN"])) return false;
  const payload = parts.length === 3 ? `${exp}.${role}` : String(exp);
  const expected = sign(payload);
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function getAdminSession(): Promise<{ role: AdminRole } | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!verifyToken(token)) return null;
  const parts = token?.split(".") ?? [];
  const role = (parts.length === 3 ? parts[1] : "SUPER_ADMIN") as AdminRole;
  return { role };
}

export async function hasAdminRole(allowedRoles: AdminRole[]) {
  const session = await getAdminSession();
  return Boolean(session && isRoleAllowed(session.role, allowedRoles));
}

export async function isAdmin() {
  return Boolean(await getAdminSession());
}
