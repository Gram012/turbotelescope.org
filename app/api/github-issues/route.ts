import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) return NextResponse.json({ error: "No token" }, { status: 500 });

    const url = new URL(req.url);
    const owner = url.searchParams.get("owner") || "patkel";
    const repo = url.searchParams.get("repo") || "turbo_telescope";

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

    return NextResponse.json(Array.isArray(issues) ? issues : []);
}
