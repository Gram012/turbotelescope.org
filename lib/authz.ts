// lib/authz.ts
import type { Session } from "next-auth";
export const SUPER_ADMINS = new Set(["gram012"]); // 👈 lowercase

export function isAdminSession(session: Session | null) {
    const loginRaw = (session?.user as any)?.login as string | undefined;
    const login = loginRaw?.toLowerCase(); // 👈 normalize
    const role = (session?.user as any)?.role as "admin" | "user" | undefined;
    return (login && SUPER_ADMINS.has(login)) || role === "admin";
}

export function isActiveUser(session: Session | null) {
    if (isAdminSession(session)) return true;
    return !!(session && (session.user as any)?.isActive);
}
