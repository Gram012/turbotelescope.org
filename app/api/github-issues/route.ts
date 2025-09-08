// app/api/github-issues/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.login) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const owner = "patkel";
    const repo = "turbo_telescope";
    const me = (session.user as any).login as string;

    const { searchParams } = new URL(req.url);
    const filter = (searchParams.get("filter") || "assignee") as "creator" | "assignee";
    const state = searchParams.get("state") || "open";

    const token = (process.env.GITHUB_TOKEN ?? (session as any).accessToken ?? "").trim();
    if (!token) {
        return NextResponse.json({ error: "No GitHub token available" }, { status: 500 });
    }

    const url = new URL(`https://api.github.com/repos/${owner}/${repo}/issues`);
    url.searchParams.set("state", state);
    url.searchParams.set("per_page", "100");
    url.searchParams.set(filter, me); // "creator" (default) or "assignee"

    const ghRes = await fetch(url.toString(), {
        headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "next-app",
        },
        cache: "no-store",
    });

    if (!ghRes.ok) {
        const details = await ghRes.text();
        return NextResponse.json({ error: "GitHub error", details }, { status: ghRes.status });
    }

    // Strip PRs (GitHub returns PRs in the issues list)
    const raw = (await ghRes.json()) as any[];
    const issuesOnly = raw.filter((i) => !i.pull_request);

    return NextResponse.json(issuesOnly);
}
