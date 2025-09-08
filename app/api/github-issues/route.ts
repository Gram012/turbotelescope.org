import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {

    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Hardcoded repo info
    const owner = "patkel";
    const repo = "turbo_telescope";

    // Prefer PAT for consistency
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
        const details = await ghRes.text();
        return NextResponse.json(
            { error: "GitHub error", status: ghRes.status, details },
            { status: ghRes.status }
        );
    }
    // --- DIAGNOSTIC START ---
    const whoAmI = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `token ${token}`, // ← try 'token' form
            Accept: "application/vnd.github+json",
            "User-Agent": "next-app",
        },
    });
    const whoText = await whoAmI.text();

    const repoMeta = await fetch(`https://api.github.com/repos/patkel/turbo_telescope`, {
        headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "next-app",
        },
    });
    const metaText = await repoMeta.text();

    if (!repoMeta.ok) {
        return NextResponse.json(
            {
                error: "Repo not visible to token",
                status: repoMeta.status,
                // Which user is the token for?
                tokenUserStatus: whoAmI.status,
                tokenUser: whoText, // look for "login": "...", "two_factor_authentication": ...
                // Scope headers help a lot:
                oauthScopesUser: whoAmI.headers.get("x-oauth-scopes"),
                oauthScopesRepo: repoMeta.headers.get("x-oauth-scopes"),
                acceptedScopesRepo: repoMeta.headers.get("x-accepted-oauth-scopes"),
                repoMeta: metaText,
            },
            { status: 404 }
        );
    }
    // --- DIAGNOSTIC END ---
    const issues = await ghRes.json();
    return NextResponse.json(issues);
}
