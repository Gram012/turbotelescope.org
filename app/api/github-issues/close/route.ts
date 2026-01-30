import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const token = (process.env.GITHUB_TOKEN ?? "").trim();
    if (!token) {
        return NextResponse.json({ error: "No GitHub token available" }, { status: 500 });
    }

    const { issueNumber } = await req.json();
    if (!issueNumber) {
        return NextResponse.json({ error: "Missing issueNumber" }, { status: 400 });
    }

    const owner = "patkel";
    const repo = "turbo_telescope";

    const ghRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
                "User-Agent": "next-app",
            },
            body: JSON.stringify({ state: "closed" }),
        }
    );

    if (!ghRes.ok) {
        const details = await ghRes.text();
        return NextResponse.json({ error: "GitHub error", details }, { status: ghRes.status });
    }

    const updated = await ghRes.json();
    return NextResponse.json(updated);
}
