import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addOrActivateUser, listUsers } from "@/lib/user";

function requireAdmin(session: any) {
    return !!session?.user && (session.user as any).role === "admin";
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const users = await listUsers();
    return NextResponse.json(users);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { github_login, role } = await req.json();
    if (!github_login) return NextResponse.json({ error: "github_login required" }, { status: 400 });

    const u = await addOrActivateUser(github_login, role === "admin" ? "admin" : "user");
    return NextResponse.json(u, { status: 201 });
}
