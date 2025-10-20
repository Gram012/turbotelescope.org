import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const owner = url.searchParams.get("owner") || "patkel";
    const repo = url.searchParams.get("repo") || "turbo_telescope";

    const token = process.env.GITHUB_TOKEN || (session as any).accessToken;
    if (!token) return NextResponse.json({ error: "No token" }, { status: 500 });

    const gh = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "turbo-app",
            Accept: "application/vnd.github+json",
        },
        cache: "no-store",
    });

    const issues = await gh.json().catch(() => []);
    if (!gh.ok) return NextResponse.json({ error: "GitHub error", details: issues }, { status: gh.status });

    const login = (session.user as any).login;
    const mine = Array.isArray(issues) ? issues.filter((i: any) => i?.user?.login?.toLowerCase() === login?.toLowerCase()) : [];

    return NextResponse.json(mine);
}
