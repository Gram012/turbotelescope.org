import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { setUserActive, setUserRole, getUserByLogin } from "@/lib/user";

function requireAdmin(session: any) {
    return !!session?.user && (session.user as any).role === "admin";
}

export async function GET(_: Request, { params }: { params: { login: string } }) {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const u = await getUserByLogin(params.login);
    if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(u);
}

export async function PATCH(req: Request, { params }: { params: { login: string } }) {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { role, is_active } = body as { role?: "user" | "admin"; is_active?: boolean };

    let u = null;
    if (role) u = await setUserRole(params.login, role);
    if (typeof is_active === "boolean") u = await setUserActive(params.login, is_active);
    if (!u) return NextResponse.json({ error: "Not found or no change" }, { status: 404 });
    return NextResponse.json(u);
}
