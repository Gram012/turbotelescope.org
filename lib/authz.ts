// lib/authz.ts
import type { Session } from "next-auth";

export const SUPER_ADMINS = new Set(["gram012"]); // lowercase override

export function isAdminSession(session: Session | null) {
    const login = ((session?.user as any)?.login || "").toLowerCase();
    const role = (session?.user as any)?.role as "admin" | "user" | undefined;
    return SUPER_ADMINS.has(login) || role === "admin";
}

export function isActiveUser(session: Session | null) {
    if (!session) return false;
    if (isAdminSession(session)) return true;
    // optional: gate on a DB-active flag in session if you store it
    return true;
}
