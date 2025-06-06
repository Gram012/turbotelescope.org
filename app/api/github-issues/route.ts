import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");

    if (!owner || !repo) {
        return NextResponse.json({ error: "Missing owner or repo" }, { status: 400 });
    }

    try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_PAT}`,
                Accept: "application/vnd.github+json",
            },
            next: { revalidate: 60 }, // Cache for 60s (optional)
        });

        if (!res.ok) {
            const err = await res.json();
            return NextResponse.json({ error: err.message }, { status: res.status });
        }

        const issues = await res.json();
        return NextResponse.json(issues);
    } catch (err) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
