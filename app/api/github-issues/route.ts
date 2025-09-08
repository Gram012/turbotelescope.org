// app/api/github-issues/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // see earlier step where we export options

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    if (!owner || !repo) {
        return NextResponse.json({ error: "Missing owner/repo" }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN || (session as any).accessToken;
    if (!token) {
        return NextResponse.json({ error: "No GitHub token available" }, { status: 500 });
    }

    const ghRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "User-Agent": "next-app",
                Accept: "application/vnd.github+json",
            },
            cache: "no-store",
        }
    );

    if (!ghRes.ok) {
        const text = await ghRes.text();
        return NextResponse.json({ error: "GitHub error", details: text }, { status: ghRes.status });
    }

    const issues = await ghRes.json();
    return NextResponse.json(issues);
}
