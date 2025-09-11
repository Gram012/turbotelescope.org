import type { Session } from "next-auth";

export const SUPER_ADMINS = new Set(["gram012"]); // lowercase

// ✅ Type guard: narrows Session | null -> Session
export function isAdminSession(session: Session | null): session is Session {
    if (!session) return false;
    const login = ((session.user as any)?.login || "").toLowerCase();
    const role = (session.user as any)?.role;
    return role === "admin" || SUPER_ADMINS.has(login);
}

// Optional: also make an "active user" guard if you use it elsewhere
export function isActiveSession(session: Session | null): session is Session {
    if (!session) return false;
    const isActive = (session as any)?.is_active ?? true;
    const role = (session.user as any)?.role;
    return role === "admin" || isActive;
}
