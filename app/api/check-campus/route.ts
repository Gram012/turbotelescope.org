import { NextResponse } from "next/server";

export async function GET() {
    try {
        const res = await fetch("http://wicapi.spa.umn.edu:5002", { method: "HEAD" });
        if (res.ok) return NextResponse.json({ reachable: true });
        return NextResponse.json({ reachable: false });
    } catch {
        return NextResponse.json({ reachable: false });
    }
}