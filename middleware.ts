// middleware.ts
import type { NextRequest } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function middleware(request: NextRequest) {
    // If no session → redirect to /api/auth/login
    return await auth0.middleware(request);
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
